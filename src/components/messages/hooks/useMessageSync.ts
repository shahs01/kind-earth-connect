
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
    if (!userId) return;
    
    console.log("useMessageSync: Merging messages", {
      serverMessages: messages.length,
      localMessages: localMessages.length,
      userId
    });
    
    if (messages.length > 0 || localMessages.length > 0) {
      // Create a combined message array with no duplicates
      const existingIds = new Set(messages.map(msg => msg.id));
      let combinedMessages = [...messages];
      
      // Add local messages that aren't already in the combined array
      localMessages.forEach(localMsg => {
        if (!existingIds.has(localMsg.id)) {
          combinedMessages.push(localMsg);
          console.log("useMessageSync: Adding local message to merged state", localMsg.id);
        }
      });
      
      // Sort by created_at date
      combinedMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      // Check if there's a significant difference to avoid unnecessary rerenders
      const hasChanges = 
        combinedMessages.length !== messages.length || 
        JSON.stringify(combinedMessages.map(m => m.id)) !== JSON.stringify(messages.map(m => m.id));
      
      if (hasChanges) {
        console.log("useMessageSync: Updating messages state with merged messages");
        // Update server messages state with combined messages
        setMessages(combinedMessages);
      }
    }
  }, [messages, localMessages, setMessages, userId]);

  // Clear messages when switching conversations
  useEffect(() => {
    if (previousUserIdRef.current !== userId) {
      console.log("useMessageSync: Conversation change detected", {
        from: previousUserIdRef.current,
        to: userId
      });
      
      clearLocalMessages();
      
      // Update the reference
      previousUserIdRef.current = userId;
    }
  }, [userId, clearLocalMessages, previousUserIdRef]);
}
