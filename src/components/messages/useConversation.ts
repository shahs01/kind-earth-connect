
import { useState, useEffect, useCallback, useRef } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/context/AuthContext";
import { User as UserType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtime } from "@/hooks/useRealtime";
import { Message } from "@/hooks/useConversations";

export const useConversation = (userId: string | undefined) => {
  const { loading, messages, fetchMessages, sendMessage, markMessagesAsRead, connectionError, setConnectionError, sending } = useMessages();
  const { user } = useAuth();
  const [otherUser, setOtherUser] = useState<UserType | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  
  const handleMessageReceived = useCallback((newMessage: Message) => {
    if (!userId || !user) return;
    
    console.log("Conversation: Received message via real-time:", newMessage);
    
    // Mark as read if the received message is from the current conversation partner
    if (newMessage.sender_id === userId && user.id === newMessage.receiver_id) {
      console.log("Marking message as read, it's from current conversation partner");
      markMessagesAsRead(userId);
    }
    
    // Refresh messages to include the new one
    console.log("Refreshing messages after receiving new message");
    fetchMessages(userId);
  }, [userId, fetchMessages, markMessagesAsRead, user]);
  
  const { setupRealtimeSubscription, isConnecting } = useRealtime({
    userId,
    currentUserId: user?.id,
    onMessageReceived: handleMessageReceived,
    setConnectionError
  });
  
  // Load messages when conversation changes
  useEffect(() => {
    if (!user || !userId) {
      console.log("Missing user or userId, cannot load conversation");
      return;
    }
    
    console.log(`Setting up message conversation with userId: ${userId}`);
    
    // Load initial messages
    const loadMessages = async () => {
      try {
        console.log("Loading initial messages for conversation");
        setIsReconnecting(false);
        const messagesData = await fetchMessages(userId);
        console.log("Initial messages loaded:", messagesData?.length);
        
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
    console.log("Setting up real-time subscription from useConversation");
    setupRealtimeSubscription();
    
    return () => {
      // Clean up subscription when component unmounts or userId changes
      if (channelRef.current) {
        console.log("Removing channel on conversation change or unmount");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, user, fetchMessages, markMessagesAsRead, toast, setConnectionError, setupRealtimeSubscription]);

  // Separate function to fetch profile information
  const fetchOtherUser = async (userId: string) => {
    try {
      setProfileLoading(true);
      console.log("Fetching user profile for:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
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
    } finally {
      setProfileLoading(false);
    }
  };
  
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !userId) {
      console.log("Cannot send empty message or missing userId");
      return;
    }
    
    console.log("Sending message to userId:", userId);
    try {
      // Clear any previous connection error state
      setConnectionError(false);
      
      // Send the message using the hook
      const sentMessage = await sendMessage(userId, message.trim());
      console.log("Message sent successfully:", sentMessage);
      
      // Important: Refresh messages after sending
      console.log("Refreshing messages after sending");
      await fetchMessages(userId);
      
      // Show success toast
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setConnectionError(true);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
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
    loading: loading || isConnecting || profileLoading,
    profileLoading,
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
