
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import { useToast } from "@/hooks/use-toast";
import { useConversationActions } from "./hooks/useConversationActions";
import { useNavigate } from "react-router-dom";

export default function useConversation(userId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const {
    loading,
    messages,
    conversations,
    sendMessage,
    loadConversation,
    sending,
    clearLocalMessages,
    setConnectionError: setMessagesConnectionError
  } = useMessages();

  // Load conversation when userId changes
  useEffect(() => {
    if (userId && user) {
      console.log("useConversation: Loading conversation for userId:", userId);
      loadConversation(userId)
        .then(() => {
          console.log("useConversation: Conversation loaded successfully");
          setConnectionError(false);
        })
        .catch((error) => {
          console.error("useConversation: Error loading conversation:", error);
          setConnectionError(true);
        });
    }
  }, [userId, user, loadConversation]);

  // Find other user from conversations
  useEffect(() => {
    if (userId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv.user.id === userId);
      if (conversation) {
        setOtherUser(conversation.user);
        setProfileLoading(false);
      } else {
        setProfileLoading(true);
        // If not found in conversations, we might need to fetch user profile
        // For now, set loading to false to prevent infinite loading
        setTimeout(() => setProfileLoading(false), 1000);
      }
    }
  }, [userId, conversations]);

  const { 
    handleDeleteConversation,
    handleArchiveConversation,
    isDeleting,
    isArchiving
  } = useConversationActions({
    userId,
    currentUserId: user?.id,
    clearMessages: clearLocalMessages,
    navigate
  });

  const handleSendMessage = useCallback(async (content: string) => {
    if (!userId || !content.trim()) {
      return;
    }

    try {
      await sendMessage(userId, content);
    } catch (error) {
      console.error("useConversation: Error sending message:", error);
      throw error;
    }
  }, [userId, sendMessage]);

  const handleReportUser = useCallback(() => {
    if (otherUser) {
      toast({
        title: "User reported",
        description: `${otherUser.name} has been reported to our moderation team.`,
      });
    }
  }, [otherUser, toast]);

  const handleReconnect = useCallback(async () => {
    setIsReconnecting(true);
    try {
      setConnectionError(false);
      setMessagesConnectionError(false);
      
      if (userId) {
        await loadConversation(userId);
      }
      
      toast({
        title: "Reconnected",
        description: "Successfully reconnected to the messaging service",
      });
    } catch (error) {
      console.error("useConversation: Reconnection failed:", error);
      setConnectionError(true);
      toast({
        title: "Reconnection failed",
        description: "Please try again or reload the page",
        variant: "destructive"
      });
    } finally {
      setIsReconnecting(false);
    }
  }, [userId, loadConversation, setMessagesConnectionError, toast]);

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
    handleSendMessage,
    handleReportUser,
    handleDeleteConversation: () => handleDeleteConversation(),
    handleArchiveConversation: () => handleArchiveConversation(),
    handleReconnect,
    isDeleting,
    isArchiving
  };
}
