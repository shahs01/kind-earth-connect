import { useState, useMemo } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MessageList from "@/components/MessageList";
import { Conversation } from "@/hooks/useMessages";

interface ConversationSidebarProps {
  conversations: Conversation[];
  loading: boolean;
  onSelect: (userId: string) => void;
  selectedUserId?: string;
  onViewProfile: (userId: string) => void;
  onOpenNewMessage: () => void;
  searchTerm: string;
}

const ConversationSidebar = ({ 
  conversations, 
  loading, 
  onSelect, 
  selectedUserId, 
  onViewProfile,
  onOpenNewMessage,
  searchTerm
}: ConversationSidebarProps) => {
  // Calculate if we have results to show
  const showNoResults = useMemo(() => {
    return searchTerm && conversations.length === 0;
  }, [searchTerm, conversations.length]);
  
  // Calculate if we need to show empty state
  const showEmptyState = useMemo(() => {
    return !loading && conversations.length === 0 && !searchTerm;
  }, [loading, conversations.length, searchTerm]);

  return (
    <div className="flex-1 overflow-y-auto">
      {loading && conversations.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-thryvance-green" />
        </div>
      ) : showNoResults ? (
        <div className="p-6 text-center">
          <p className="text-gray-500 mb-2">No conversations match your search</p>
          <Button variant="outline" size="sm" onClick={() => {
            /* This would reset search term, but we're handling that in the parent */
          }}>
            Clear search
          </Button>
        </div>
      ) : showEmptyState ? (
        <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <h3 className="font-medium mb-1">No messages yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Start a conversation with someone offering or requesting help
          </p>
          <Button onClick={onOpenNewMessage}>
            Start a conversation
          </Button>
        </div>
      ) : (
        <MessageList 
          conversations={conversations}
          onSelect={onSelect}
          selectedUserId={selectedUserId}
          onViewProfile={onViewProfile}
        />
      )}
    </div>
  );
};

export default ConversationSidebar;
