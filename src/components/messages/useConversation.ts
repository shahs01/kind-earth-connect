
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMessages } from "@/hooks/useMessages";
import { useToast } from "@/hooks/use-toast";
import { useConversationProfile } from "./hooks/useConversationProfile";
import { useRealtime } from "@/hooks/useRealtime";
import { useConversationMessages } from "./hooks/useConversationMessages";
import { useConversationReconnect } from "./hooks/useConversationReconnect";
import { useAuth } from "@/context/AuthContext"; // Import useAuth instead of useAuthProfile

const useConversation = (userId?: string) => {
  const { user } = useAuth(); // Use useAuth to get the user
  const navigate = useNavigate();
  const { toast } = useToast();
  const [connectionError, setConnectionError] = useState(false);
  const channelRef = useRef<any>(null);
  
  const {
    otherUser,
    profileLoading,
    isProfileOpen, 
    setIsProfileOpen,
    fetchOtherUser, 
    handleReportUser
  } = useConversationProfile();

  const { 
    loading,
    messages,
    fetchMessages,
    sendMessage,
    markMessagesAsRead, 
    sending
  } = useMessages();

  // When a new message is received via realtime, add it to the messages list
  const handleMessageReceived = useCallback((message: any) => {
    console.log("Message received in conversation:", message);
  }, []);

  // Set up realtime subscription to listen for new messages
  const { setupRealtimeSubscription, isConnecting } = useRealtime({
    userId,
    currentUserId: user?.id,
    onMessageReceived: handleMessageReceived,
    setConnectionError,
    channelRef
  });

  // Set up reconnection handler
  const { isReconnecting, handleReconnect } = useConversationReconnect(
    fetchMessages,
    setupRealtimeSubscription,
    userId,
    channelRef,
    setConnectionError
  );

  // Set up message sending handler
  const { handleSendMessage } = useConversationMessages(
    sendMessage,
    fetchMessages,
    setConnectionError
  );

  // Fetch messages and set up realtime when the component mounts
  useEffect(() => {
    if (userId && user?.id) {
      console.log("Fetching messages for conversation:", userId);
      fetchMessages(userId).then(() => {
        console.log("Setting up realtime for conversation:", userId);
        const channel = setupRealtimeSubscription();
        console.log("Realtime channel set up:", !!channel);
      });
    }
    
    // Clean up realtime subscription when the component unmounts
    return () => {
      if (channelRef.current) {
        console.log("Cleaning up realtime subscription");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, user?.id, fetchMessages, setupRealtimeSubscription]);

  // Mark messages as read when the component mounts
  useEffect(() => {
    if (userId && messages.length > 0) {
      markMessagesAsRead(userId);
    }
  }, [userId, messages, markMessagesAsRead]);

  // Fetch other user profile when userId changes
  useEffect(() => {
    if (userId) {
      fetchOtherUser(userId);
    }
  }, [userId, fetchOtherUser]);

  return {
    user,
    otherUser,
    loading,
    profileLoading,
    messages,
    sending,
    isProfileOpen,
    setIsProfileOpen,
    connectionError,
    isReconnecting,
    handleSendMessage: (content: string) => handleSendMessage(userId!, content),
    handleReportUser,
    handleReconnect
  };
};

export default useConversation;

// Add missing import
import { supabase } from "@/integrations/supabase/client";
