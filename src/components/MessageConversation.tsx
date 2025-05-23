
import React, { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
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
  const { toast } = useToast();
  
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
    handleReconnect,
    handleArchiveConversation
  } = useConversation(userId);
  
  const { fetchError, setFetchError, handleRetry } = useConnectionState(
    connectionError,
    isReconnecting,
    handleReconnect
  );
  
  // Reset state when userId changes
  useEffect(() => {
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
    if (!content.trim()) return;
    
    try {
      if (!userId) {
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
  
  // Check for status error states first
  if (!user) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <p className="text-gray-500">Please log in to view messages</p>
      </div>
    );
  }
  
  if (connectionError || fetchError) {
    return (
      <ConnectionStatusHandler
        user={user}
        connectionError={connectionError}
        isReconnecting={isReconnecting}
        fetchError={fetchError}
        profileLoading={false}
        otherUser={null}
        handleReconnect={handleReconnect}
        handleRetry={handleRetry}
      />
    );
  }
  
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
        onDeleteConversation={handleDeleteConversation}
        onArchiveConversation={handleArchiveConversation}
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
