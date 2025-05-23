
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/hooks/useMessages";

interface UseMessageSendingProps {
  sendMessage: (userId: string, content: string) => Promise<any>;
  setLocalMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  userId?: string;
}

export function useMessageSending({ 
  sendMessage, 
  setLocalMessages, 
  userId 
}: UseMessageSendingProps) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  
  const handleSendMessage = useCallback(async (content: string) => {
    if (!userId || !content.trim()) {
      if (!userId) {
        toast({
          title: "Error",
          description: "Missing user ID. Please select a conversation.",
          variant: "destructive"
        });
      }
      return Promise.reject(new Error("Missing user ID or empty message"));
    }
    
    setIsSending(true);
    
    try {
      console.log(`useMessageSending: Sending message to ${userId}: ${content.substring(0, 20)}${content.length > 20 ? '...' : ''}`);
      
      const sentMessage = await sendMessage(userId, content.trim());
      
      // Add sent message to local messages state immediately
      if (sentMessage) {
        console.log("useMessageSending: Message sent successfully, updating local state");
        setLocalMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg.id === sentMessage.id);
          if (exists) return prev;
          
          const updatedMessages = [...prev, sentMessage].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          return updatedMessages;
        });
      }
      
      return sentMessage;
    } catch (error) {
      console.error("useMessageSending: Failed to send message", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [userId, sendMessage, setLocalMessages, toast]);

  return {
    handleSendMessage,
    isSending
  };
}
