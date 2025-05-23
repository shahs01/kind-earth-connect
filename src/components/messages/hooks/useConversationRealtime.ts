
import { useCallback, useState, useEffect, useRef } from "react";
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
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  // Clean up previous channel when component unmounts
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        console.log("Removing existing channel on unmount");
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);
  
  // Set up realtime subscription to listen for new messages
  const setupRealtimeSubscription = useCallback(() => {
    if (!userId || !currentUserId) {
      console.error("Cannot set up realtime without userId and currentUserId");
      return null;
    }
    
    // Clean up any existing channel first
    if (channelRef.current) {
      console.log("Removing existing channel before creating a new one");
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    setIsConnecting(true);
    console.log(`Setting up realtime subscription for conversation between ${currentUserId} and ${userId}`);
    
    try {
      // Create a unique channel name based on user IDs - ensures unique channel
      const userIds = [currentUserId, userId].sort();
      const channelName = `private:messages:${userIds[0]}:${userIds[1]}`;
      
      console.log(`Creating channel: ${channelName}`);
      
      // Create the channel
      const channel = supabase.channel(channelName);
      
      // Store in ref for cleanup
      channelRef.current = channel;
      
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
          async (payload) => {
            console.log("Realtime: New message received from other user", payload);
            // Check if message is meant for current user
            if (payload.new && payload.new.receiver_id === currentUserId) {
              try {
                // Fetch the sender profile
                const { data: senderData } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', payload.new.sender_id)
                  .maybeSingle();
                
                // Construct message with sender data
                const message = {
                  ...payload.new,
                  sender: senderData ? {
                    id: senderData.id,
                    username: senderData.username || '',
                    email: senderData.email || '',
                    name: senderData.name || '',
                    avatar: senderData.avatar || '',
                    bio: senderData.bio || '',
                    location: senderData.location || '',
                    trustScore: senderData.trust_score || 0,
                    helpOffered: senderData.help_offered || 0,
                    helpReceived: senderData.help_received || 0,
                    volunteerHours: senderData.volunteer_hours || 0,
                    createdAt: new Date(),
                    verifiedStatus: false,
                    emailVerified: true,
                    trustBadges: [],
                    loginAttempts: 0,
                    lastLoginAttempt: null
                  } : undefined
                };
                
                onMessageReceived(message as Message);
              } catch (err) {
                console.error("Error processing realtime message:", err);
                // Still add message even without profile data
                onMessageReceived(payload.new as Message);
              }
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
          async (payload) => {
            console.log("Realtime: New message sent by current user", payload);
            if (payload.new && payload.new.receiver_id === userId) {
              try {
                // Fetch the sender profile (current user)
                const { data: senderData } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', payload.new.sender_id)
                  .maybeSingle();
                
                // Construct message with sender data
                const message = {
                  ...payload.new,
                  sender: senderData ? {
                    id: senderData.id,
                    username: senderData.username || '',
                    email: senderData.email || '',
                    name: senderData.name || '',
                    avatar: senderData.avatar || '',
                    bio: senderData.bio || '',
                    location: senderData.location || '',
                    trustScore: senderData.trust_score || 0,
                    helpOffered: senderData.help_offered || 0,
                    helpReceived: senderData.help_received || 0,
                    volunteerHours: senderData.volunteer_hours || 0,
                    createdAt: new Date(),
                    verifiedStatus: false,
                    emailVerified: true,
                    trustBadges: [],
                    loginAttempts: 0,
                    lastLoginAttempt: null
                  } : undefined
                };
                
                onMessageReceived(message as Message);
              } catch (err) {
                console.error("Error processing realtime message:", err);
                // Still add message even without profile data
                onMessageReceived(payload.new as Message);
              }
            }
          }
        )
        .subscribe((status) => {
          setIsConnecting(false);
          console.log(`Realtime subscription status: ${status}`);
          
          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to realtime messages");
            setConnectionError(false);
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("Error subscribing to realtime messages:", status);
            setConnectionError(true);
          }
        });
      
      return channel;
    } catch (err) {
      console.error("Error setting up realtime subscription:", err);
      setConnectionError(true);
      setIsConnecting(false);
      return null;
    }
  }, [userId, currentUserId, onMessageReceived, setConnectionError]);
  
  return {
    setupRealtimeSubscription,
    isConnecting,
    channelRef
  };
}
