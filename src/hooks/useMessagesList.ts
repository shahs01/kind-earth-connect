
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
        console.error("Authentication error or not authenticated", authError);
        setConnectionError(true);
        throw authError || new Error("Not authenticated");
      }
      
      console.log(`Current user: ${user.id}, Other user: ${userId}`);
      
      // Get messages between current user and the selected user using a simpler, more reliable query
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching messages:", error);
        setConnectionError(true);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} messages for conversation with user: ${userId}`);
      
      setConnectionError(false);
      
      // Process messages to add sender and receiver profiles
      const processedMessages: Message[] = [];
      
      for (const message of data || []) {
        try {
          // Get sender profile
          const { data: senderData, error: senderError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', message.sender_id)
            .maybeSingle();
            
          if (senderError) {
            console.error(`Error fetching sender profile for message ${message.id}:`, senderError);
          }
          
          // Get receiver profile
          const { data: receiverData, error: receiverError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', message.receiver_id)
            .maybeSingle();
            
          if (receiverError) {
            console.error(`Error fetching receiver profile for message ${message.id}:`, receiverError);
          }
          
          // Create formatted message with proper null checking
          const formattedMessage: Message = {
            ...message,
            sender: senderData ? {
              id: senderData.id,
              username: senderData.username || '',
              email: senderData.email || '',
              name: senderData.name || '',
              avatar: senderData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderData.name || '')}`,
              bio: senderData.bio || '',
              location: senderData.location || '',
              trustScore: senderData.trust_score || 0,
              helpOffered: senderData.help_offered || 0,
              helpReceived: senderData.help_received || 0,
              volunteerHours: senderData.volunteer_hours || 0,
              createdAt: senderData.created_at ? new Date(senderData.created_at) : new Date(),
              verifiedStatus: senderData.verified_status || false,
              emailVerified: true,
              trustBadges: senderData.trust_badges || [],
              loginAttempts: 0,
              lastLoginAttempt: null
            } : undefined,
            receiver: receiverData ? {
              id: receiverData.id,
              username: receiverData.username || '',
              email: receiverData.email || '',
              name: receiverData.name || '',
              avatar: receiverData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(receiverData.name || '')}`,
              bio: receiverData.bio || '',
              location: receiverData.location || '',
              trustScore: receiverData.trust_score || 0,
              helpOffered: receiverData.help_offered || 0,
              helpReceived: receiverData.help_received || 0,
              volunteerHours: receiverData.volunteer_hours || 0,
              createdAt: receiverData.created_at ? new Date(receiverData.created_at) : new Date(),
              verifiedStatus: receiverData.verified_status || false,
              emailVerified: true,
              trustBadges: receiverData.trust_badges || [],
              loginAttempts: 0,
              lastLoginAttempt: null
            } : undefined
          };
          
          processedMessages.push(formattedMessage);
        } catch (err) {
          console.error("Error processing message:", err);
          // Add the message even without sender/receiver data
          processedMessages.push(message as Message);
        }
      }
      
      // Sort messages by timestamp to ensure correct order
      processedMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      console.log("Processed messages:", processedMessages.length);
      setMessages(processedMessages);
      return processedMessages;
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
