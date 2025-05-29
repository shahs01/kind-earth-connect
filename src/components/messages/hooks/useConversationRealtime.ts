
import { useCallback, useState, useEffect, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Message } from "@/hooks/useMessages";
import { supabase } from "@/integrations/supabase/client";

interface UseConversationRealtimeProps {
  userId?: string;
  currentUserId?: string;
  onMessageReceived: (message: Message) => void;
  onMessageDeleted: (messageId: string) => void;
  setConnectionError: (value: boolean) => void;
}

export function useConversationRealtime({
  userId,
  currentUserId,
  onMessageReceived,
  onMessageDeleted,
  setConnectionError
}: UseConversationRealtimeProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  
  // Clean up previous channel when component unmounts or dependencies change
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        console.log("Cleaning up realtime channel on unmount");
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);
  
  // Set up realtime subscription to listen for new messages and deletions
  const setupRealtimeSubscription = useCallback((): RealtimeChannel | null => {
    if (!userId || !currentUserId) {
      console.error("Cannot set up realtime without userId and currentUserId");
      return null;
    }
    
    // Clean up any existing channel first
    if (channelRef.current) {
      console.log("Removing existing channel before creating a new one");
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    setIsConnecting(true);
    console.log(`Setting up realtime subscription for conversation between ${currentUserId} and ${userId}`);
    
    try {
      // Create a unique channel name based on user IDs
      const channelName = `private:conversation:${currentUserId}-${userId}`;
      console.log(`Creating channel: ${channelName}`);
      
      const channel = supabase.channel(channelName);
      
      // Store in ref for cleanup
      channelRef.current = channel;
      
      // Listen for new messages involving both users
      channel
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages'
          },
          async (payload) => {
            const newMessage = payload.new;
            
            // Check if this message is part of the current conversation
            const isRelevant = (
              (newMessage.sender_id === currentUserId && newMessage.receiver_id === userId) ||
              (newMessage.sender_id === userId && newMessage.receiver_id === currentUserId)
            );
            
            if (!isRelevant) {
              return;
            }
            
            console.log("Realtime: New message received for conversation", payload);
            
            try {
              // Fetch the sender profile
              const { data: senderData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', newMessage.sender_id)
                .maybeSingle();
              
              // Construct message with sender data
              const message = {
                ...newMessage,
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
              
              // Type cast to Message before passing to callback
              onMessageReceived(message as unknown as Message);
            } catch (err) {
              console.error("Error processing realtime message:", err);
              // Still add message even without profile data
              onMessageReceived(newMessage as unknown as Message);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            const deletedMessage = payload.old;
            
            // Check if this deleted message is part of the current conversation
            const isRelevant = (
              (deletedMessage.sender_id === currentUserId && deletedMessage.receiver_id === userId) ||
              (deletedMessage.sender_id === userId && deletedMessage.receiver_id === currentUserId)
            );
            
            if (!isRelevant) {
              return;
            }
            
            console.log("Realtime: Message deleted for conversation", payload);
            onMessageDeleted(deletedMessage.id);
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
  }, [userId, currentUserId, onMessageReceived, onMessageDeleted, setConnectionError]);
  
  return {
    setupRealtimeSubscription,
    isConnecting,
    channelRef
  };
}
