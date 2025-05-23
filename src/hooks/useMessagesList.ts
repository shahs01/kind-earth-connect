
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { Message } from "./useConversations";

export function useMessagesList() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionError, setConnectionError] = useState(false);
  const { toast } = useToast();

  const fetchMessages = useCallback(async (userId: string) => {
    if (!userId) {
      console.error("No userId provided to fetchMessages");
      return [];
    }
    
    setLoading(true);
    console.log(`Fetching messages for conversation with user: ${userId}`);
    
    try {
      // Get the authenticated user's ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Authentication error or not authenticated");
        setConnectionError(true);
        throw authError || new Error("Not authenticated");
      }
      
      // Get messages between current user and the selected user
      // Using proper SQL syntax for the filter instead of or()
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${userId}`)
        .or(`sender_id.eq.${userId},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching messages:", error);
        setConnectionError(true);
        throw error;
      }
      
      setConnectionError(false);
      
      if (Array.isArray(data)) {
        console.log(`Retrieved ${data.length} messages for conversation with user: ${userId}`);
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
    console.log(`Adding new message to state: ${newMessage.id}`);
    
    // Use functional update to prevent race conditions
    setMessages(prev => {
      // Check if message already exists to avoid duplicates
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) {
        console.log("Message already exists in state, skipping");
        return prev;
      }
      
      // Sort messages by created_at date
      const updatedMessages = [...prev, newMessage].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      console.log(`Updated message list now contains ${updatedMessages.length} messages`);
      return updatedMessages;
    });
  }, []);

  // Reset messages when component unmounts to avoid state bleed between conversations
  useEffect(() => {
    return () => {
      console.log("Resetting messages list on unmount");
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
