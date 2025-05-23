
import { useEffect } from "react";

export function useMessageSync(
  messages: any[],
  localMessages: any[],
  setMessages: (messages: any[]) => void,
  previousUserIdRef: React.MutableRefObject<string | undefined>,
  userId: string | undefined,
  clearLocalMessages: () => void
) {
  // Merge messages from server and local state
  useEffect(() => {
    if (messages.length > 0 || localMessages.length > 0) {
      console.log(`Merging ${messages.length} server messages with ${localMessages.length} local messages`);
      
      // Create a combined message array with no duplicates
      const combinedMessages = [...messages];
      
      // Add local messages that aren't already in the combined array
      localMessages.forEach(localMsg => {
        if (!combinedMessages.some(msg => msg.id === localMsg.id)) {
          combinedMessages.push(localMsg);
        }
      });
      
      // Sort by created_at date
      combinedMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      // Update server messages state with combined messages
      setMessages(combinedMessages);
      console.log(`Combined message list contains ${combinedMessages.length} messages`);
    }
  }, [messages, localMessages, setMessages]);

  // Clear messages when switching conversations
  useEffect(() => {
    if (previousUserIdRef.current !== userId) {
      console.log("Conversation changed, clearing message state");
      clearLocalMessages();
      setMessages([]);
    }
  }, [userId, setMessages, clearLocalMessages, previousUserIdRef]);
}
