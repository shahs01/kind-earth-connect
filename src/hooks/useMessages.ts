
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { User } from "@/types";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export function useMessages() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sending, setSending] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const { toast } = useToast();
  
  const channelRef = useRef<any>(null);

  // Fetch conversations for the current user
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setConnectionError(false);
    
    try {
      console.log("Fetching conversations...");
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Authentication error:", authError);
        setConnectionError(true);
        return [];
      }

      // Get all messages involving the current user
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        setConnectionError(true);
        throw messagesError;
      }

      console.log("Fetched messages:", messagesData?.length || 0);

      if (!messagesData || messagesData.length === 0) {
        setConversations([]);
        return [];
      }

      // Group messages by conversation partners
      const conversationMap = new Map<string, {
        userId: string;
        lastMessage: Message;
        unreadCount: number;
      }>();

      for (const message of messagesData) {
        const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        if (!otherUserId) continue;

        const existing = conversationMap.get(otherUserId);
        
        if (!existing || new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
          const unreadCount = existing?.unreadCount || 0;
          const shouldIncrement = message.sender_id === otherUserId && !message.read;
          
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            lastMessage: message as Message,
            unreadCount: shouldIncrement ? unreadCount + 1 : unreadCount,
          });
        } else if (existing && message.sender_id === otherUserId && !message.read) {
          existing.unreadCount += 1;
        }
      }

      // Fetch user profiles for all conversation partners
      const userIds = Array.from(conversationMap.keys());
      console.log("Fetching profiles for users:", userIds);

      if (userIds.length === 0) {
        setConversations([]);
        return [];
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Continue without profiles rather than failing completely
      }

      // Create conversations array
      const formattedConversations: Conversation[] = [];

      for (const [userId, convData] of conversationMap.entries()) {
        const profile = (profilesData || []).find(p => p.id === userId);
        
        if (!profile) {
          console.warn("No profile found for user:", userId);
          // Create a placeholder user object
          const placeholderUser: User = {
            id: userId,
            username: '',
            email: '',
            name: 'Unknown User',
            avatar: `https://ui-avatars.com/api/?name=Unknown`,
            bio: '',
            location: '',
            trustScore: 0,
            helpOffered: 0,
            helpReceived: 0,
            volunteerHours: 0,
            createdAt: new Date(),
            verifiedStatus: false,
            emailVerified: false,
            trustBadges: [],
            loginAttempts: 0,
            lastLoginAttempt: null
          };
          
          formattedConversations.push({
            user: placeholderUser,
            lastMessage: convData.lastMessage,
            unreadCount: convData.unreadCount,
          });
          continue;
        }

        const otherUser: User = {
          id: profile.id,
          username: profile.username || '',
          email: profile.email || '',
          name: profile.name || '',
          avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || '')}`,
          bio: profile.bio || '',
          location: profile.location || '',
          trustScore: profile.trust_score || 0,
          helpOffered: profile.help_offered || 0,
          helpReceived: profile.help_received || 0,
          volunteerHours: profile.volunteer_hours || 0,
          createdAt: new Date(profile.created_at || Date.now()),
          verifiedStatus: profile.verified_status || false,
          emailVerified: true,
          trustBadges: profile.trust_badges || [],
          loginAttempts: 0,
          lastLoginAttempt: null
        };

        formattedConversations.push({
          user: otherUser,
          lastMessage: convData.lastMessage,
          unreadCount: convData.unreadCount,
        });
      }

      // Sort by most recent message
      formattedConversations.sort((a, b) => 
        new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );

      console.log("Formatted conversations:", formattedConversations);
      setConversations(formattedConversations);
      return formattedConversations;

    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConnectionError(true);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load conversation messages for a specific user
  const loadConversation = useCallback(async (userId: string) => {
    setLoading(true);
    setConnectionError(false);
    
    try {
      console.log("Loading conversation with user:", userId);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Authentication error:", authError);
        setConnectionError(true);
        throw new Error("Not authenticated");
      }

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        setConnectionError(true);
        throw messagesError;
      }

      // Fetch profiles
      const userIds = [user.id, userId];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      // Create a map of profiles
      const profilesMap = new Map();
      (profilesData || []).forEach(profile => {
        profilesMap.set(profile.id, {
          id: profile.id,
          username: profile.username || '',
          email: profile.email || '',
          name: profile.name || '',
          avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || '')}`,
          bio: profile.bio || '',
          location: profile.location || '',
          trustScore: profile.trust_score || 0,
          helpOffered: profile.help_offered || 0,
          helpReceived: profile.help_received || 0,
          volunteerHours: profile.volunteer_hours || 0,
          createdAt: new Date(profile.created_at || Date.now()),
          verifiedStatus: profile.verified_status || false,
          emailVerified: true,
          trustBadges: profile.trust_badges || [],
          loginAttempts: 0,
          lastLoginAttempt: null
        });
      });

      // Process messages with profile data
      const processedMessages = (messagesData || []).map(message => ({
        ...message,
        sender: profilesMap.get(message.sender_id),
        receiver: profilesMap.get(message.receiver_id)
      }));

      console.log("Loaded messages:", processedMessages.length);
      setMessages(processedMessages);

      // Mark messages as read
      const { error: readError } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', userId)
        .eq('receiver_id', user.id)
        .eq('read', false);

      if (readError) {
        console.error("Error marking messages as read:", readError);
      }

      return processedMessages;

    } catch (error) {
      console.error("Error loading conversation:", error);
      setConnectionError(true);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!content.trim()) return;

    setSending(true);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content: content.trim(),
          read: false
        })
        .select()
        .single();

      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }

      console.log("Message sent successfully:", data);
      
      // Refresh conversations to update the list
      fetchConversations();
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSending(false);
    }
  }, [toast, fetchConversations]);

  // Clear local messages
  const clearLocalMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    loading,
    messages,
    conversations,
    sending,
    connectionError,
    setConnectionError,
    fetchConversations,
    loadConversation,
    sendMessage,
    clearLocalMessages,
    setMessages
  };
}
