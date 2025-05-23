
import { useState, useCallback, useRef, useEffect } from "react";
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
import { useMessageSync } from "./hooks/useMessageSync";

const useConversation = (userId?: string) => {
  const { user } = useAuth();
  const [connectionError, setConnectionError] = useState(false);
  const previousUserIdRef = useRef<string | undefined>(undefined);
  const channelRef = useRef<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
    setupRealtimeSubscription,
    isConnecting,
    channelRef: realtimeChannelRef
  } = useConversationRealtime({
    userId,
    currentUserId: user?.id,
    onMessageReceived: handleMessageReceived,
    setConnectionError
  });

  // Update the ref when channelRef changes
  useEffect(() => {
    if (realtimeChannelRef.current) {
      channelRef.current = realtimeChannelRef.current;
    }
  }, [realtimeChannelRef]);

  // Set up reconnection handler
  const { isReconnecting, handleReconnect } = useConversationReconnect(
    fetchMessages,
    setupRealtimeSubscription,
    userId,
    channelRef,
    setConnectionError
  );

  // Set up message sending handler
  const { handleSendMessage: sendMessageHandler, isSending } = useMessageSending({
    sendMessage,
    setLocalMessages,
    userId
  });

  // Enhanced message sending function with better error handling
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !userId) {
      toast({
        title: "Error",
        description: !content.trim() ? "Cannot send empty message" : "No receiver selected",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await sendMessageHandler(content);
      return result;
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  }, [sendMessageHandler, userId, toast]);

  // Clear messages for both local and server state
  const clearAllMessages = useCallback(() => {
    clearLocalMessages();
    setMessages([]);
  }, [clearLocalMessages, setMessages]);

  // Set up conversation actions (delete, archive)
  const { handleDeleteConversation, handleArchiveConversation } = useConversationActions({
    userId,
    currentUserId: user?.id,
    clearMessages: clearAllMessages,
    navigate
  });
  
  // Load conversation and set up realtime when userId changes
  useEffect(() => {
    if (!userId || !user?.id) {
      console.log("useConversation: Missing userId or user.id", { userId, userExists: !!user?.id });
      return;
    }
    
    console.log(`useConversation: Setting up conversation with userId: ${userId}`);
    let isMounted = true;
    
    const loadConversationData = async () => {
      try {
        console.log("useConversation: Starting to load conversation data");
        
        // First fetch other user profile
        console.log("useConversation: Fetching other user profile");
        await fetchOtherUser(userId);
        
        // Then fetch messages
        if (isMounted) {
          console.log("useConversation: Fetching messages");
          const fetchedMessages = await fetchMessages(userId);
          console.log(`useConversation: Loaded ${fetchedMessages.length} messages`);
          
          // Set up realtime only after messages are loaded
          if (isMounted) {
            console.log("useConversation: Setting up realtime subscription");
            setupRealtimeSubscription();
          }
          
          // Mark messages as read
          console.log("useConversation: Marking messages as read");
          await markMessagesAsRead(userId);
        }
      } catch (error) {
        console.error("useConversation: Error loading conversation data:", error);
        if (isMounted) {
          setConnectionError(true);
          toast({
            title: "Error",
            description: "Failed to load conversation. Please try again.",
            variant: "destructive"
          });
        }
      }
    };
    
    loadConversationData();
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (channelRef.current) {
        console.log("useConversation: Removing channel on conversation cleanup");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, user?.id, fetchOtherUser, fetchMessages, setupRealtimeSubscription, markMessagesAsRead, setConnectionError, toast]);
  
  // Handle message sync between local and server state
  useMessageSync(
    messages,
    localMessages,
    setMessages,
    previousUserIdRef,
    userId,
    clearLocalMessages
  );

  // Combine loading states
  const loading = messagesLoading || isConnecting || profileLoading;

  console.log("useConversation: Current state", {
    userId,
    hasOtherUser: !!otherUser,
    messagesCount: messages.length,
    localMessagesCount: localMessages.length,
    loading,
    connectionError
  });

  return {
    user,
    otherUser,
    loading,
    profileLoading,
    messages: messages.length > 0 ? messages : localMessages,
    sending: sending || isSending,
    isProfileOpen,
    setIsProfileOpen,
    connectionError,
    isReconnecting,
    handleSendMessage,
    handleReportUser,
    handleDeleteConversation,
    handleArchiveConversation,
    handleReconnect,
    navigate
  };
};

export default useConversation;
