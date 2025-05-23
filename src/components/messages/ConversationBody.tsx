
import React from "react";
import ConversationHeader from "@/components/messages/ConversationHeader";
import MessageList from "@/components/messages/MessageList";
import MessageInput from "@/components/messages/MessageInput";
import LoadingSkeleton from "@/components/messages/LoadingSkeleton";

interface ConversationBodyProps {
  otherUser: any;
  loading: boolean;
  messages: any[];
  sending: boolean;
  currentUserId: string;
  onViewProfile: () => void;
  onReportUser: () => void;
  onDeleteConversation: () => void;
  onArchiveConversation: () => void;
  onSendMessage: (content: string) => void;
}

const ConversationBody = ({
  otherUser,
  loading,
  messages,
  sending,
  currentUserId,
  onViewProfile,
  onReportUser,
  onDeleteConversation,
  onArchiveConversation,
  onSendMessage
}: ConversationBodyProps) => {
  console.log("ConversationBody render:", {
    hasOtherUser: !!otherUser,
    loading,
    messagesCount: messages.length,
    currentUserId
  });

  // Show loading skeleton while loading user or initial messages
  if (loading && !otherUser) {
    return (
      <div className="flex flex-col h-full">
        <LoadingSkeleton type="profile" count={1} />
        <div className="flex-1 bg-gray-50">
          <LoadingSkeleton type="messages" count={3} />
        </div>
      </div>
    );
  }

  // Show error state if no other user found
  if (!loading && !otherUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
        <p className="text-gray-500">This conversation may no longer be available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ConversationHeader
        otherUser={otherUser}
        loading={loading}
        onViewProfile={onViewProfile}
        onReportUser={onReportUser}
        onDeleteConversation={onDeleteConversation}
        onArchiveConversation={onArchiveConversation}
      />
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="py-4 px-4 md:px-6">
          <MessageList 
            messages={messages} 
            loading={loading && messages.length === 0} 
            currentUserId={currentUserId} 
          />
        </div>
      </div>
      
      {/* Input */}
      <MessageInput 
        sending={sending}
        loading={loading}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};

export default ConversationBody;
