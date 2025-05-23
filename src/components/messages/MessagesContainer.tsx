
import { Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquareText, Search, X } from "lucide-react";
import MessageConversation from "@/components/MessageConversation";
import EmptyConversation from "@/components/messages/EmptyConversation";
import ConversationSidebar from "@/components/messages/ConversationSidebar";
import { Conversation } from "@/hooks/useMessages";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] = useState(conversations);
  
  // Filter conversations based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = conversations.filter(convo => 
        (convo.user.name && convo.user.name.toLowerCase().includes(term)) || 
        (convo.user.username && convo.user.username.toLowerCase().includes(term)) ||
        convo.lastMessage.content.toLowerCase().includes(term)
      );
      setFilteredConversations(filtered);
    }
  }, [searchTerm, conversations]);
  
  return (
    <div className="container mx-auto px-0 md:px-4 h-full">
      <div className="max-w-7xl mx-auto h-full">
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-12rem)]">
          {/* Conversation Sidebar */}
          <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Messages</h2>
              <Button onClick={onOpenNewMessage} size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Chat</span>
              </Button>
            </div>
            
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-8 pr-8"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            
            <ConversationSidebar 
              conversations={filteredConversations}
              loading={loading}
              onSelect={onSelectConversation}
              selectedUserId={selectedUserId}
              onViewProfile={onViewProfile}
              onOpenNewMessage={onOpenNewMessage}
              searchTerm={searchTerm}
            />
          </div>
          
          {/* Message Content Area */}
          <div className="flex-1 flex flex-col h-full">
            <Routes>
              <Route path=":userId" element={<MessageConversation onViewProfile={onViewProfile} />} />
              <Route path="/" element={<EmptyConversation />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesContainer;
