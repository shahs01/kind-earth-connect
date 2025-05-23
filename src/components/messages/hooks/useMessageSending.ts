
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
    
    // Create optimistic message for instant display
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      sender_id: userId, // This will be updated when the real message comes back
      receiver_id: userId,
      created_at: new Date().toISOString(),
      read: false
    };
    
    // Add optimistic message immediately
    setLocalMessages(prev => {
      const updatedMessages = [...prev, optimisticMessage].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      return updatedMessages;
    });
    
    try {
      console.log(`useMessageSending: Sending message to ${userId}: ${content.substring(0, 20)}${content.length > 20 ? '...' : ''}`);
      
      const sentMessage = await sendMessage(userId, content.trim());
      
      // Replace optimistic message with real message
      if (sentMessage) {
        console.log("useMessageSending: Message sent successfully, replacing optimistic message");
        setLocalMessages(prev => {
          // Remove the optimistic message and add the real one
          const withoutOptimistic = prev.filter(msg => msg.id !== optimisticMessage.id);
          
          // Check if real message already exists to avoid duplicates
          const exists = withoutOptimistic.some(msg => msg.id === sentMessage.id);
          if (exists) return withoutOptimistic;
          
          const updatedMessages = [...withoutOptimistic, sentMessage].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          return updatedMessages;
        });
      }
      
      return sentMessage;
    } catch (error) {
      console.error("useMessageSending: Failed to send message", error);
      
      // Remove the optimistic message on error
      setLocalMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      
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
