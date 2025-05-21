
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useMessages, Conversation } from "@/hooks/useMessages";
import MessageList from "@/components/MessageList";
import MessageConversation from "@/components/MessageConversation";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Loader2 } from "lucide-react";

const Messages = () => {
  const { loading, conversations, fetchConversations } = useMessages();
  const navigate = useNavigate();
  const { userId } = useParams();
  
  useEffect(() => {
    fetchConversations();
  }, []);
  
  const handleSelectConversation = (userId: string) => {
    navigate(`/messages/${userId}`);
  };
  
  const handleNewMessage = () => {
    // This would open a dialog to select a user to message
    // For now, we'll just navigate to the new message view
    navigate('/messages/new');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Messages</h1>
              <Button onClick={handleNewMessage}>
                <Plus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Conversation List */}
                <div className="md:col-span-1 border-r border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="font-medium text-gray-600">Conversations</h2>
                  </div>
                  
                  {loading && conversations.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-6 w-6 animate-spin text-thryvance-green" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-6 text-center">
                      <MessageSquare className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                      <h3 className="font-medium mb-1">No messages yet</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Start a conversation with someone offering or requesting help
                      </p>
                      <Button onClick={handleNewMessage}>
                        Start a conversation
                      </Button>
                    </div>
                  ) : (
                    <MessageList 
                      conversations={conversations}
                      onSelect={handleSelectConversation}
                      selectedUserId={userId}
                    />
                  )}
                </div>
                
                {/* Message Content Area */}
                <div className="md:col-span-2">
                  <Routes>
                    <Route path="/:userId" element={<MessageConversation />} />
                    <Route path="/new" element={<div>New message placeholder</div>} />
                    <Route path="/" element={
                      <div className="h-96 flex flex-col items-center justify-center text-center p-6">
                        <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
                        <p className="text-gray-500">
                          Choose a conversation from the list or start a new one
                        </p>
                      </div>
                    } />
                  </Routes>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
