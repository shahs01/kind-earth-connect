
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
    if (!userId) {
      console.error("Cannot send message: missing userId");
      return Promise.reject(new Error("No user ID provided"));
    }
    
    console.log(`Handling send message to userId: ${userId}, content: ${content.substring(0, 20)}${content.length > 20 ? '...' : ''}`);
    
    try {
      const sentMessage = await sendMessage(userId, content);
      
      // Add sent message to local messages state immediately
      if (sentMessage) {
        console.log("Message sent successfully, updating local state with:", sentMessage.id);
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
      console.error("Failed to send message:", error);
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
