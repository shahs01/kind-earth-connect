
import { useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useConversationLifecycle(
  userId: string | undefined,
  user: any,
  fetchMessages: (userId: string) => Promise<any>,
  fetchOtherUser: (userId: string) => Promise<any>,
  markMessagesAsRead: (userId: string) => Promise<void>,
  setupRealtimeSubscription: () => any,
  channelRef: React.MutableRefObject<any>,
  setConnectionError: (value: boolean) => void
) {
  const loadingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const previousUserIdRef = useRef<string | undefined>(undefined);
  
  // Component lifecycle tracking
  useEffect(() => {
    console.log("useConversationLifecycle hook initialized with userId:", userId);
    isMountedRef.current = true;
    
    return () => {
      console.log("useConversationLifecycle hook cleanup for userId:", userId);
      isMountedRef.current = false;
    };
  }, [userId]);
  
  // Clean up previous connection when switching conversations
  useEffect(() => {
    // If the userId has changed and there was a previous channel
    if (previousUserIdRef.current !== userId && channelRef.current) {
      console.log("Cleaning up previous realtime subscription before creating a new one");
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    previousUserIdRef.current = userId;
  }, [userId, channelRef]);
  
  // Fetch messages and set up realtime when the component mounts or userId changes
  useEffect(() => {
    if (!userId || !user?.id || !isMountedRef.current) return;
    
    // Prevent multiple concurrent loads
    if (loadingRef.current) {
      console.log("Already loading conversation, skipping redundant load");
      return;
    }
    
    loadingRef.current = true;
    console.log("Fetching messages for conversation:", userId);
    
    // Use an async function to handle the sequential loading with optimization
    const loadConversation = async () => {
      try {
        console.log("Starting conversation load sequence for userId:", userId);
        
        // Step 1: Fetch other user profile first
        console.log("Fetching other user profile");
        await fetchOtherUser(userId);
        
        if (!isMountedRef.current) {
          console.log("Component unmounted during profile fetch, aborting");
          return;
        }
        
        // Step 2: Fetch messages
        console.log("Fetching messages");
        const fetchedMessages = await fetchMessages(userId);
        
        if (!isMountedRef.current) {
          console.log("Component unmounted during message fetch, aborting");
          return;
        }
        
        // Ensure we have the full message list
        if (fetchedMessages && fetchedMessages.length > 0) {
          console.log(`Received ${fetchedMessages.length} messages from server`);
        } else {
          console.log("No messages found for this conversation");
        }
        
        // Step 3: Setup realtime only after messages are loaded
        console.log("Setting up realtime for conversation:", userId);
        const channel = setupRealtimeSubscription();
        if (channel && isMountedRef.current) {
          channelRef.current = channel;
          console.log("Realtime channel set up successfully");
        }
        
        // Step 4: Mark messages as read
        console.log("Marking messages as read");
        await markMessagesAsRead(userId);
        
        if (isMountedRef.current) {
          setConnectionError(false);
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
        if (isMountedRef.current) {
          setConnectionError(true);
        }
      } finally {
        if (isMountedRef.current) {
          loadingRef.current = false;
        }
      }
    };
    
    loadConversation();
    
    // Clean up realtime subscription when the component unmounts or userId changes
    return () => {
      if (channelRef.current) {
        console.log("Cleaning up realtime subscription on unmount/userId change");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      loadingRef.current = false;
    };
  }, [
    userId, 
    user?.id, 
    fetchMessages, 
    setupRealtimeSubscription, 
    markMessagesAsRead, 
    fetchOtherUser,
    channelRef,
    setConnectionError
  ]);
}
