
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Search, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMessagingSystem } from "@/hooks/useMessagingSystem";
import ConversationsList from "@/components/messages/ConversationsList";
import MessageConversation from "@/components/messages/MessageConversation";
import LoadingSkeleton from "@/components/messages/LoadingSkeleton";
import EmptyState from "@/components/messages/EmptyState";
import MessagesAuthRequired from "@/components/messages/MessagesAuthRequired";

const MessagesContainer = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const {
    currentUserId,
    conversations,
    messages,
    activeConversation,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    error,
    connectionStatus,
    fetchConversations,
    openConversation,
    sendMessage
  } = useMessagingSystem();

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(convo => {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase();
    const userName = convo.user?.name?.toLowerCase() || '';
    const userUsername = convo.user?.username?.toLowerCase() || '';
    const lastMessageContent = convo.lastMessage?.content?.toLowerCase() || '';
    
    return userName.includes(term) || 
           userUsername.includes(term) || 
           lastMessageContent.includes(term);
  });

  // Set active conversation when URL param changes
  useEffect(() => {
    if (userId && currentUserId) {
      openConversation(userId);
    }
  }, [userId, currentUserId, openConversation]);

  // Handle selecting a conversation
  const handleSelectConversation = (userId: string) => {
    navigate(`/messages/${userId}`);
  };

  // Handle creating a new message
  const handleNewMessage = () => {
    navigate("/messages/new");
  };
  
  // Show auth required state if not logged in
  if (connectionStatus === 'disconnected' || (!currentUserId && !isLoadingConversations)) {
    return <MessagesAuthRequired />;
  }

  return (
    <div className="container mx-auto px-0 md:px-4 h-full">
      <div className="max-w-7xl mx-auto h-full">
        <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-12rem)]">
          {/* Conversations Sidebar */}
          <div className="border-r border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Messages</h2>
              <Button onClick={handleNewMessage} size="sm" className="flex items-center gap-1">
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
            
            <div className="flex-1 overflow-y-auto">
              {isLoadingConversations ? (
                <LoadingSkeleton type="conversations" count={5} />
              ) : filteredConversations.length > 0 ? (
                <ConversationsList 
                  conversations={filteredConversations}
                  selectedUserId={userId}
                  onSelect={handleSelectConversation}
                />
              ) : searchTerm ? (
                <EmptyState 
                  icon={<Search className="h-12 w-12 text-gray-300" />}
                  title="No results found" 
                  description="Try searching for something else"
                  actionLabel="Clear search"
                  onAction={() => setSearchTerm("")}
                />
              ) : (
                <EmptyState 
                  icon={<MessageCircle className="h-12 w-12 text-gray-300" />}
                  title="No messages yet" 
                  description="Start a conversation with someone"
                  actionLabel="New message"
                  onAction={handleNewMessage}
                />
              )}
            </div>
          </div>
          
          {/* Conversation Area */}
          <div className="flex flex-col h-full">
            {userId ? (
              <MessageConversation
                userId={userId}
                messages={messages}
                isLoading={isLoadingMessages}
                isSending={isSending}
                currentUserId={currentUserId || ''}
                onSendMessage={(content) => sendMessage(userId, content)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <MessageCircle className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500 mb-4 text-center">
                  Choose a conversation from the list or start a new one
                </p>
                <Button onClick={handleNewMessage}>
                  Start a new conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesContainer;
