
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
      />
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList 
          messages={messages} 
          loading={loading} 
          currentUserId={currentUserId} 
        />
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
