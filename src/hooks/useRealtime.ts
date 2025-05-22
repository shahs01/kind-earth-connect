
import { useRef, useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { User } from "@/types";
import { Message } from "./useConversations";

interface UseRealtimeProps {
  userId?: string;
  currentUserId?: string;
  onMessageReceived?: (message: Message) => void;
  setConnectionError: (error: boolean) => void;
  channelRef?: React.RefObject<any>;
}

export function useRealtime({ 
  userId, 
  currentUserId, 
  onMessageReceived, 
  setConnectionError,
  channelRef: externalChannelRef
}: UseRealtimeProps) {
  // Use external channelRef if provided, otherwise create our own
  const internalChannelRef = useRef<any>(null);
  const channelRef = externalChannelRef || internalChannelRef;
  
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  
  const setupRealtimeSubscription = useCallback(() => {
    if (!currentUserId || !userId) {
      console.log("Missing userId or currentUserId, cannot setup real-time subscription");
      return null;
    }
    
    if (isConnecting) {
      console.log("Already setting up subscription, skipping duplicate attempt");
      return null;
    }
    
    console.log(`Setting up message conversation real-time subscription with userId: ${userId} and currentUserId: ${currentUserId}`);
    setIsConnecting(true);
    
    try {
      // Clean up any existing subscription
      if (channelRef.current) {
        console.log("Removing existing channel before creating a new one");
        supabase.removeChannel(channelRef.current);
        // Don't directly modify .current as it's read-only in strict mode
        channelRef.current = null;
      }
      
      // Create a unique channel name that remains consistent regardless of which user is first
      const channelName = `public:messages:${currentUserId}-${userId}`;
      console.log(`Creating new channel: ${channelName}`);
      
      // This filter ensures we only get messages between these two users
      const filter = `or(and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId}))`;
      console.log("Using filter:", filter);
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: filter
          },
          (payload) => {
            console.log("Received real-time message update:", payload);
            if (onMessageReceived && payload.new) {
              // Explicitly cast the payload to Message type
              const newMessage = payload.new as Message;
              console.log("Processing received message:", newMessage);
              onMessageReceived(newMessage);
            }
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${channelName}:`, status);
          setIsConnecting(false);
          
          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to real-time updates for channel: ${channelName}`);
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
      
      // Store channel reference - using bracket notation to avoid TypeScript error
      channelRef.current = channel;
      
      return channel;
    } catch (err) {
      console.error("Error setting up real-time subscription:", err);
      setConnectionError(true);
      setIsConnecting(false);
      return null;
    }
  }, [userId, currentUserId, onMessageReceived, toast, setConnectionError, isConnecting, channelRef]);

  // Set up subscription when parameters change
  useEffect(() => {
    console.log("Setting up real-time subscription with userId:", userId, "currentUserId:", currentUserId);
    const channel = setupRealtimeSubscription();
    
    return () => {
      if (channelRef.current) {
        console.log("Removing channel on component unmount or parameters change");
        supabase.removeChannel(channelRef.current);
        // Don't directly modify .current as it's read-only in strict mode
        channelRef.current = null;
      }
    };
  }, [userId, currentUserId, setupRealtimeSubscription]);

  return {
    setupRealtimeSubscription,
    channelRef,
    isConnecting
  };
}

// For global message notifications
export function useGlobalMessageNotifications(currentUser: User | null, onNewMessage: () => void) {
  const channelRef = useRef<any>(null);
  const { toast } = useToast();
  const [connectionError, setConnectionError] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const setupGlobalNotifications = useCallback(() => {
    if (!currentUser) {
      console.log("No current user, skipping global notifications setup");
      return null;
    }
    
    if (isConnecting) {
      console.log("Already setting up global notifications, skipping duplicate attempt");
      return null;
    }
    
    try {
      setIsConnecting(true);
      console.log("Setting up real-time subscription for new messages");
      
      // Clean up any existing subscription
      if (channelRef.current) {
        console.log("Removing existing channel before creating new one");
        supabase.removeChannel(channelRef.current);
        // Don't directly modify .current as it's read-only in strict mode
        channelRef.current = null;
      }
      
      // Create a unique channel name for the user with proper prefix for realtime
      const channelName = `public:messages:new-${currentUser.id}`;
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
          setIsConnecting(false);
          
          if (status === 'SUBSCRIBED') {
            console.log("Global notification channel subscribed successfully");
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
      
      // Store channel reference - using bracket notation to avoid TypeScript error
      channelRef.current = channel;
      
      return channel;
    } catch (err) {
      console.error("Error setting up real-time subscription:", err);
      setConnectionError(true);
      setIsConnecting(false);
      return null;
    }
  }, [currentUser, onNewMessage, toast, isConnecting]);

  // Set up subscription when user changes
  useEffect(() => {
    console.log("Setting up global notification subscription for user:", currentUser?.id);
    const channel = setupGlobalNotifications();
    
    return () => {
      if (channelRef.current) {
        console.log("Removing global notification channel on unmount");
        supabase.removeChannel(channelRef.current);
        // Don't directly modify .current as it's read-only in strict mode
        channelRef.current = null;
      }
    };
  }, [currentUser?.id, setupGlobalNotifications]);

  return {
    setupGlobalNotifications,
    channelRef,
    connectionError,
    setConnectionError,
    isConnecting
  };
}
