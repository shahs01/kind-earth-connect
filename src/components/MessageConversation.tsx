
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMessages, Message } from "@/hooks/useMessages";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, User, Flag, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType } from "@/types";
import ProfileDialog from "@/components/ProfileDialog";
import { useToast } from "@/hooks/use-toast";

interface MessageConversationProps {
  onViewProfile?: (userId: string) => void;
}

const MessageConversation = ({ onViewProfile }: MessageConversationProps) => {
  const { userId } = useParams<{ userId: string }>();
  const { loading, messages, fetchMessages, sendMessage, markMessagesAsRead, connectionError, setConnectionError } = useMessages();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<UserType | null>(null);
  const [sending, setSending] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user is authenticated and has a valid userId
  useEffect(() => {
    if (!user) {
      console.log("No authenticated user, redirecting to login");
      navigate('/login');
      return;
    }

    if (!userId) {
      console.log("No userId provided in the URL");
      return;
    }
  }, [user, userId, navigate]);

  // Function to set up real-time subscription
  const setupRealtimeSubscription = useCallback(() => {
    if (!user || !userId) return null;
    
    console.log(`Setting up message conversation real-time subscription with userId: ${userId}`);
    
    try {
      // Clean up any existing subscription
      if (channelRef.current) {
        console.log("Removing existing channel before creating a new one");
        supabase.removeChannel(channelRef.current);
      }
      
      // Create a new subscription with a unique channel name
      const channelName = `messages:${user.id}-${userId}`;
      console.log(`Creating new channel: ${channelName}`);
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id}))`
          },
          (payload) => {
            console.log("Received real-time message update:", payload);
            const newMessage = payload.new as Message;
            
            // Update our messages state immediately
            fetchMessages(userId);
            
            // If we received the message, mark it as read
            if (newMessage.sender_id === userId && newMessage.receiver_id === user.id) {
              markMessagesAsRead(userId);
            }
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${channelName}:`, status);
          if (status === 'SUBSCRIBED') {
            setConnectionError(false);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error(`Realtime subscription error for ${channelName}:`, status);
            setConnectionError(true);
            toast({
              title: "Connection issue",
              description: "Problem connecting to real-time updates",
              variant: "destructive"
            });
          }
        });
      
      // Store the channel reference so we can clean it up later
      channelRef.current = channel;
      return channel;
    } catch (err) {
      console.error("Error setting up real-time subscription:", err);
      setConnectionError(true);
      return null;
    }
  }, [userId, user, fetchMessages, markMessagesAsRead, toast, setConnectionError]);

  // Fetch messages and set up real-time subscriptions
  useEffect(() => {
    if (!user || !userId) return;
    
    console.log(`Setting up message conversation with userId: ${userId}`);
    
    // Load initial messages
    const loadMessages = async () => {
      try {
        setIsReconnecting(false);
        await fetchMessages(userId);
        await markMessagesAsRead(userId);
      } catch (err) {
        console.error("Error loading messages:", err);
        setConnectionError(true);
        toast({
          title: "Connection error",
          description: "Could not load messages. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    loadMessages();
    fetchOtherUser(userId);
    
    // Set up real-time subscription
    const channel = setupRealtimeSubscription();
    
    return () => {
      console.log("Cleaning up message conversation");
      if (channelRef.current) {
        console.log("Removing channel on component unmount");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, user, fetchMessages, markMessagesAsRead, toast, setupRealtimeSubscription]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const fetchOtherUser = async (userId: string) => {
    try {
      console.log("Fetching user profile for:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Could not load user information",
          variant: "destructive"
        });
        return;
      }
      
      console.log("User profile fetched:", data);
      
      if (!data) {
        toast({
          title: "User not found",
          description: "The user profile could not be found",
          variant: "destructive"
        });
        return;
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
    if (!newMessage.trim() || !userId) {
      console.log("Cannot send empty message or missing userId");
      return;
    }
    
    console.log("Sending message to userId:", userId);
    setSending(true);
    try {
      await sendMessage(userId, newMessage.trim());
      console.log("Message sent successfully");
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleViewProfile = () => {
    if (otherUser) {
      if (onViewProfile) {
        onViewProfile(otherUser.id);
      } else {
        setIsProfileOpen(true);
      }
    }
  };

  const handleReportUser = () => {
    if (!otherUser) return;
    
    const event = new CustomEvent('report-user', { 
      detail: { userId: otherUser.id } 
    });
    window.dispatchEvent(event);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      // Remove existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      // Reload messages
      await fetchMessages(userId as string);
      
      // Set up a new real-time connection
      setupRealtimeSubscription();
      
      toast({
        title: "Reconnected",
        description: "Successfully reconnected to the messaging service",
      });
      
      setConnectionError(false);
    } catch (err) {
      console.error("Error reconnecting:", err);
      toast({
        title: "Reconnection failed",
        description: "Please try again or reload the page",
        variant: "destructive"
      });
    } finally {
      setIsReconnecting(false);
    }
  };
  
  // Show connection error or redirect if no user
  if (!user) {
    return <div className="p-8 text-center">Please log in to view messages</div>;
  }

  if (connectionError) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 className="text-xl font-medium mb-2">Connection Error</h3>
        <p className="text-gray-500 mb-4">Unable to load conversation</p>
        <div className="flex gap-3">
          <Button onClick={handleReconnect} disabled={isReconnecting} className="flex items-center gap-2">
            {isReconnecting ? 
              <Loader2 className="h-4 w-4 animate-spin" /> : 
              <RefreshCcw className="h-4 w-4" />
            }
            {isReconnecting ? "Reconnecting..." : "Reconnect"}
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex flex-col h-[70vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div 
            className="flex items-center cursor-pointer hover:bg-gray-50 rounded-md p-2" 
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
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={handleViewProfile}
            >
              View Profile
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleReportUser}
            >
              <Flag className="h-4 w-4 mr-1" />
              Report
            </Button>
          </div>
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

      {otherUser && !onViewProfile && (
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
