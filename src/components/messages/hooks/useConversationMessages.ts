
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
      return null;
    }
    
    try {
      // Clear any previous connection error state
      setConnectionError(false);
      
      // Send the message
      const sentMessage = await sendMessage(userId, message.trim());
      
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
    }
  }, [sendMessage, setConnectionError, toast]);

  return {
    handleSendMessage
  };
}
