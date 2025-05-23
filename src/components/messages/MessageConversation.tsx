
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
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
  
  // Ensure we redirect if no userId is provided
  useEffect(() => {
    if (!userId && user) {
      // If we're on /messages with no userId, but have conversations, redirect to the first one
      navigate('/messages', { replace: true });
    }
  }, [userId, user, navigate]);
  
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
      console.log("Message sent successfully via onSendMessage");
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
  
  if (!userId) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-6">
        <h3 className="text-xl font-medium mb-2 text-gray-700">Select a conversation</h3>
        <p className="text-gray-500 text-center mb-4">
          Choose a conversation from the sidebar or start a new one
        </p>
      </div>
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
