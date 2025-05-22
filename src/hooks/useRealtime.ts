
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
      console.log("Setting up realtime for conversation between:", currentUserId, "and", userId);
      setIsConnecting(true);
      setConnectionError(false);
      
      // Clean up any existing channel first
      if (channelRef.current) {
        console.log("Removing existing channel before creating a new one");
        supabase.removeChannel(channelRef.current);
        // Don't directly modify channelRef.current
      }
      
      // Create channel name based on user IDs
      // Sort IDs to ensure consistent channel names regardless of sender/receiver
      const userIds = [currentUserId, userId].sort();
      const channelName = `private:${userIds[0]}:${userIds[1]}`;
      
      console.log("Creating channel:", channelName);
      
      // Create the channel
      const channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: currentUserId,
          },
        },
      });
      
      // Subscribe to message inserts
      channel
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `or(and(sender_id=eq.${currentUserId},receiver_id=eq.${userId}),and(sender_id=eq.${userId},receiver_id=eq.${currentUserId}))` 
          },
          (payload) => {
            console.log("Realtime message received:", payload);
            onMessageReceived(payload.new);
          }
        )
        .subscribe((status) => {
          console.log("Realtime subscription status:", status);
          
          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to realtime updates for conversation");
            setIsConnecting(false);
            // Return the channel instead of directly modifying the ref
          } else if (status === "CHANNEL_ERROR") {
            console.error("Error subscribing to realtime updates");
            setConnectionError(true);
            setIsConnecting(false);
          } else if (status === "TIMED_OUT") {
            console.error("Timed out subscribing to realtime updates");
            setConnectionError(true);
            setIsConnecting(false);
          }
        });
      
      // Return the channel so the component can store it in the ref
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
      console.log("No user ID available, not setting up global message notifications");
      return null;
    }

    try {
      console.log("Setting up global message notifications for user:", user.id);
      
      // Clean up any existing channel first
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        // Don't directly modify channelRef.current
      }
      
      const newChannel = supabase.channel(`private:user:${user.id}`, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });
      
      newChannel
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `receiver_id=eq.${user.id}` 
          },
          (payload) => {
            console.log("New message notification received:", payload);
            onNewMessage();
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to global message notifications");
            setChannel(newChannel);
          }
        });
      
      return newChannel;
    } catch (error) {
      console.error("Error setting up global message notifications:", error);
      return null;
    }
  }, [user?.id, onNewMessage]);
  
  // Use an effect to safely update the ref when channel changes
  useEffect(() => {
    if (channel) {
      channelRef.current = channel;
    }
  }, [channel]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        console.log("Removing channel on useGlobalMessageNotifications unmount");
        supabase.removeChannel(channelRef.current);
        // Don't directly modify channelRef.current
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
