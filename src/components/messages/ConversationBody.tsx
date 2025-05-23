
import React from "react";
import ConversationHeader from "@/components/messages/ConversationHeader";
import MessageList from "@/components/messages/MessageList";
import MessageInput from "@/components/messages/MessageInput";

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
            loading={loading} 
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
