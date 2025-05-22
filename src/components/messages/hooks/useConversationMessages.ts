
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export function useConversationMessages(
  sendMessage: (userId: string, message: string) => Promise<any>,
  fetchMessages: (userId: string) => Promise<any>,
  setConnectionError: (value: boolean) => void
) {
  const { toast } = useToast();

  const handleSendMessage = useCallback(async (userId: string, message: string) => {
    if (!message.trim() || !userId) {
      console.log("Cannot send empty message or missing userId");
      return null;
    }
    
    console.log("Attempting to send message to userId:", userId, "content:", message.substring(0, 20) + (message.length > 20 ? '...' : ''));
    try {
      // Clear any previous connection error state
      setConnectionError(false);
      
      // Send the message using the hook
      const sentMessage = await sendMessage(userId, message.trim());
      console.log("Message sent successfully:", sentMessage?.id || 'No ID returned');
      
      return sentMessage;
    } catch (error) {
      console.error("Failed to send message:", error);
      setConnectionError(true);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }, [sendMessage, setConnectionError, toast]);

  return {
    handleSendMessage
  };
}
