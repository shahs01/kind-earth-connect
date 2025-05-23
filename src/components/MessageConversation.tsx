
import React, { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileDialog from "@/components/ProfileDialog";
import useConversation from "@/components/messages/useConversation";
import { useToast } from "@/hooks/use-toast";
import ConnectionStatusHandler from "@/components/messages/ConnectionStatusHandler";
import ConversationBody from "@/components/messages/ConversationBody";
import { useConnectionState } from "@/components/messages/hooks/useConnectionState";

interface MessageConversationProps {
  onViewProfile?: (userId: string) => void;
}

const MessageConversation = ({ onViewProfile }: MessageConversationProps) => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  console.log("MessageConversation: Rendering with userId:", userId);
  
  const {
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
    handleDeleteConversation,
    handleReconnect
  } = useConversation(userId);
  
  const { fetchError, setFetchError, handleRetry } = useConnectionState(
    connectionError,
    isReconnecting,
    handleReconnect
  );
  
  // Reset state when userId changes
  useEffect(() => {
    console.log("MessageConversation: userId changed to:", userId);
    setFetchError(false);
  }, [userId, setFetchError]);
  
  // Memoized function for viewing profile to reduce renders
  const handleViewProfile = useCallback(() => {
    if (otherUser) {
      if (onViewProfile) {
        onViewProfile(otherUser.id);
      } else {
        setIsProfileOpen(true);
      }
    }
  }, [otherUser, onViewProfile, setIsProfileOpen]);
  
  // Memoize message sending function to prevent unnecessary re-renders
  const onSendMessage = useCallback(async (content: string) => {
    try {
      console.log("MessageConversation: Sending message:", content.substring(0, 20) + (content.length > 20 ? '...' : ''));
      if (!userId) {
        console.error("Cannot send message: missing userId");
        toast({
          title: "Error",
          description: "Cannot send message: conversation not found",
          variant: "destructive"
        });
        return;
      }
      await handleSendMessage(content);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  }, [handleSendMessage, toast, userId]);
  
  // Handle delete conversation
  const onDeleteConversation = useCallback(async () => {
    if (!userId) return;
    
    try {
      console.log("Deleting conversation with user:", userId);
      await handleDeleteConversation();
      navigate("/messages");
      toast({
        title: "Conversation deleted",
        description: "The conversation has been permanently deleted."
      });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive"
      });
    }
  }, [userId, handleDeleteConversation, navigate, toast]);
  
  // Log lifecycle for debugging
  useEffect(() => {
    console.log("MessageConversation mounted with userId:", userId);
    return () => {
      console.log("MessageConversation unmounting, userId was:", userId);
    };
  }, [userId]);
  
  // Check for status error states first
  const statusHandler = (
    <ConnectionStatusHandler
      user={user}
      connectionError={connectionError}
      isReconnecting={isReconnecting}
      fetchError={fetchError}
      profileLoading={profileLoading}
      otherUser={otherUser}
      handleReconnect={handleReconnect}
      handleRetry={handleRetry}
    />
  );
  
  if (statusHandler.props.user === null || 
      statusHandler.props.connectionError || 
      statusHandler.props.fetchError || 
      (statusHandler.props.profileLoading && !statusHandler.props.otherUser)) {
    return statusHandler;
  }
  
  console.log("MessageConversation rendering with:", {
    messageCount: messages.length,
    otherUser: otherUser?.name || "unknown",
    loading,
    sending
  });
  
  return (
    <>
      <ConversationBody
        otherUser={otherUser}
        loading={loading}
        messages={messages}
        sending={sending}
        currentUserId={user?.id}
        onViewProfile={handleViewProfile}
        onReportUser={handleReportUser}
        onDeleteConversation={onDeleteConversation}
        onSendMessage={onSendMessage}
      />

      {otherUser && !onViewProfile && (
        <ProfileDialog 
          user={otherUser}
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
        />
      )}
    </>
  );
};

export default MessageConversation;
