
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
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (messagesError) {
        console.error("useMessagesList: Error fetching messages:", messagesError);
        setConnectionError(true);
        throw messagesError;
      }
      
      console.log(`useMessagesList: Retrieved ${messagesData?.length || 0} messages for conversation with user: ${userId}`);
      
      // Get unique user IDs from messages
      const userIds = Array.from(new Set([
        ...(messagesData || []).map(msg => msg.sender_id),
        ...(messagesData || []).map(msg => msg.receiver_id)
      ]));
      
      // Fetch user profiles for all users involved in the conversation
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) {
        console.error("useMessagesList: Error fetching profiles:", profilesError);
        // Don't throw here, continue with messages without full profile data
      }
      
      // Create a map of profiles for quick lookup
      const profilesMap = new Map();
      (profilesData || []).forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
      
      setConnectionError(false);
      
      // Process messages with profile data
      const processedMessages: Message[] = (messagesData || []).map(message => {
        const senderProfile = profilesMap.get(message.sender_id);
        const receiverProfile = profilesMap.get(message.receiver_id);
        
        return {
          ...message,
          sender: senderProfile ? {
            id: senderProfile.id,
            username: senderProfile.username || '',
            email: senderProfile.email || '',
            name: senderProfile.name || '',
            avatar: senderProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderProfile.name || '')}`,
            bio: senderProfile.bio || '',
            location: senderProfile.location || '',
            trustScore: senderProfile.trust_score || 0,
            helpOffered: senderProfile.help_offered || 0,
            helpReceived: senderProfile.help_received || 0,
            volunteerHours: senderProfile.volunteer_hours || 0,
            createdAt: senderProfile.created_at ? new Date(senderProfile.created_at) : new Date(),
            verifiedStatus: senderProfile.verified_status || false,
            emailVerified: true,
            trustBadges: senderProfile.trust_badges || [],
            loginAttempts: 0,
            lastLoginAttempt: null
          } : undefined,
          receiver: receiverProfile ? {
            id: receiverProfile.id,
            username: receiverProfile.username || '',
            email: receiverProfile.email || '',
            name: receiverProfile.name || '',
            avatar: receiverProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(receiverProfile.name || '')}`,
            bio: receiverProfile.bio || '',
            location: receiverProfile.location || '',
            trustScore: receiverProfile.trust_score || 0,
            helpOffered: receiverProfile.help_offered || 0,
            helpReceived: receiverProfile.help_received || 0,
            volunteerHours: receiverProfile.volunteer_hours || 0,
            createdAt: receiverProfile.created_at ? new Date(receiverProfile.created_at) : new Date(),
            verifiedStatus: receiverProfile.verified_status || false,
            emailVerified: true,
            trustBadges: receiverProfile.trust_badges || [],
            loginAttempts: 0,
            lastLoginAttempt: null
          } : undefined
        };
      });
      
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
