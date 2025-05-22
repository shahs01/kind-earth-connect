
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { Message } from "./useConversations";

export function useMessagesList() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionError, setConnectionError] = useState(false);
  const { toast } = useToast();
  
  // Track when the messages state is reset
  useEffect(() => {
    console.log("Messages state initialized/reset");
    return () => {
      console.log("useMessagesList hook cleanup");
    };
  }, []);

  const fetchMessages = useCallback(async (userId: string) => {
    if (!userId) {
      console.error("No userId provided to fetchMessages");
      return [];
    }
    
    setLoading(true);
    try {
      console.log("Fetching messages with userId:", userId);
      // Get the authenticated user's ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Authentication error:", authError);
        setConnectionError(true);
        throw new Error(authError.message);
      }
      
      if (!user) {
        console.error("Not authenticated");
        setConnectionError(true);
        throw new Error("Not authenticated");
      }
      
      console.log("Current user for fetching messages:", user.id);
      
      // Get messages between current user and the selected user
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          content,
          read,
          created_at
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching messages:", error);
        setConnectionError(true);
        throw error;
      }
      
      setConnectionError(false);
      console.log("Messages fetched:", data?.length, data);
      
      if (Array.isArray(data)) {
        // Ensure we're not setting messages to null
        setMessages(data);
        return data;
      } else {
        console.error("Expected array of messages but got:", data);
        setMessages([]);
        return [];
      }
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      setConnectionError(true);
      toast({
        title: "Error fetching messages",
        description: error.message || "Failed to load messages",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addMessageToState = useCallback((newMessage: Message) => {
    console.log("Adding message to state:", newMessage?.id || 'No ID');
    setMessages(prev => {
      // Check if message already exists to avoid duplicates
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) {
        console.log("Message already exists in state, not adding duplicate");
        return prev;
      }
      console.log("Adding new message to state, current count:", prev.length);
      return [...prev, newMessage];
    });
  }, []);

  // Reset messages when component unmounts to avoid state bleed between conversations
  useEffect(() => {
    return () => {
      console.log("Cleanup: resetting messages state in useMessagesList");
      setMessages([]);
    };
  }, []);

  return {
    loading,
    messages,
    setMessages,
    fetchMessages,
    addMessageToState,
    connectionError,
    setConnectionError
  };
}
