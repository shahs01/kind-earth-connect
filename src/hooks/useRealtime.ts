
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RealtimeOptions {
  userId?: string;
  currentUserId?: string;
  onMessageReceived: (message: any) => void;
  setConnectionError: (value: boolean) => void;
  channelRef: React.RefObject<any>;
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
            // Instead of directly modifying channelRef.current, store the channel in a variable
            // that the parent component can access
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
      
      return channel;
    } catch (err) {
      console.error("Error setting up realtime:", err);
      setConnectionError(true);
      setIsConnecting(false);
      return null;
    }
  }, [userId, currentUserId, onMessageReceived, setConnectionError, channelRef]);
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (channelRef?.current) {
        console.log("Removing channel on useRealtime unmount");
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelRef]);
  
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
  const channelRef = useRef<any>(null);
  
  const setupGlobalNotifications = useCallback(() => {
    if (!user?.id) {
      console.log("No user ID available, not setting up global message notifications");
      return null;
    }

    try {
      console.log("Setting up global message notifications for user:", user.id);
      
      const channel = supabase.channel(`private:user:${user.id}`, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });
      
      channel
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
            // Use the mutable ref pattern correctly
            channelRef.current = channel;
          }
        });
      
      return channel;
    } catch (error) {
      console.error("Error setting up global message notifications:", error);
      return null;
    }
  }, [user?.id, onNewMessage]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        console.log("Removing channel on useGlobalMessageNotifications unmount");
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);
  
  return {
    setupGlobalNotifications,
    isConnecting,
    channelRef
  };
}
