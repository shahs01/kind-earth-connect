
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileDialog from "@/components/ProfileDialog";
import useConversation from "@/components/messages/useConversation";
import ConversationHeader from "@/components/messages/ConversationHeader";
import MessageList from "@/components/messages/MessageList";
import MessageInput from "@/components/messages/MessageInput";
import ConnectionErrorDisplay from "@/components/messages/ConnectionErrorDisplay";

interface MessageConversationProps {
  onViewProfile?: (userId: string) => void;
}

const MessageConversation = ({ onViewProfile }: MessageConversationProps) => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const {
    user,
    otherUser,
    loading,
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
  
  const handleViewProfile = () => {
    if (otherUser) {
      if (onViewProfile) {
        onViewProfile(otherUser.id);
      } else {
        setIsProfileOpen(true);
      }
    }
  };
  
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
