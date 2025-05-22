
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type FetchMessagesFunction = (userId: string) => Promise<any>;
type SetupRealtimeFunction = () => any;

export function useConversationReconnect(
  fetchMessages: FetchMessagesFunction,
  setupRealtime: SetupRealtimeFunction,
  userId: string | undefined,
  channelRef: React.RefObject<any>,
  setConnectionError: (value: boolean) => void
) {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const { toast } = useToast();
  
  const handleReconnect = useCallback(async () => {
    if (!userId) {
      console.error("Cannot reconnect without userId");
      return;
    }
    
    setIsReconnecting(true);
    
    try {
      console.log("Attempting to reconnect to conversation:", userId);
      
      // Clean up existing channel if exists
      if (channelRef.current) {
        console.log("Cleaning up existing channel before reconnecting");
        supabase.removeChannel(channelRef.current);
        // Don't try to directly modify channelRef.current
      }
      
      // Refetch messages
      console.log("Refetching messages for reconnection");
      await fetchMessages(userId);
      
      // Setup new real-time connection
      console.log("Setting up new real-time connection");
      const channel = setupRealtime();
      
      if (channel) {
        console.log("Successfully reconnected and established new channel");
        toast({
          title: "Reconnected",
          description: "Chat connection restored successfully"
        });
        setConnectionError(false);
      } else {
        throw new Error("Failed to establish new channel connection");
      }
    } catch (err) {
      console.error("Error reconnecting:", err);
      setConnectionError(true);
      toast({
        title: "Reconnection failed",
        description: "Unable to restore chat connection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsReconnecting(false);
    }
  }, [userId, fetchMessages, setupRealtime, channelRef, setConnectionError, toast]);
  
  return {
    isReconnecting,
    handleReconnect
  };
}
