
import { useCallback } from "react";
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
  
  const handleSendMessage = useCallback(async (content: string) => {
    if (!userId || !content.trim()) {
      return Promise.reject(new Error("Missing user ID or empty message"));
    }
    
    try {
      const sentMessage = await sendMessage(userId, content.trim());
      
      // Add sent message to local messages state immediately
      if (sentMessage) {
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
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  }, [userId, sendMessage, setLocalMessages, toast]);

  return {
    handleSendMessage
  };
}
