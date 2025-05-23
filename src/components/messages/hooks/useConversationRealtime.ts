
import { useCallback, useState } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Message } from "@/hooks/useMessages";
import { supabase } from "@/integrations/supabase/client";

interface UseConversationRealtimeProps {
  userId?: string;
  currentUserId?: string;
  onMessageReceived: (message: Message) => void;
  setConnectionError: (value: boolean) => void;
}

export function useConversationRealtime({
  userId,
  currentUserId,
  onMessageReceived,
  setConnectionError
}: UseConversationRealtimeProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Set up realtime subscription to listen for new messages
  const setupRealtimeSubscription = useCallback(() => {
    if (!userId || !currentUserId) {
      console.error("Cannot set up realtime without userId and currentUserId");
      return null;
    }
    
    setIsConnecting(true);
    
    try {
      console.log(`Setting up realtime subscription for conversation between ${currentUserId} and ${userId}`);
      
      // Create a unique channel name based on user IDs - ensures unique channel
      const userIds = [currentUserId, userId].sort();
      const channelName = `private:messages:${userIds[0]}:${userIds[1]}`;
      
      console.log(`Setting up realtime subscription on channel: ${channelName}`);
      
      // Create the channel
      const channel = supabase.channel(channelName);
      
      // Listen for messages from the other user to current user
      channel
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `sender_id=eq.${userId}` 
          },
          (payload) => {
            console.log(`Received message in ${channelName} from user ${userId}:`, {
              messageId: payload.new.id,
              sender: payload.new.sender_id,
              receiver: payload.new.receiver_id,
              timestamp: new Date().toISOString()
            });
            
            // Check if message is meant for current user and properly cast it
            if (payload.new.receiver_id === currentUserId) {
              console.log(`Processing incoming message from ${userId} to ${currentUserId}`);
              const message = payload.new as unknown as Message;
              onMessageReceived(message);
            }
          }
        )
        // Also listen for messages from current user to the other user (for multi-device sync)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `sender_id=eq.${currentUserId}` 
          },
          (payload) => {
            if (payload.new.receiver_id === userId) {
              console.log(`Processing outgoing message from ${currentUserId} to ${userId}`);
              const message = payload.new as unknown as Message;
              onMessageReceived(message);
            }
          }
        )
        .subscribe((status) => {
          console.log(`Realtime channel status: ${status}`);
          setIsConnecting(false);
          
          if (status === "SUBSCRIBED") {
            console.log(`Successfully subscribed to realtime updates on channel ${channelName}`);
            setConnectionError(false);
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error(`Error subscribing to realtime updates on channel ${channelName}:`, status);
            setConnectionError(true);
          }
        });
      
      console.log(`Realtime subscription setup complete for channel ${channelName}`);
      return channel;
    } catch (err) {
      console.error("Error setting up realtime:", err);
      setConnectionError(true);
      setIsConnecting(false);
      return null;
    }
  }, [userId, currentUserId, onMessageReceived, setConnectionError]);
  
  return {
    setupRealtimeSubscription,
    isConnecting
  };
}
