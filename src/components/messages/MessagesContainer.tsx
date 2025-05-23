
import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/context/AuthContext";
import ConversationsList from "./ConversationsList";
import MessageConversation from "./MessageConversation";
import { Loader2 } from "lucide-react";

const MessagesContainer = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { loading, conversations, fetchConversations } = useMessages();

  // Fetch conversations when component mounts
  React.useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Please log in to view messages</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[80vh] flex">
        {/* Left Sidebar - Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-thryvance-green" />
              </div>
            ) : (
              <ConversationsList 
                conversations={conversations}
                selectedUserId={userId}
                onSelectConversation={(userId) => {
                  // Use React Router navigation instead of window.location
                  window.history.pushState({}, '', `/messages/${userId}`);
                  window.dispatchEvent(new PopStateEvent('popstate'));
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
  );
};

export default MessagesContainer;
