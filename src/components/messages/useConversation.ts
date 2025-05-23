
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMessages, Message } from "@/hooks/useMessages";
import { useToast } from "@/hooks/use-toast";
import { useConversationProfile } from "./hooks/useConversationProfile";
import { useConversationReconnect } from "./hooks/useConversationReconnect";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLocalMessages } from "./hooks/useLocalMessages";
import { useConversationRealtime } from "./hooks/useConversationRealtime";
import { useMessageSending } from "./hooks/useMessageSending";
import { useConversationActions } from "./hooks/useConversationActions";

const useConversation = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connectionError, setConnectionError] = useState(false);
  const previousUserIdRef = useRef<string | undefined>(undefined);
  const loadingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  
  // Get local messages state management
  const {
    localMessages,
    setLocalMessages,
    handleMessageReceived,
    clearLocalMessages
  } = useLocalMessages();
  
  // Set up profile related functionality
  const {
    otherUser,
    profileLoading,
    isProfileOpen, 
    setIsProfileOpen,
    fetchOtherUser, 
    handleReportUser
  } = useConversationProfile();

  // Get message-related functionality from useMessages
  const { 
    loading: messagesLoading,
    messages,
    fetchMessages,
    sendMessage,
    markMessagesAsRead, 
    sending,
    setMessages
  } = useMessages();

  // Set up realtime subscription
  const {
    channelRef,
    setupRealtimeSubscription,
    isConnecting
  } = useConversationRealtime({
    userId,
    currentUserId: user?.id,
    onMessageReceived: handleMessageReceived,
    setConnectionError
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
  const { handleSendMessage } = useMessageSending({
    sendMessage,
    setLocalMessages,
    userId
  });

  // Clear messages for both local and server state
  const clearAllMessages = useCallback(() => {
    clearLocalMessages();
    setMessages([]);
  }, [clearLocalMessages, setMessages]);

  // Set up conversation actions (delete, archive)
  const { handleDeleteConversation } = useConversationActions({
    userId,
    currentUserId: user?.id,
    clearMessages: clearAllMessages
  });

  // Merge messages from server and local state
  useEffect(() => {
    if (messages.length > 0) {
      console.log(`Merging ${messages.length} server messages with ${localMessages.length} local messages`);
      
      // Create a combined message array with no duplicates
      const combinedMessages = [...messages];
      
      // Add local messages that aren't already in the combined array
      localMessages.forEach(localMsg => {
        if (!combinedMessages.some(msg => msg.id === localMsg.id)) {
          combinedMessages.push(localMsg);
        }
      });
      
      // Sort by created_at date
      combinedMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      // Update server messages state with combined messages
      setMessages(combinedMessages);
    }
  }, [messages, localMessages, setMessages]);

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

  // Clear messages when switching conversations
  useEffect(() => {
    if (previousUserIdRef.current !== userId) {
      console.log("Conversation changed, clearing message state");
      clearLocalMessages();
      setMessages([]);
    }
  }, [userId, setMessages, clearLocalMessages]);

  // Component lifecycle tracking
  useEffect(() => {
    console.log("useConversation hook initialized with userId:", userId);
    isMountedRef.current = true;
    
    return () => {
      console.log("useConversation hook cleanup for userId:", userId);
      isMountedRef.current = false;
    };
  }, [userId]);

  // Fetch messages and set up realtime when the component mounts or userId changes
  useEffect(() => {
    if (!userId || !user?.id || !isMountedRef.current) return;
    
    // Prevent multiple concurrent loads
    if (loadingRef.current) {
      console.log("Already loading conversation, skipping redundant load");
      return;
    }
    
    loadingRef.current = true;
    console.log("Fetching messages for conversation:", userId);
    
    // Use an async function to handle the sequential loading with optimization
    const loadConversation = async () => {
      try {
        // Add a small delay to avoid UI freezing
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Step 1: Fetch other user profile first
        console.log("Fetching other user profile");
        await fetchOtherUser(userId);
        
        if (!isMountedRef.current) {
          console.log("Component unmounted during profile fetch, aborting");
          return;
        }
        
        // Step 2: Fetch messages
        console.log("Fetching messages");
        const fetchedMessages = await fetchMessages(userId);
        
        if (!isMountedRef.current) {
          console.log("Component unmounted during message fetch, aborting");
          return;
        }
        
        // Ensure we have the full message list
        if (fetchedMessages && fetchedMessages.length > 0) {
          console.log(`Received ${fetchedMessages.length} messages from server`);
        } else {
          console.log("No messages found for this conversation");
        }
        
        // Step 3: Setup realtime only after messages are loaded
        console.log("Setting up realtime for conversation:", userId);
        const channel = setupRealtimeSubscription();
        if (channel && isMountedRef.current) {
          channelRef.current = channel;
          console.log("Realtime channel set up successfully");
        }
        
        // Step 4: Mark messages as read
        console.log("Marking messages as read");
        await markMessagesAsRead(userId);
        
        if (isMountedRef.current) {
          setConnectionError(false);
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
        if (isMountedRef.current) {
          setConnectionError(true);
        }
      } finally {
        if (isMountedRef.current) {
          loadingRef.current = false;
        }
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
    messages: messages.length > 0 ? messages : localMessages, // Use server messages if available, otherwise use local
    sending,
    isProfileOpen,
    setIsProfileOpen,
    connectionError,
    isReconnecting,
    handleSendMessage,
    handleReportUser,
    handleDeleteConversation,
    handleReconnect
  };
};

export default useConversation;
