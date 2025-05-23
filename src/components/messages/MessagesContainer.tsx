
import { Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Search, X } from "lucide-react";
import MessageConversation from "@/components/messages/MessageConversation";
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
  initialLoadComplete?: boolean;
}

const MessagesContainer = ({
  loading,
  conversations,
  onSelectConversation,
  onOpenNewMessage,
  onViewProfile,
  selectedUserId,
  initialLoadComplete = false
}: MessagesContainerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] = useState(conversations);
  
  // Filter conversations based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = conversations.filter(convo => {
        const userName = convo.user?.name?.toLowerCase() || '';
        const userUsername = convo.user?.username?.toLowerCase() || '';
        const lastMessageContent = convo.lastMessage?.content?.toLowerCase() || '';
        
        return userName.includes(term) || 
               userUsername.includes(term) || 
               lastMessageContent.includes(term);
      });
      setFilteredConversations(filtered);
    }
  }, [searchTerm, conversations]);
  
  console.log("MessagesContainer render:", {
    selectedUserId,
    conversationsCount: conversations.length,
    filteredCount: filteredConversations.length,
    loading,
    initialLoadComplete
  });
  
  return (
    <div className="container mx-auto px-0 md:px-4 h-full">
      <div className="max-w-7xl mx-auto h-full">
        {/* Grid layout for proper conversation panel display */}
        <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-12rem)]">
          {/* Conversation Sidebar - Always visible on desktop */}
          <div className="border-r border-gray-200 flex flex-col h-full">
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
              initialLoadComplete={initialLoadComplete}
            />
          </div>
          
          {/* Message Content Area - Always visible, shows empty state or conversation */}
          <div className={`flex flex-col h-full ${selectedUserId ? 'block' : 'hidden md:block'}`}>
            <Routes>
              <Route path=":userId" element={
                <MessageConversation 
                  key={selectedUserId} 
                  onViewProfile={onViewProfile} 
                />
              } />
              <Route path="/" element={<EmptyConversation />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesContainer;
