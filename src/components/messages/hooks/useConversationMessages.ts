
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
    
    try {
      console.log(`Sending message to user ${userId}: ${message.substring(0, 20)}${message.length > 20 ? '...' : ''}`);
      
      // Clear any previous connection error state
      setConnectionError(false);
      
      // Send the message with retries
      let attempts = 0;
      let sentMessage = null;
      
      while (attempts < 2 && !sentMessage) {
        try {
          sentMessage = await sendMessage(userId, message.trim());
          
          if (sentMessage) {
            console.log("Message sent successfully:", sentMessage.id);
          }
          
        } catch (err) {
          attempts++;
          if (attempts < 2) {
            console.log(`Retrying send message, attempt ${attempts + 1}`);
            // Short delay before retry
            await new Promise(resolve => setTimeout(resolve, 300));
          } else {
            throw err;
          }
        }
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
      setIsSending(false);
    }
  }, [sendMessage, setConnectionError, toast]);

  // Add function to refresh messages for a conversation
  const refreshConversation = useCallback(async (userId: string) => {
    if (!userId) {
      console.log("Cannot refresh conversation: missing userId");
      return [];
    }
    
    try {
      console.log(`Refreshing messages for conversation with user: ${userId}`);
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
