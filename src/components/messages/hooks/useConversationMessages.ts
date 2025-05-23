
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/hooks/useMessages";

export function useConversationMessages(
  sendMessage: (userId: string, message: string) => Promise<any>,
  fetchMessages: (userId: string) => Promise<Message[]>,
  setConnectionError: (value: boolean) => void
) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  
  // Enhanced message sending function with better error handling and state management
  const handleSendMessage = useCallback(async (userId: string, message: string) => {
    if (!message.trim() || !userId) {
      console.log("Cannot send: empty message or missing userId");
      return null;
    }
    
    setIsSending(true);
    console.log(`Attempting to send message to user ${userId}: ${message.substring(0, 20)}${message.length > 20 ? '...' : ''}`);
    
    try {
      // Clear any previous connection error state
      setConnectionError(false);
      
      // Send the message
      console.log("Sending message");
      const sentMessage = await sendMessage(userId, message.trim());
      
      if (sentMessage) {
        console.log("Message sent successfully:", sentMessage.id);
        
        // Refresh the conversation to ensure we have the latest messages
        console.log("Message sent, refreshing conversation");
        setTimeout(() => {
          refreshConversation(userId).catch(err => 
            console.error("Error refreshing conversation after send:", err)
          );
        }, 300);
      } else {
        console.error("Send message returned null");
      }
      
      return sentMessage;
    } catch (error: any) {
      console.error("Failed to send message:", error);
      setConnectionError(true);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      // Ensure isSending is always reset
      setTimeout(() => {
        setIsSending(false);
        console.log("Reset sending state");
      }, 300);
    }
  }, [sendMessage, setConnectionError, toast]);

  // Add function to refresh messages for a conversation
  const refreshConversation = useCallback(async (userId: string) => {
    if (!userId) {
      console.log("Cannot refresh conversation: missing userId");
      return [];
    }
    
    console.log(`Refreshing messages for conversation with user: ${userId}`);
    try {
      const messages = await fetchMessages(userId);
      console.log(`Fetched ${messages.length} messages for conversation`);
      return messages;
    } catch (error) {
      console.error("Error refreshing conversation:", error);
      setConnectionError(true);
      return [];
    }
  }, [fetchMessages, setConnectionError]);

  return {
    handleSendMessage,
    refreshConversation,
    isSending
  };
}
