
import React, { useEffect, useCallback, useState } from "react";
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
  const [initialLoading, setInitialLoading] = useState(true);
  
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
  
  // Reset error state when userId changes
  useEffect(() => {
    setFetchError(false);
    console.log("MessageConversation mounted with userId:", userId);
    
    // Hide initial loading after a timeout to prevent long blank screens
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000); // Reduced from 2000 to make the UI more responsive
    
    return () => clearTimeout(timer);
  }, [userId, setFetchError]);
  
  // Memoized function for viewing profile
  const handleViewProfile = useCallback(() => {
    if (otherUser) {
      if (onViewProfile) {
        onViewProfile(otherUser.id);
      } else {
        setIsProfileOpen(true);
      }
    }
  }, [otherUser, onViewProfile, setIsProfileOpen]);
  
  // Memoize message sending function
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
  
  console.log("MessageConversation render state:", { 
    hasUserId: !!userId, 
    hasUser: !!user, 
    hasOtherUser: !!otherUser,
    messagesCount: messages.length,
    connectionError,
    fetchError,
    loading,
    initialLoading
  });
  
  // Initial loading state
  if (initialLoading && loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green mb-4" />
        <p className="text-gray-500">Loading conversation...</p>
      </div>
    );
  }
  
  // Check for authentication
  if (!user) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <p className="text-gray-500">Please log in to view messages</p>
      </div>
    );
  }
  
  // Check for connection errors
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
  
  // No conversation selected
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
