
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
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Clean up previous connection when switching conversations
  useEffect(() => {
    // If the userId has changed and there was a previous channel
    if (previousUserIdRef.current !== userId && channelRef.current) {
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
      return;
    }
    
    loadingRef.current = true;
    
    // Use an async function to handle the sequential loading with optimization
    const loadConversation = async () => {
      try {
        // Step 1: Fetch other user profile first (can happen in parallel)
        const profilePromise = fetchOtherUser(userId);
        
        // Step 2: Fetch messages
        const messagesPromise = fetchMessages(userId);
        
        // Wait for both to complete
        await Promise.all([profilePromise, messagesPromise]);
        
        if (!isMountedRef.current) {
          return;
        }
        
        // Step 3: Setup realtime only after messages are loaded
        const channel = setupRealtimeSubscription();
        if (channel && isMountedRef.current) {
          channelRef.current = channel;
        }
        
        // Step 4: Mark messages as read
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
