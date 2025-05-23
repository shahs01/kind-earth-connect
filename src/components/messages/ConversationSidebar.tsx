
import { useState, useMemo } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConversationsList from "@/components/MessageList"; // Updated import name for clarity
import { Conversation } from "@/hooks/useMessages";

interface ConversationSidebarProps {
  conversations: Conversation[];
  loading: boolean;
  onSelect: (userId: string) => void;
  selectedUserId?: string;
  onViewProfile: (userId: string) => void;
  onOpenNewMessage: () => void;
  searchTerm: string;
  initialLoadComplete?: boolean;
}

const ConversationSidebar = ({ 
  conversations, 
  loading, 
  onSelect, 
  selectedUserId, 
  onViewProfile,
  onOpenNewMessage,
  searchTerm,
  initialLoadComplete = false
}: ConversationSidebarProps) => {
  // Calculate if we have results to show
  const showNoResults = useMemo(() => {
    return searchTerm && conversations.length === 0;
  }, [searchTerm, conversations.length]);
  
  // Calculate if we need to show empty state
  const showEmptyState = useMemo(() => {
    return !loading && conversations.length === 0 && !searchTerm && initialLoadComplete;
  }, [loading, conversations.length, searchTerm, initialLoadComplete]);

  // Add console log to help debug
  console.log("ConversationSidebar render:", {
    conversationsCount: conversations.length,
    loading,
    selectedUserId,
    showEmptyState,
    showNoResults,
    initialLoadComplete
  });

  return (
    <div className="flex-1 overflow-y-auto">
      {loading && !initialLoadComplete ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-thryvance-green mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Loading conversations...</p>
          </div>
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
        <ConversationsList 
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
