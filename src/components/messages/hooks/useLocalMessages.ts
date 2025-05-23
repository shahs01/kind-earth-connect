
import { useState, useCallback, useEffect } from "react";
import { Message } from "@/hooks/useMessages";

export function useLocalMessages() {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  
  // When a new message is received via realtime, add it to the messages list
  const handleMessageReceived = useCallback((newMessage: any) => {
    console.log(`Message received:`, newMessage);
    
    // Add message to state to display immediately
    setLocalMessages(prev => {
      // Check if message already exists to avoid duplicates
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) {
        console.log("Message already in local state, not adding duplicate");
        return prev;
      }
      
      const updatedMessages = [...prev, newMessage].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      console.log(`Updated local messages state, now contains ${updatedMessages.length} messages`);
      return updatedMessages;
    });
  }, []);

  // Clear local messages
  const clearLocalMessages = useCallback(() => {
    console.log("Clearing local messages");
    setLocalMessages([]);
  }, []);

  return {
    localMessages,
    setLocalMessages,
    handleMessageReceived,
    clearLocalMessages
  };
}
