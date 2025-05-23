
import { useState, useEffect, useCallback } from "react";
import { useConversations } from "./useConversations";
import { useMessagesList } from "./useMessagesList";
import { useMessageActions } from "./useMessageActions";
import { useToast } from "./use-toast";
import { Message } from "./useConversations";
export type { Conversation, Message } from "./useConversations";

export function useMessages() {
  const { 
    loading: conversationsLoading, 
    conversations, 
    fetchConversations, 
    connectionError, 
    setConnectionError 
  } = useConversations();
  
  const {
    loading: messagesLoading,
    messages,
    setMessages,
    fetchMessages,
    addMessageToState,
  } = useMessagesList();
  
  const {
    sending,
    sendMessage: sendMessageAction,
    markMessagesAsRead,
  } = useMessageActions();
  
  const { toast } = useToast();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // Set active conversation
  useEffect(() => {
    return () => {
      setActiveConversationId(null);
    };
  }, []);
  
  // Set up event listener for user reporting
  useEffect(() => {
    const handleReportUser = (event: any) => {
      const { userId } = event.detail;
      
      if (userId) {
        toast({
          title: "Report submitted",
          description: "We've received your report. Our team will review it shortly.",
        });
      }
    };
    
    window.addEventListener('report-user', handleReportUser as EventListener);
    
    return () => {
      window.removeEventListener('report-user', handleReportUser as EventListener);
    };
  }, [toast]);

  // Handle message sending with local state update
  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    try {
      console.log(`Preparing to send message to ${receiverId}: ${content.substring(0, 20)}${content.length > 20 ? '...' : ''}`);
      
      const message = await sendMessageAction(receiverId, content);
      
      // Update messages state immediately without refetching
      if (message) {
        console.log("Message sent successfully, updating local state");
        addMessageToState(message);
        setActiveConversationId(receiverId);
      }
      
      // Make sure we have the latest conversations after a message is sent
      // Add a small delay to ensure database has time to update
      setTimeout(() => {
        fetchConversations();
      }, 300);
      
      return message;
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  }, [sendMessageAction, addMessageToState, fetchConversations]);

  const loadConversation = useCallback(async (userId: string) => {
    if (!userId) return;
    
    console.log(`Loading conversation with userId: ${userId}`);
    setActiveConversationId(userId);
    
    try {
      await fetchMessages(userId);
      await markMessagesAsRead(userId);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  }, [fetchMessages, markMessagesAsRead]);

  const loading = conversationsLoading || messagesLoading;
  
  return {
    loading,
    messages,
    conversations,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    loadConversation,
    connectionError,
    setConnectionError,
    sending,
    activeConversationId,
    setMessages
  };
}
