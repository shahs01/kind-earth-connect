
import { Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import MessageConversation from "@/components/MessageConversation";
import EmptyConversation from "@/components/messages/EmptyConversation";
import ConversationSidebar from "@/components/messages/ConversationSidebar";
import { Conversation } from "@/hooks/useMessages";

interface MessagesContainerProps {
  loading: boolean;
  conversations: Conversation[];
  onSelectConversation: (userId: string) => void;
  onOpenNewMessage: () => void;
  onViewProfile: (userId: string) => void;
  selectedUserId?: string;
}

const MessagesContainer = ({
  loading,
  conversations,
  onSelectConversation,
  onOpenNewMessage,
  onViewProfile,
  selectedUserId
}: MessagesContainerProps) => {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <Button onClick={onOpenNewMessage}>
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Conversation Sidebar */}
            <ConversationSidebar 
              conversations={conversations}
              loading={loading}
              onSelect={onSelectConversation}
              selectedUserId={selectedUserId}
              onViewProfile={onViewProfile}
              onOpenNewMessage={onOpenNewMessage}
            />
            
            {/* Message Content Area */}
            <div className="md:col-span-2">
              <Routes>
                <Route path=":userId" element={<MessageConversation onViewProfile={onViewProfile} />} />
                <Route path="/" element={<EmptyConversation />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesContainer;
