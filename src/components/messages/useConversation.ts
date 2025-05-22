import { useState, useEffect, useCallback, useRef } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/context/AuthContext";
import { User as UserType } from "@/types";
import { useRealtime } from "@/hooks/useRealtime";
import { Message } from "@/hooks/useConversations";
import { useConversationProfile } from "./hooks/useConversationProfile";
import { useConversationReconnect } from "./hooks/useConversationReconnect";
import { useConversationMessages } from "./hooks/useConversationMessages";

export const useConversation = (userId: string | undefined) => {
  const { loading, messages, fetchMessages, sendMessage, markMessagesAsRead, connectionError, setConnectionError, sending } = useMessages();
  const { user } = useAuth();
  const channelRef = useRef<any>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  // Importing refactored hooks
  const { 
    otherUser, 
    profileLoading, 
    isProfileOpen, 
    setIsProfileOpen, 
    fetchOtherUser, 
    handleReportUser 
  } = useConversationProfile();
  
  // Handle message reception from real-time
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
  
  // Set up real-time
  const { setupRealtimeSubscription, isConnecting } = useRealtime({
    userId,
    currentUserId: user?.id,
    onMessageReceived: handleMessageReceived,
    setConnectionError,
    channelRef
  });
  
  // Set up reconnect functionality
  const { handleReconnect } = useConversationReconnect(
    fetchMessages,
    setupRealtimeSubscription,
    userId,
    channelRef,
    setConnectionError
  );
  
  // Set up message sending functionality
  const { handleSendMessage } = useConversationMessages(
    sendMessage,
    fetchMessages,
    setConnectionError
  );
  
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
  }, [userId, user, fetchMessages, markMessagesAsRead, setConnectionError, setupRealtimeSubscription, fetchOtherUser]);

  const wrappedHandleSendMessage = useCallback((message: string) => {
    if (userId) {
      handleSendMessage(userId, message);
    }
  }, [handleSendMessage, userId]);

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
    handleSendMessage: wrappedHandleSendMessage,
    handleReportUser,
    handleReconnect
  };
};

export default useConversation;
