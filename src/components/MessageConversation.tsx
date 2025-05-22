
import React, { useEffect, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileDialog from "@/components/ProfileDialog";
import useConversation from "@/components/messages/useConversation";
import ConversationHeader from "@/components/messages/ConversationHeader";
import MessageList from "@/components/messages/MessageList";
import MessageInput from "@/components/messages/MessageInput";
import ConnectionErrorDisplay from "@/components/messages/ConnectionErrorDisplay";
import { Loader2 } from "lucide-react";
import EmptyConversation from "./messages/EmptyConversation";
import { useToast } from "@/hooks/use-toast";

interface MessageConversationProps {
  onViewProfile?: (userId: string) => void;
}

const MessageConversation = ({ onViewProfile }: MessageConversationProps) => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fetchError, setFetchError] = useState(false);
  
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
    handleReconnect
  } = useConversation(userId);
  
  // Handle fetch errors
  useEffect(() => {
    if (connectionError && !isReconnecting) {
      setFetchError(true);
    } else {
      setFetchError(false);
    }
  }, [connectionError, isReconnecting]);
  
  // Reset state when userId changes
  useEffect(() => {
    setFetchError(false);
  }, [userId]);
  
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
  
  const handleRetry = useCallback(() => {
    setFetchError(false);
    handleReconnect();
    toast({
      title: "Retrying",
      description: "Attempting to reconnect..."
    });
  }, [handleReconnect, toast]);
  
  // Redirect if user is not authenticated
  if (!user) {
    return <div className="p-8 text-center">Please log in to view messages</div>;
  }

  // Display connection error if there's an issue
  if (connectionError) {
    return (
      <ConnectionErrorDisplay 
        isReconnecting={isReconnecting}
        onReconnect={handleReconnect}
      />
    );
  }
  
  // Handle specific fetch error for this conversation
  if (fetchError) {
    return <EmptyConversation error={true} onRetry={handleRetry} />;
  }
  
  // Show loading state when user profile is loading
  if (profileLoading && !otherUser) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green mb-4" />
        <p className="text-gray-500">Loading conversation...</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex flex-col h-[70vh]">
        {/* Header */}
        <ConversationHeader
          otherUser={otherUser}
          loading={loading}
          onViewProfile={handleViewProfile}
          onReportUser={handleReportUser}
        />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList 
            messages={messages} 
            loading={loading} 
            currentUserId={user?.id} 
          />
        </div>
        
        {/* Input */}
        <MessageInput 
          sending={sending}
          loading={loading}
          onSendMessage={handleSendMessage}
        />
      </div>

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
