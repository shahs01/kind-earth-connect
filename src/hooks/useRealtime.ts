
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Message } from "./useMessages";

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
        console.log("Removing existing channel before creating new one");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      // Create a unique channel name based on user IDs - ensures unique channel
      const userIds = [currentUserId, userId].sort();
      const channelName = `private:messages:${userIds[0]}:${userIds[1]}`;
      
      console.log(`Setting up realtime subscription on channel: ${channelName}`);
      
      // Create the channel
      const channel = supabase.channel(channelName);
      
      // Set up subscription to listen for messages in both directions
      channel
        // Listen for messages from other user to current user
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})` 
          },
          (payload) => {
            console.log(`Received message in ${channelName} from user ${userId} to ${currentUserId}:`, payload.new.id);
            onMessageReceived(payload.new);
          }
        )
        // Also listen for messages from current user to other user (for multi-device sync)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `and(sender_id.eq.${currentUserId},receiver_id.eq.${userId})` 
          },
          (payload) => {
            console.log(`Received message in ${channelName} from current user ${currentUserId} to ${userId}:`, payload.new.id);
            onMessageReceived(payload.new);
          }
        )
        .subscribe((status) => {
          console.log(`Realtime channel status: ${status}`);
          if (status === "SUBSCRIBED") {
            console.log(`Successfully subscribed to realtime updates on channel ${channelName}`);
            setIsConnecting(false);
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error(`Error subscribing to realtime updates on channel ${channelName}:`, status);
            setConnectionError(true);
            setIsConnecting(false);
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
      console.log("Cannot set up global notifications without user ID");
      return null;
    }
    
    try {
      console.log("Setting up global message notifications for user:", user.id);
      setIsConnecting(true);
      
      // Clean up any existing channel first
      if (channelRef.current) {
        console.log("Removing existing global notification channel");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      const channelName = `private:user:${user.id}:notifications`;
      console.log(`Creating global notification channel: ${channelName}`);
      
      const newChannel = supabase.channel(channelName);
      
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
            console.log("New message notification received:", {
              messageId: payload.new.id,
              from: payload.new.sender_id,
              to: payload.new.receiver_id,
              timestamp: new Date().toISOString()
            });
            
            // Only process messages intended for current user
            if (payload.new.receiver_id === user.id) {
              onNewMessage();
            }
          }
        )
        .subscribe((status) => {
          console.log(`Global notification channel status: ${status}`);
          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to global notifications");
            setIsConnecting(false);
            setChannel(newChannel);
          } else if (status === "CHANNEL_ERROR") {
            console.error("Error subscribing to global notifications");
            setIsConnecting(false);
          }
        });
      
      return newChannel;
    } catch (error) {
      console.error("Error setting up global message notifications:", error);
      setIsConnecting(false);
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
        console.log("Cleaning up global notification channel on unmount");
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
