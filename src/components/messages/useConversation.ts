
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
    removeMessage,
    setConnectionError: setMessagesConnectionError
  } = useMessages();

  // Load conversation when userId changes - this is the key fix
  useEffect(() => {
    if (userId && user) {
      console.log("useConversation: Loading conversation for userId:", userId);
      setProfileLoading(true);
      setConnectionError(false);
      
      loadConversation(userId)
        .then((messages) => {
          console.log("useConversation: Conversation loaded successfully with", messages.length, "messages");
          setConnectionError(false);
          setProfileLoading(false);
        })
        .catch((error) => {
          console.error("useConversation: Error loading conversation:", error);
          setConnectionError(true);
          setProfileLoading(false);
        });
    }
  }, [userId, user, loadConversation]);

  // Find other user from conversations - improved logic
  useEffect(() => {
    if (userId && conversations.length > 0) {
      console.log("useConversation: Looking for user", userId, "in", conversations.length, "conversations");
      const conversation = conversations.find(conv => conv.user.id === userId);
      if (conversation) {
        console.log("useConversation: Found user in conversations:", conversation.user.name);
        setOtherUser(conversation.user);
        setProfileLoading(false);
      } else {
        console.log("useConversation: User not found in conversations, creating placeholder");
        // Create a basic user object if not found in conversations
        setOtherUser({
          id: userId,
          name: "Loading...",
          username: "",
          email: "",
          avatar: `https://ui-avatars.com/api/?name=User`,
          bio: "",
          location: "",
          trustScore: 0,
          helpOffered: 0,
          helpReceived: 0,
          volunteerHours: 0,
          createdAt: new Date(),
          verifiedStatus: false,
          emailVerified: false,
          trustBadges: [],
          loginAttempts: 0,
          lastLoginAttempt: null
        });
        setProfileLoading(false);
      }
    } else if (userId && conversations.length === 0 && !loading) {
      // If we have a userId but no conversations yet, create a placeholder
      setOtherUser({
        id: userId,
        name: "User",
        username: "",
        email: "",
        avatar: `https://ui-avatars.com/api/?name=User`,
        bio: "",
        location: "",
        trustScore: 0,
        helpOffered: 0,
        helpReceived: 0,
        volunteerHours: 0,
        createdAt: new Date(),
        verifiedStatus: false,
        emailVerified: false,
        trustBadges: [],
        loginAttempts: 0,
        lastLoginAttempt: null
      });
      setProfileLoading(false);
    }
  }, [userId, conversations, loading]);

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
      console.log("useConversation: Sending message to", userId);
      await sendMessage(userId, content);
      console.log("useConversation: Message sent successfully");
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

  // Handle message deletion from realtime
  const handleMessageDeleted = useCallback((messageId: string) => {
    console.log("useConversation: Handling message deletion:", messageId);
    if (removeMessage) {
      removeMessage(messageId);
    }
  }, [removeMessage]);

  return {
    user,
    otherUser,
    loading: loading || profileLoading,
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
    handleMessageDeleted,
    isDeleting,
    isArchiving
  };
}
