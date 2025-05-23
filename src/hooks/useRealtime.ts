
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Message } from "./useMessages";

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
