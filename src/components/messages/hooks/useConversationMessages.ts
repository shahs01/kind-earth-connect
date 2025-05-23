
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
      
      // Send the message with retries
      let attempts = 0;
      let sentMessage = null;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !sentMessage) {
        try {
          console.log(`Attempt ${attempts + 1} to send message`);
          sentMessage = await sendMessage(userId, message.trim());
          
          if (sentMessage) {
            console.log("Message sent successfully:", sentMessage.id);
          } else {
            console.error("Send message returned null");
            attempts++;
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          
        } catch (err) {
          console.error(`Error in attempt ${attempts + 1}:`, err);
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`Retrying send message, attempt ${attempts + 1} of ${maxAttempts}`);
            // Increasing delay before retry
            await new Promise(resolve => setTimeout(resolve, 500 * attempts));
          } else {
            throw err;
          }
        }
      }
      
      // If successful, refresh the conversation to ensure we have the latest messages
      if (sentMessage && userId) {
        console.log("Message sent, refreshing conversation");
        setTimeout(() => {
          refreshConversation(userId).catch(err => 
            console.error("Error refreshing conversation after send:", err)
          );
        }, 300);
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
