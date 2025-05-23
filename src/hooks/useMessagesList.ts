
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
      console.error("useMessagesList: No userId provided to fetchMessages");
      return [];
    }
    
    setLoading(true);
    console.log(`useMessagesList: Fetching messages for conversation with user: ${userId}`);
    
    try {
      // Get the authenticated user's ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("useMessagesList: Authentication error or not authenticated", authError);
        setConnectionError(true);
        throw authError || new Error("Not authenticated");
      }
      
      console.log(`useMessagesList: Current user: ${user.id}, Other user: ${userId}`);
      
      // Get messages between current user and the selected user
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          receiver:profiles!messages_receiver_id_fkey(*)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("useMessagesList: Error fetching messages:", error);
        setConnectionError(true);
        throw error;
      }
      
      console.log(`useMessagesList: Retrieved ${data?.length || 0} messages for conversation with user: ${userId}`);
      
      setConnectionError(false);
      
      // Process messages to ensure proper format
      const processedMessages: Message[] = (data || []).map(message => ({
        ...message,
        sender: message.sender ? {
          id: message.sender.id,
          username: message.sender.username || '',
          email: message.sender.email || '',
          name: message.sender.name || '',
          avatar: message.sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender.name || '')}`,
          bio: message.sender.bio || '',
          location: message.sender.location || '',
          trustScore: message.sender.trust_score || 0,
          helpOffered: message.sender.help_offered || 0,
          helpReceived: message.sender.help_received || 0,
          volunteerHours: message.sender.volunteer_hours || 0,
          createdAt: message.sender.created_at ? new Date(message.sender.created_at) : new Date(),
          verifiedStatus: message.sender.verified_status || false,
          emailVerified: true,
          trustBadges: message.sender.trust_badges || [],
          loginAttempts: 0,
          lastLoginAttempt: null
        } : undefined,
        receiver: message.receiver ? {
          id: message.receiver.id,
          username: message.receiver.username || '',
          email: message.receiver.email || '',
          name: message.receiver.name || '',
          avatar: message.receiver.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.receiver.name || '')}`,
          bio: message.receiver.bio || '',
          location: message.receiver.location || '',
          trustScore: message.receiver.trust_score || 0,
          helpOffered: message.receiver.help_offered || 0,
          helpReceived: message.receiver.help_received || 0,
          volunteerHours: message.receiver.volunteer_hours || 0,
          createdAt: message.receiver.created_at ? new Date(message.receiver.created_at) : new Date(),
          verifiedStatus: message.receiver.verified_status || false,
          emailVerified: true,
          trustBadges: message.receiver.trust_badges || [],
          loginAttempts: 0,
          lastLoginAttempt: null
        } : undefined
      }));
      
      console.log("useMessagesList: Processed messages:", processedMessages.length);
      setMessages(processedMessages);
      return processedMessages;
    } catch (error: any) {
      console.error("useMessagesList: Error fetching messages:", error);
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
    console.log(`useMessagesList: Adding new message to state: ${newMessage.id}`);
    
    // Use functional update to prevent race conditions
    setMessages(prev => {
      // Check if message already exists to avoid duplicates
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) {
        console.log("useMessagesList: Message already exists in state, skipping");
        return prev;
      }
      
      // Sort messages by created_at date
      const updatedMessages = [...prev, newMessage].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      console.log(`useMessagesList: Updated message list now contains ${updatedMessages.length} messages`);
      return updatedMessages;
    });
  }, []);

  // Reset messages when component unmounts to avoid state bleed between conversations
  useEffect(() => {
    return () => {
      console.log("useMessagesList: Resetting messages list on unmount");
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
