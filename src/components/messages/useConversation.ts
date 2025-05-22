
import { useState, useCallback, useEffect, useRef } from "react";
import { useMessages, Message } from "@/hooks/useMessages";
import { useAuth } from "@/context/AuthContext";
import { User as UserType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useConversation = (userId: string | undefined) => {
  const { loading, messages, fetchMessages, sendMessage, markMessagesAsRead, connectionError, setConnectionError } = useMessages();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<UserType | null>(null);
  const [sending, setSending] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const channelRef = useRef<any>(null);
  const { toast } = useToast();
  
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
  
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !userId) {
      console.log("Cannot send empty message or missing userId");
      return;
    }
    
    console.log("Sending message to userId:", userId);
    setSending(true);
    try {
      await sendMessage(userId, message.trim());
      console.log("Message sent successfully");
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

  const handleReportUser = () => {
    if (!otherUser) return;
    
    const event = new CustomEvent('report-user', { 
      detail: { userId: otherUser.id } 
    });
    window.dispatchEvent(event);
  };

  return {
    user,
    otherUser,
    loading,
    messages,
    sending,
    isProfileOpen,
    setIsProfileOpen,
    connectionError,
    isReconnecting,
    handleSendMessage,
    handleReportUser,
    handleReconnect
  };
};

export default useConversation;
