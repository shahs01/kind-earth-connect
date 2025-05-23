
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeOptions {
  userId?: string;
  currentUserId?: string;
  onMessageReceived: (message: any) => void;
  setConnectionError: (value: boolean) => void;
  channelRef: React.MutableRefObject<RealtimeChannel | null>;
}

export function useRealtime({
  userId,
  currentUserId,
  onMessageReceived,
  setConnectionError,
  channelRef
}: RealtimeOptions) {
  const [isConnecting, setIsConnecting] = useState(false);
  
  const setupRealtimeSubscription = useCallback(() => {
    if (!userId || !currentUserId) {
      console.error("Cannot set up realtime without userId and currentUserId");
      return null;
    }
    
    try {
      setIsConnecting(true);
      setConnectionError(false);
      
      // Clean up any existing channel first
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      // Create a unique channel name based on user IDs
      const userIds = [currentUserId, userId].sort();
      const channelName = `private:messages:${userIds[0]}:${userIds[1]}`;
      
      // Create the channel
      const channel = supabase.channel(channelName);
      
      // Subscribe to message inserts
      channel
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId}))` 
          },
          (payload) => {
            onMessageReceived(payload.new);
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsConnecting(false);
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("Error subscribing to realtime updates:", status);
            setConnectionError(true);
            setIsConnecting(false);
          }
        });
      
      return channel;
    } catch (err) {
      console.error("Error setting up realtime:", err);
      setConnectionError(true);
      setIsConnecting(false);
      return null;
    }
  }, [userId, currentUserId, onMessageReceived, setConnectionError, channelRef]);
  
  return {
    setupRealtimeSubscription,
    isConnecting,
  };
}

export function useGlobalMessageNotifications(
  user: any,
  onNewMessage: () => void
) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  const setupGlobalNotifications = useCallback(() => {
    if (!user?.id) {
      return null;
    }
    
    try {
      // Clean up any existing channel first
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      const newChannel = supabase.channel(`private:user:${user.id}`);
      
      newChannel
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `receiver_id.eq.${user.id}` 
          },
          () => {
            onNewMessage();
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setChannel(newChannel);
          }
        });
      
      return newChannel;
    } catch (error) {
      console.error("Error setting up global message notifications:", error);
      return null;
    }
  }, [user?.id, onNewMessage]);
  
  // Update the ref when channel changes
  useEffect(() => {
    if (channel) {
      channelRef.current = channel;
    }
  }, [channel]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);
  
  return {
    setupGlobalNotifications,
    isConnecting,
    channel,
    channelRef
  };
}
