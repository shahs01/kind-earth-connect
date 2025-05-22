
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMessages } from "@/hooks/useMessages";
import { useToast } from "@/hooks/use-toast";
import { useConversationProfile } from "./hooks/useConversationProfile";
import { useRealtime } from "@/hooks/useRealtime";
import { useConversationMessages } from "./hooks/useConversationMessages";
import { useConversationReconnect } from "./hooks/useConversationReconnect";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

const useConversation = (userId?: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [connectionError, setConnectionError] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const previousUserIdRef = useRef<string | undefined>(undefined);
  const loadingRef = useRef<boolean>(false);
  
  const {
    otherUser,
    profileLoading,
    isProfileOpen, 
    setIsProfileOpen,
    fetchOtherUser, 
    handleReportUser
  } = useConversationProfile();

  const { 
    loading: messagesLoading,
    messages,
    fetchMessages,
    sendMessage,
    markMessagesAsRead, 
    sending
  } = useMessages();

  // When a new message is received via realtime, add it to the messages list
  const handleMessageReceived = useCallback((message: any) => {
    console.log("Message received in conversation:", message);
    // The actual handling is in useMessages through the addMessageToState function
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

  // Clean up previous connection when switching conversations
  useEffect(() => {
    // If the userId has changed and there was a previous channel
    if (previousUserIdRef.current !== userId && channelRef.current) {
      console.log("Cleaning up previous realtime subscription before creating a new one");
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    previousUserIdRef.current = userId;
  }, [userId]);

  // Fetch messages and set up realtime when the component mounts or userId changes
  useEffect(() => {
    if (!userId || !user?.id) return;
    
    // Prevent multiple concurrent loads
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    console.log("Fetching messages for conversation:", userId);
    
    // Use an async function to handle the sequential loading with optimization
    const loadConversation = async () => {
      try {
        // Add a small delay to avoid UI freezing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Step 1: Fetch other user profile first
        await fetchOtherUser(userId);
        
        // Step 2: Fetch messages
        await fetchMessages(userId);
        
        // Step 3: Setup realtime only after messages are loaded
        console.log("Setting up realtime for conversation:", userId);
        const channel = setupRealtimeSubscription();
        if (channel) {
          channelRef.current = channel;
        }
        console.log("Realtime channel set up:", !!channel);
        
        // Step 4: Mark messages as read
        await markMessagesAsRead(userId);
        
        setConnectionError(false);
      } catch (error) {
        console.error("Error loading conversation:", error);
        setConnectionError(true);
      } finally {
        loadingRef.current = false;
      }
    };
    
    loadConversation();
    
    // Clean up realtime subscription when the component unmounts or userId changes
    return () => {
      if (channelRef.current) {
        console.log("Cleaning up realtime subscription on unmount/userId change");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      loadingRef.current = false;
    };
  }, [userId, user?.id, fetchMessages, setupRealtimeSubscription, markMessagesAsRead, fetchOtherUser]);

  return {
    user,
    otherUser,
    loading: messagesLoading || isConnecting || profileLoading, // Combine all loading states
    profileLoading,
    messages,
    sending,
    isProfileOpen,
    setIsProfileOpen,
    connectionError,
    isReconnecting,
    handleSendMessage: (content: string) => {
      if (userId) {
        return handleSendMessage(userId, content);
      }
      return Promise.reject(new Error("No user ID provided"));
    },
    handleReportUser,
    handleReconnect
  };
};

export default useConversation;
