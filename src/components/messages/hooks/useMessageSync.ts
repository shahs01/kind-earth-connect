
import { useEffect } from "react";
import { Message } from "@/hooks/useMessages";

export function useMessageSync(
  messages: Message[],
  localMessages: Message[],
  setMessages: (messages: Message[]) => void,
  previousUserIdRef: React.MutableRefObject<string | undefined>,
  userId: string | undefined,
  clearLocalMessages: () => void
) {
  // Merge messages from server and local state
  useEffect(() => {
    if (messages.length > 0 || localMessages.length > 0) {
      // Create a combined message array with no duplicates
      const existingIds = new Set(messages.map(msg => msg.id));
      let combinedMessages = [...messages];
      
      // Add local messages that aren't already in the combined array
      localMessages.forEach(localMsg => {
        if (!existingIds.has(localMsg.id)) {
          combinedMessages.push(localMsg);
        }
      });
      
      // Sort by created_at date
      combinedMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      // Only update if there's a difference to avoid unnecessary rerenders
      if (combinedMessages.length !== messages.length) {
        // Update server messages state with combined messages
        setMessages(combinedMessages);
      }
    }
  }, [messages, localMessages, setMessages]);

  // Clear messages when switching conversations
  useEffect(() => {
    if (previousUserIdRef.current !== userId) {
      clearLocalMessages();
      setMessages([]);
      
      // Update the reference
      previousUserIdRef.current = userId;
    }
  }, [userId, setMessages, clearLocalMessages, previousUserIdRef]);
}
