
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
  } = useMessagesList();
  
  const {
    sending,
    sendMessage: sendMessageAction,
    markMessagesAsRead,
  } = useMessageActions();
  
  const { toast } = useToast();
  
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
      const message = await sendMessageAction(receiverId, content);
      
      // Update messages state immediately without refetching
      if (message) {
        setMessages(prev => [...prev, message]);
      }
      
      return message;
    } catch (error) {
      throw error;
    }
  }, [sendMessageAction, setMessages]);

  const loading = conversationsLoading || messagesLoading;
  
  return {
    loading,
    messages,
    conversations,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    connectionError,
    setConnectionError,
    sending
  };
}
