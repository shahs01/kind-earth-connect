
import { useState } from "react";
import { Search, X, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MessageList from "@/components/MessageList";
import { Conversation } from "@/hooks/useMessages";

interface ConversationSidebarProps {
  conversations: Conversation[];
  loading: boolean;
  onSelect: (userId: string) => void;
  selectedUserId?: string;
  onViewProfile: (userId: string) => void;
  onOpenNewMessage: () => void;
}

const ConversationSidebar = ({ 
  conversations, 
  loading, 
  onSelect, 
  selectedUserId, 
  onViewProfile,
  onOpenNewMessage
}: ConversationSidebarProps) => {
  const [conversationSearch, setConversationSearch] = useState("");
  const filteredConversations = conversationSearch.trim() === "" 
    ? conversations 
    : conversations.filter(convo => 
        (convo.user.name && convo.user.name.toLowerCase().includes(conversationSearch.toLowerCase())) || 
        (convo.user.username && convo.user.username.toLowerCase().includes(conversationSearch.toLowerCase())) ||
        convo.lastMessage.content.toLowerCase().includes(conversationSearch.toLowerCase())
      );
  
  return (
    <div className="md:col-span-1 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-8 pr-8"
            placeholder="Search conversations..."
            value={conversationSearch}
            onChange={(e) => setConversationSearch(e.target.value)}
          />
          {conversationSearch && (
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setConversationSearch("")}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
      
      {loading && conversations.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-thryvance-green" />
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="p-6 text-center">
          {conversationSearch ? (
            <>
              <p className="text-gray-500 mb-2">No conversations match your search</p>
              <Button variant="outline" size="sm" onClick={() => setConversationSearch("")}>
                Clear search
              </Button>
            </>
          ) : (
            <>
              <MessageSquare className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <h3 className="font-medium mb-1">No messages yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Start a conversation with someone offering or requesting help
              </p>
              <Button onClick={onOpenNewMessage}>
                Start a conversation
              </Button>
            </>
          )}
        </div>
      ) : (
        <MessageList 
          conversations={filteredConversations}
          onSelect={onSelect}
          selectedUserId={selectedUserId}
          onViewProfile={onViewProfile}
        />
      )}
    </div>
  );
};

export default ConversationSidebar;
