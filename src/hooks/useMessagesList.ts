
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
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching messages:", error);
        setConnectionError(true);
        throw error;
      }
      
      setConnectionError(false);
      
      if (Array.isArray(data)) {
        console.log(`Retrieved ${data.length} messages for conversation with user: ${userId}`);
        const messagesWithProfiles = data.map(msg => ({
          ...msg,
          sender: msg.sender ? {
            id: msg.sender.id,
            username: msg.sender.username || '',
            email: msg.sender.email || '',
            name: msg.sender.name || '',
            avatar: msg.sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender.name || '')}`,
            bio: msg.sender.bio || '',
            location: msg.sender.location || '',
            trustScore: msg.sender.trust_score || 0,
            helpOffered: msg.sender.help_offered || 0,
            helpReceived: msg.sender.help_received || 0,
            volunteerHours: msg.sender.volunteer_hours || 0,
            createdAt: new Date(msg.sender.created_at || Date.now()),
            verifiedStatus: msg.sender.verified_status || false,
            emailVerified: true,
            trustBadges: msg.sender.trust_badges || [],
            loginAttempts: 0,
            lastLoginAttempt: null
          } : undefined,
          receiver: msg.receiver ? {
            id: msg.receiver.id,
            username: msg.receiver.username || '',
            email: msg.receiver.email || '',
            name: msg.receiver.name || '',
            avatar: msg.receiver.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.receiver.name || '')}`,
            bio: msg.receiver.bio || '',
            location: msg.receiver.location || '',
            trustScore: msg.receiver.trust_score || 0,
            helpOffered: msg.receiver.help_offered || 0,
            helpReceived: msg.receiver.help_received || 0,
            volunteerHours: msg.receiver.volunteer_hours || 0,
            createdAt: new Date(msg.receiver.created_at || Date.now()),
            verifiedStatus: msg.receiver.verified_status || false,
            emailVerified: true,
            trustBadges: msg.receiver.trust_badges || [],
            loginAttempts: 0,
            lastLoginAttempt: null
          } : undefined
        }));
        
        setMessages(messagesWithProfiles);
        return messagesWithProfiles;
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
