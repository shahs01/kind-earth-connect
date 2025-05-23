
import { useCallback, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Message } from "@/hooks/useMessages";
import { useRealtime } from "@/hooks/useRealtime";

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
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Set up realtime subscription to listen for new messages
  const { setupRealtimeSubscription, isConnecting } = useRealtime({
    userId,
    currentUserId,
    onMessageReceived,
    setConnectionError,
    channelRef
  });

  return {
    channelRef,
    setupRealtimeSubscription,
    isConnecting
  };
}
