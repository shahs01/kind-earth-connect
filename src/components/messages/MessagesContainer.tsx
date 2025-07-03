
import React, { useState } from "react";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/context/AuthContext";
import ConversationsList from "./ConversationsList";
import MessageConversation from "./MessageConversation";
import { Loader2, ArrowLeft, Archive, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

const MessagesContainer = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loading, conversations, archivedConversations, fetchConversations } = useMessages();
  const [showArchived, setShowArchived] = useState(false);

  // Fetch conversations when component mounts
  React.useEffect(() => {
    if (user) {
      fetchConversations(showArchived);
    }
  }, [user, fetchConversations, showArchived]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Please log in to view messages</p>
      </div>
    );
  }

  const handleBackToConversations = () => {
    navigate('/messages');
  };

  const toggleArchived = () => {
    setShowArchived(!showArchived);
  };

  const currentConversations = showArchived ? archivedConversations : conversations;

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[80vh] flex">
        {/* Mobile: Show only conversations list or conversation */}
        <div className="md:hidden w-full flex flex-col">
          {!userId ? (
            <>
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {showArchived ? 'Archived Messages' : 'Messages'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleArchived}
                    className="flex items-center gap-2"
                  >
                    {showArchived ? (
                      <>
                        <Inbox className="h-4 w-4" />
                        Inbox
                      </>
                    ) : (
                      <>
                        <Archive className="h-4 w-4" />
                        Archived
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-thryvance-green" />
                  </div>
                ) : (
                  <ConversationsList 
                    conversations={currentConversations}
                    selectedUserId={userId}
                    showArchived={showArchived}
                    onSelectConversation={(userId) => {
                      navigate(`/messages/${userId}`);
                    }}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full">
              {/* Mobile conversation header with back button */}
              <div className="flex items-center p-3 border-b border-gray-200 bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToConversations}
                  className="mr-3 p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h3 className="text-lg font-semibold text-gray-900">Conversation</h3>
              </div>
              
              {/* Conversation content */}
              <div className="flex-1">
                <MessageConversation />
              </div>
            </div>
          )}
        </div>

        {/* Desktop: Show both sidebar and conversation */}
        <div className="hidden md:flex w-full">
          {/* Left Sidebar - Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {showArchived ? 'Archived Messages' : 'Messages'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleArchived}
                  className="flex items-center gap-2"
                >
                  {showArchived ? (
                    <>
                      <Inbox className="h-4 w-4" />
                      Inbox
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4" />
                      Archived
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-thryvance-green" />
                </div>
              ) : (
                <ConversationsList 
                  conversations={currentConversations}
                  selectedUserId={userId}
                  showArchived={showArchived}
                  onSelectConversation={(userId) => {
                    navigate(`/messages/${userId}`);
                  }}
                />
              )}
            </div>
          </div>

          {/* Right Side - Message Thread */}
          <div className="flex-1 flex flex-col">
            {userId ? (
              <MessageConversation />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation from the sidebar to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesContainer;
