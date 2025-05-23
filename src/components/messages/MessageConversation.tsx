
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Loader2, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message, User } from "@/hooks/useMessages";

const MessageConversation = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<User | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [userId]);

  // Load conversation when userId changes
  useEffect(() => {
    if (!userId || !user) return;

    const loadConversation = async () => {
      setLoading(true);
      try {
        console.log("Loading conversation with user:", userId);
        
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!sender_id(*),
            receiver:profiles!receiver_id(*)
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error("Error fetching messages:", messagesError);
          toast({
            title: "Error",
            description: "Failed to load messages",
            variant: "destructive"
          });
          return;
        }

        console.log("Loaded messages:", messagesData?.length || 0);
        setMessages(messagesData || []);

        // Fetch other user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else {
          setOtherUser(profileData);
        }

        // Mark messages as read
        const { error: readError } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('sender_id', userId)
          .eq('receiver_id', user.id)
          .eq('read', false);

        if (readError) {
          console.error("Error marking messages as read:", readError);
        }

      } catch (error) {
        console.error("Error loading conversation:", error);
        toast({
          title: "Error",
          description: "Failed to load conversation",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [userId, user, toast]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userId || !user) return;

    console.log("Setting up real-time subscription for messages");
    
    const channel = supabase
      .channel(`messages-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id}))`
        },
        async (payload) => {
          console.log("New message received:", payload);
          
          // Fetch the complete message with profile data
          const { data: newMessage, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!sender_id(*),
              receiver:profiles!receiver_id(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && newMessage) {
            setMessages(prev => {
              // Check if message already exists
              if (prev.some(msg => msg.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Real-time subscription status:", status);
      });

    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [userId, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId || !user || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX

    try {
      console.log("Sending message:", messageContent);
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: userId,
          content: messageContent,
          read: false
        })
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*)
        `)
        .single();

      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive"
        });
        // Restore message content on error
        setNewMessage(messageContent);
        return;
      }

      console.log("Message sent successfully:", data);
      
      // The real-time subscription will handle adding the message to the UI
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      setNewMessage(messageContent);
    } finally {
      setSending(false);
      // Refocus textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green mb-4" />
        <p className="text-gray-500">Loading conversation...</p>
      </div>
    );
  }

  return (
    <>
      {/* Conversation Header */}
      <div className="border-b border-gray-200 p-4 flex items-center">
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser?.avatar || ''} alt={otherUser?.name || 'User'} />
          <AvatarFallback>
            {otherUser?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h3 className="font-semibold text-gray-900">
            {otherUser?.name || 'User'}
          </h3>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isCurrentUser = message.sender_id === user?.id;
              const isSameSenderAsPrevious = index > 0 && 
                messages[index - 1].sender_id === message.sender_id;
              
              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} ${
                    isSameSenderAsPrevious ? 'mt-1' : 'mt-4'
                  }`}
                >
                  {!isCurrentUser && !isSameSenderAsPrevious && (
                    <Avatar className="h-8 w-8 mb-1 flex-shrink-0">
                      <AvatarImage src={message.sender?.avatar || ''} alt={message.sender?.name || 'User'} />
                      <AvatarFallback>
                        {message.sender?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {!isCurrentUser && isSameSenderAsPrevious && (
                    <div className="w-8 flex-shrink-0"></div> 
                  )}
                  
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isCurrentUser
                        ? 'bg-thryvance-green text-white rounded-br-none'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line break-words">{message.content}</p>
                    <div
                      className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-green-100' : 'text-gray-500'
                      }`}
                    >
                      {format(new Date(message.created_at), 'h:mm a')}
                    </div>
                  </div>
                  
                  {isCurrentUser && !isSameSenderAsPrevious && (
                    <Avatar className="h-8 w-8 mb-1 flex-shrink-0">
                      <AvatarImage src={user?.avatar || ''} alt={user?.name || 'You'} />
                      <AvatarFallback>
                        {user?.name?.charAt(0) || 'Y'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {isCurrentUser && isSameSenderAsPrevious && (
                    <div className="w-8 flex-shrink-0"></div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-2">
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 min-h-[40px] max-h-[120px] resize-none"
            disabled={sending}
            rows={1}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
            size="sm"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default MessageConversation;
