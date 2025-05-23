
import { useState, useCallback, useRef } from "react";
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
import { useConversationLifecycle } from "./hooks/useConversationLifecycle";
import { useMessageSync } from "./hooks/useMessageSync";

const useConversation = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connectionError, setConnectionError] = useState(false);
  const previousUserIdRef = useRef<string | undefined>(undefined);
  const channelRef = useRef<any>(null);
  const navigate = useNavigate();
  
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
  const { handleDeleteConversation, handleArchiveConversation } = useConversationActions({
    userId,
    currentUserId: user?.id,
    clearMessages: clearAllMessages
  });
  
  // Handle conversation lifecycle (loading, cleanup)
  useConversationLifecycle(
    userId,
    user,
    fetchMessages,
    fetchOtherUser,
    markMessagesAsRead,
    setupRealtimeSubscription,
    channelRef,
    setConnectionError
  );
  
  // Handle message sync between local and server state
  useMessageSync(
    messages,
    localMessages,
    setMessages,
    previousUserIdRef,
    userId,
    clearLocalMessages
  );

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
    handleArchiveConversation,
    handleReconnect,
    navigate
  };
};

export default useConversation;
