
import { useState, useEffect, useCallback, useRef } from "react";
import { useConversations } from "./useConversations";
import { useMessagesList } from "./useMessagesList";
import { useMessageActions } from "./useMessageActions";
import { useToast } from "./use-toast";
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
    deleteConversation
  } = useMessageActions();
  
  const { toast } = useToast();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const previousUserIdRef = useRef<string | undefined>(undefined);
  
  // Set active conversation and clear messages when component unmounts
  useEffect(() => {
    return () => {
      setActiveConversationId(null);
      previousUserIdRef.current = undefined;
      setMessages([]);
    };
  }, [setMessages]);

  // Handle message sending with local state update
  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!content.trim()) {
      toast({
        title: "Empty message",
        description: "Cannot send an empty message",
        variant: "destructive"
      });
      return Promise.reject(new Error("Empty message"));
    }
    
    try {
      console.log(`Sending message to ${receiverId}: ${content.substring(0, 20)}${content.length > 20 ? '...' : ''}`);
      
      const message = await sendMessageAction(receiverId, content);
      
      // Update messages state immediately without refetching
      if (message && message.sender) {
        console.log("Message sent successfully, updating local state");
        addMessageToState(message as unknown as any);
        setActiveConversationId(receiverId);
        
        // Update reference for current conversation
        if (previousUserIdRef.current !== receiverId) {
          previousUserIdRef.current = receiverId;
        }
      }
      
      // Refresh conversations list after sending message
      setTimeout(() => {
        fetchConversations();
      }, 300);
      
      return message;
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Message not sent",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  }, [sendMessageAction, addMessageToState, fetchConversations, toast]);

  const loadConversation = useCallback(async (userId: string) => {
    if (!userId) {
      console.warn("loadConversation: No userId provided");
      return;
    }
    
    console.log(`Loading conversation with userId: ${userId}`);
    setActiveConversationId(userId);
    
    try {
      // Clear previous messages if this is a different conversation
      if (previousUserIdRef.current !== userId) {
        console.log("Clearing messages for new conversation");
        setMessages([]);
        previousUserIdRef.current = userId;
      }
      
      const fetchedMessages = await fetchMessages(userId);
      console.log(`Loaded ${fetchedMessages.length} messages for conversation with ${userId}`);
      
      // Mark messages as read
      await markMessagesAsRead(userId);
      
      // Reload conversations to update unread counts
      setTimeout(() => {
        fetchConversations();
      }, 300);
      
      return fetchedMessages;
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation. Please try again.",
        variant: "destructive"
      });
      return [];
    }
  }, [fetchMessages, markMessagesAsRead, setMessages, toast, fetchConversations]);

  // Clear local messages when unmounting or changing conversation
  const clearLocalMessages = useCallback(() => {
    console.log("Clearing local messages");
    setMessages([]);
  }, [setMessages]);

  const loading = conversationsLoading || messagesLoading;
  
  return {
    loading,
    messages,
    conversations,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    deleteConversation,
    loadConversation,
    connectionError,
    setConnectionError,
    sending,
    activeConversationId,
    setMessages,
    clearLocalMessages,
    previousUserIdRef
  };
}
