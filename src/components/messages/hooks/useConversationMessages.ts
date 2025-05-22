
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
      return;
    }
    
    console.log("Sending message to userId:", userId, "content:", message);
    try {
      // Clear any previous connection error state
      setConnectionError(false);
      
      // Send the message using the hook
      const sentMessage = await sendMessage(userId, message.trim());
      console.log("Message sent successfully:", sentMessage);
      
      // Refresh messages after sending to ensure we have the latest
      console.log("Refreshing messages after sending");
      await fetchMessages(userId);
    } catch (error) {
      console.error("Failed to send message:", error);
      setConnectionError(true);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  }, [sendMessage, fetchMessages, setConnectionError, toast]);

  return {
    handleSendMessage
  };
}
