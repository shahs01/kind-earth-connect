
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMessages, Message } from "@/hooks/useMessages";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, User } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType } from "@/types";
import ProfileDialog from "@/components/ProfileDialog";
import { useToast } from "@/hooks/use-toast";

const MessageConversation = () => {
  const { userId } = useParams<{ userId: string }>();
  const { loading, messages, fetchMessages, sendMessage } = useMessages();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<UserType | null>(null);
  const [sending, setSending] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (userId) {
      fetchMessages(userId);
      fetchOtherUser(userId);
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${user?.id}`
          },
          (payload) => {
            // If message is from the current conversation, refresh messages
            if (payload.new.sender_id === userId) {
              fetchMessages(userId);
            } else {
              // If from someone else, show a notification
              toast({
                title: "New message",
                description: "You received a new message from another conversation",
              });
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId, user?.id, user]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const fetchOtherUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      const userData: UserType = {
        id: data.id,
        username: data.username || '',
        email: data.email || '',
        name: data.name || '',
        avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || '')}`,
        bio: data.bio || '',
        location: data.location || '',
        trustScore: data.trust_score || 0,
        helpOffered: data.help_offered || 0,
        helpReceived: data.help_received || 0,
        volunteerHours: data.volunteer_hours || 0,
        createdAt: new Date(data.created_at || Date.now()),
        verifiedStatus: data.verified_status || false,
        emailVerified: true,
        trustBadges: data.trust_badges || [],
        loginAttempts: 0,
        lastLoginAttempt: null
      };
      
      setOtherUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast({
        title: "Error",
        description: "Could not load user information",
        variant: "destructive"
      });
    }
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userId) return;
    
    setSending(true);
    try {
      await sendMessage(userId, newMessage.trim());
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleViewProfile = () => {
    if (otherUser) {
      setIsProfileOpen(true);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <>
      <div className="flex flex-col h-[70vh]">
        {/* Header */}
        <div 
          className="p-4 border-b border-gray-200 flex items-center cursor-pointer" 
          onClick={handleViewProfile}
        >
          {otherUser ? (
            <>
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                <AvatarFallback>{otherUser.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{otherUser.name || otherUser.username}</h3>
                {otherUser.location && (
                  <p className="text-xs text-gray-500">{otherUser.location}</p>
                )}
              </div>
            </>
          ) : loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            <span>Unknown user</span>
          )}
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No messages yet</p>
              <p className="text-sm mt-1">Start the conversation by sending a message</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender_id === user?.id
                        ? 'bg-thryvance-green text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                    <div
                      className={`text-xs mt-1 ${
                        message.sender_id === user?.id ? 'text-green-100' : 'text-gray-500'
                      }`}
                    >
                      {format(new Date(message.created_at), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex space-x-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={sending || loading}
              className="flex-1"
              autoFocus
            />
            <Button 
              type="submit" 
              disabled={sending || !newMessage.trim() || loading}
              className="bg-thryvance-green hover:bg-thryvance-green-dark"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>

      {otherUser && (
        <ProfileDialog 
          user={otherUser}
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
        />
      )}
    </>
  );
};

export default MessageConversation;
