
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useConversationReconnect(
  fetchMessages: (userId: string) => Promise<any>,
  setupRealtimeSubscription: () => any,
  userId: string | undefined,
  channelRef: React.RefObject<any>,
  setConnectionError: (value: boolean) => void
) {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const { toast } = useToast();

  const handleReconnect = useCallback(async () => {
    if (!userId) return;
    
    setIsReconnecting(true);
    try {
      // Remove existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      // Reload messages
      await fetchMessages(userId);
      
      // Set up a new real-time connection
      setupRealtimeSubscription();
      
      toast({
        title: "Reconnected",
        description: "Successfully reconnected to the messaging service",
      });
      
      setConnectionError(false);
    } catch (err) {
      console.error("Error reconnecting:", err);
      toast({
        title: "Reconnection failed",
        description: "Please try again or reload the page",
        variant: "destructive"
      });
    } finally {
      setIsReconnecting(false);
    }
  }, [userId, fetchMessages, setupRealtimeSubscription, channelRef, setConnectionError, toast]);

  return {
    isReconnecting,
    handleReconnect
  };
}
