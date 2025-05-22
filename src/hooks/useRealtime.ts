
import { useRef, useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { User } from "@/types";

interface UseRealtimeProps {
  userId?: string;
  currentUserId?: string;
  onMessageReceived?: () => void;
  setConnectionError: (error: boolean) => void;
}

export function useRealtime({ 
  userId, 
  currentUserId, 
  onMessageReceived, 
  setConnectionError 
}: UseRealtimeProps) {
  const channelRef = useRef<any>(null);
  const { toast } = useToast();
  
  const setupRealtimeSubscription = useCallback(() => {
    if (!currentUserId || !userId) return null;
    
    console.log(`Setting up message conversation real-time subscription with userId: ${userId}`);
    
    try {
      // Clean up any existing subscription
      if (channelRef.current) {
        console.log("Removing existing channel before creating a new one");
        supabase.removeChannel(channelRef.current);
      }
      
      // Create a new subscription with a unique channel name
      const channelName = `messages:${currentUserId}-${userId}`;
      console.log(`Creating new channel: ${channelName}`);
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId}))`
          },
          () => {
            console.log("Received real-time message update");
            if (onMessageReceived) {
              onMessageReceived();
            }
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${channelName}:`, status);
          if (status === 'SUBSCRIBED') {
            setConnectionError(false);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error(`Realtime subscription error for ${channelName}:`, status);
            setConnectionError(true);
            toast({
              title: "Connection issue",
              description: "Problem connecting to real-time updates",
              variant: "destructive"
            });
          }
        });
      
      // Store the channel reference so we can clean it up later
      channelRef.current = channel;
      return channel;
    } catch (err) {
      console.error("Error setting up real-time subscription:", err);
      setConnectionError(true);
      return null;
    }
  }, [userId, currentUserId, onMessageReceived, toast, setConnectionError]);

  // Clean up function for subscription
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        console.log("Removing channel on component unmount");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return {
    setupRealtimeSubscription,
    channelRef
  };
}

// For global message notifications
export function useGlobalMessageNotifications(currentUser: User | null, onNewMessage: () => void) {
  const channelRef = useRef<any>(null);
  const { toast } = useToast();
  const [connectionError, setConnectionError] = useState(false);

  const setupGlobalNotifications = useCallback(() => {
    if (!currentUser) return null;
    
    try {
      console.log("Setting up real-time subscription for new messages");
      
      // Clean up any existing subscription
      if (channelRef.current) {
        console.log("Removing existing channel before creating new one");
        supabase.removeChannel(channelRef.current);
      }
      
      // Create a unique channel name for the user
      const channelName = `new-messages-${currentUser.id}`;
      console.log(`Creating channel: ${channelName}`);
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${currentUser.id}`
          },
          (payload) => {
            console.log("New message received via real-time:", payload);
            onNewMessage();
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${channelName}:`, status);
          if (status === 'SUBSCRIBED') {
            setConnectionError(false);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error(`Realtime subscription error for ${channelName}:`, status);
            setConnectionError(true);
            toast({
              title: "Connection issue",
              description: "Problem connecting to real-time updates",
              variant: "destructive"
            });
          }
        });
      
      // Store the channel reference so we can clean it up later
      channelRef.current = channel;
      return channel;
    } catch (err) {
      console.error("Error setting up real-time subscription:", err);
      setConnectionError(true);
      return null;
    }
  }, [currentUser, onNewMessage, toast]);

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
    channelRef,
    connectionError,
    setConnectionError
  };
}
