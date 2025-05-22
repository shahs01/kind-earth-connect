
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useConversationProfile } from "./hooks/useConversationProfile";
import { useConversationMessages } from "./hooks/useConversationMessages";
import { useRealtime } from "@/hooks/useRealtime";
import { useConversationReconnect } from "./hooks/useConversationReconnect";
import { Message } from "@/hooks/useConversations";
import { supabase } from "@/integrations/supabase/client";

export default function useConversation(userId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const channelRef = useRef<any>(null);

  // Get profile information for the other user
  const {
    otherUser,
    loading: profileLoading,
    reportUser,
  } = useConversationProfile(userId);

  // Set up real-time messaging
  const {
    setupRealtimeSubscription,
    isConnecting,
  } = useRealtime({
    userId,
    currentUserId: user?.id,
    onMessageReceived: handleNewMessage,
    setConnectionError,
    channelRef,
  });

  // Function to fetch messages
  const fetchMessages = useCallback(async (targetUserId: string) => {
    if (!user?.id) {
      console.error("Cannot fetch messages without user ID");
      return;
    }

    try {
      console.log(`Fetching messages between ${user.id} and ${targetUserId}`);
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      console.log(`Retrieved ${data?.length || 0} messages`);
      setMessages(data as Message[] || []);
      return data;
    } catch (err) {
      console.error("Error fetching messages:", err);
      setConnectionError(true);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try reconnecting.",
        variant: "destructive",
      });
      return null;
    }
  }, [user?.id, toast]);

  // Send a message
  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!user?.id) {
      console.error("Cannot send message without user ID");
      return null;
    }

    try {
      console.log(`Sending message to ${receiverId}: ${content}`);
      
      const message = {
        sender_id: user.id,
        receiver_id: receiverId,
        content: content,
      };

      const { data, error } = await supabase.from("messages").insert(message).select();

      if (error) {
        throw error;
      }

      console.log("Message sent successfully:", data);
      return data[0];
    } catch (err) {
      console.error("Error sending message:", err);
      throw err;
    }
  }, [user?.id]);

  // Handle a new message received through real-time subscription
  function handleNewMessage(message: Message) {
    console.log("Processing new message:", message);
    setMessages((prevMessages) => {
      // Check if the message already exists to prevent duplicates
      const messageExists = prevMessages.some(
        (m) => m.id === message.id
      );
      
      if (messageExists) {
        console.log("Message already exists in state, not adding duplicate");
        return prevMessages;
      }
      
      console.log("Adding new message to state");
      return [...prevMessages, message];
    });
  }

  // Set up the real-time connection
  useEffect(() => {
    if (user?.id && userId && userId !== "new") {
      console.log("Setting up conversation with userId:", userId);
      
      // Fetch initial messages
      fetchMessages(userId);
      
      // Set up real-time subscription
      const channel = setupRealtimeSubscription();
      if (channel) {
        channelRef.current = channel;
      }

      // Clean up on unmount
      return () => {
        console.log("Cleaning up conversation real-time connection");
        if (channelRef.current) {
          console.log("Removing channel subscription");
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    }
  }, [user?.id, userId, fetchMessages, setupRealtimeSubscription]);

  // Handle sending messages through the messages hook
  const { handleSendMessage } = useConversationMessages(
    sendMessage,
    fetchMessages,
    setConnectionError
  );

  // Handle reconnecting when there's a connection error
  const { isReconnecting, handleReconnect } = useConversationReconnect(
    fetchMessages,
    setupRealtimeSubscription,
    userId,
    channelRef,
    setConnectionError
  );

  // Function to handle sending a specific message
  const handleSend = useCallback((content: string) => {
    if (!userId) return;
    
    setSending(true);
    
    handleSendMessage(userId, content)
      .finally(() => {
        setSending(false);
      });
  }, [userId, handleSendMessage]);

  return {
    user,
    otherUser,
    loading: profileLoading || isConnecting,
    profileLoading,
    messages,
    sending,
    isProfileOpen,
    setIsProfileOpen,
    connectionError,
    isReconnecting,
    handleSendMessage: handleSend,
    handleReportUser: reportUser,
    handleReconnect,
  };
}
