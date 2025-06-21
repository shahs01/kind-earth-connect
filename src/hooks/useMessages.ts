import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useConversationStates } from "./useConversationStates";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read?: boolean;
  sender?: {
    id: string;
    username?: string;
    email?: string;
    name?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    trustScore?: number;
    helpOffered?: number;
    helpReceived?: number;
    volunteerHours?: number;
    createdAt: Date;
    verifiedStatus: boolean;
    emailVerified: boolean;
    trustBadges: string[];
    loginAttempts: number;
    lastLoginAttempt: Date | null;
  };
}

export interface Conversation {
  user: {
    id: string;
    username?: string;
    name?: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
  };
  unreadCount?: number;
  isArchived?: boolean;
}

export function useMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getConversationState } = useConversationStates();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<Conversation[]>([]);
  const [connectionError, setConnectionError] = useState(false);
  const channelRef = useRef<any>(null);

  // Fetch conversations for the current user
  const fetchConversations = useCallback(async (showArchived: boolean = false) => {
    if (!user?.id) return;
    
    setLoading(true);
    setConnectionError(false);
    
    try {
      console.log("Fetching conversations...");
      
      // Get all messages for this user
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
        
      if (messagesError) {
        throw messagesError;
      }
      
      console.log(`Fetched ${messagesData?.length || 0} messages`);
      
      if (!messagesData || messagesData.length === 0) {
        setConversations([]);
        setArchivedConversations([]);
        return;
      }
      
      // Group messages by conversation (other user)
      const conversationMap = new Map<string, {
        lastMessage: Message;
        unreadCount: number;
      }>();
      
      messagesData.forEach(message => {
        const otherUserId = message.sender_id === user.id 
          ? message.receiver_id 
          : message.sender_id;
          
        const existing = conversationMap.get(otherUserId);
        
        if (!existing || new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
          conversationMap.set(otherUserId, {
            lastMessage: message as Message,
            unreadCount: existing ? existing.unreadCount : 0
          });
        }
        
        // Count unread messages where user is receiver
        if (message.receiver_id === user.id && !message.read) {
          const current = conversationMap.get(otherUserId);
          if (current) {
            current.unreadCount += 1;
          }
        }
      });
      
      // Fetch user profiles and conversation states for all conversation partners
      const userIds = Array.from(conversationMap.keys());
      
      if (userIds.length === 0) {
        setConversations([]);
        setArchivedConversations([]);
        return;
      }
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }
      
      // Create conversation objects with state filtering
      const activeConversationsData: Conversation[] = [];
      const archivedConversationsData: Conversation[] = [];
      
      for (const [userId, data] of conversationMap.entries()) {
        const profile = (profilesData || []).find(p => p.id === userId);
        
        if (profile) {
          // Check conversation state
          const conversationState = await getConversationState(userId);
          
          // Skip deleted conversations
          if (conversationState?.is_deleted) {
            continue;
          }
          
          const conversation: Conversation = {
            user: {
              id: profile.id,
              name: profile.name || '',
              username: profile.username || '',
              avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || '')}`
            },
            lastMessage: data.lastMessage,
            unreadCount: data.unreadCount,
            isArchived: conversationState?.is_archived || false
          };
          
          // Separate archived and active conversations
          if (conversationState?.is_archived) {
            archivedConversationsData.push(conversation);
          } else {
            activeConversationsData.push(conversation);
          }
        }
      }
      
      // Sort by most recent message
      const sortConversations = (convs: Conversation[]) => 
        convs.sort((a, b) => {
          const aTime = a.lastMessage?.created_at ? new Date(a.lastMessage.created_at).getTime() : 0;
          const bTime = b.lastMessage?.created_at ? new Date(b.lastMessage.created_at).getTime() : 0;
          return bTime - aTime;
        });
      
      sortConversations(activeConversationsData);
      sortConversations(archivedConversationsData);
      
      console.log(`Created ${activeConversationsData.length} active and ${archivedConversationsData.length} archived conversations`);
      
      if (showArchived) {
        setArchivedConversations(archivedConversationsData);
      } else {
        setConversations(activeConversationsData);
        setArchivedConversations(archivedConversationsData);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConnectionError(true);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast, getConversationState]);

  // Add refreshConversations as a wrapper
  const refreshConversations = useCallback(() => {
    return fetchConversations();
  }, [fetchConversations]);

  // Load conversation messages for a specific user
  const loadConversation = useCallback(async (userId: string) => {
    if (!user?.id) return [];
    
    setLoading(true);
    setConnectionError(false);
    
    try {
      console.log(`Loading conversation with user ${userId}`);
      
      // Check if conversation is deleted for current user
      const conversationState = await getConversationState(userId);
      if (conversationState?.is_deleted) {
        console.log("Conversation is deleted for current user");
        setMessages([]);
        return [];
      }
      
      // Fetch messages between current user and selected user
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${userId}),` +
          `and(sender_id.eq.${userId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      console.log(`Fetched ${data?.length || 0} messages for conversation`);
      
      // Fetch profiles for messages if needed
      const messagesWithProfiles = await addProfilesToMessages(data as Message[]);
      setMessages(messagesWithProfiles);
      
      // Mark unread messages as read
      const unreadMessages = data?.filter(msg => 
        msg.receiver_id === user.id && !msg.read
      ) || [];
      
      if (unreadMessages.length > 0) {
        console.log(`Marking ${unreadMessages.length} messages as read`);
        await markMessagesAsRead(unreadMessages.map(msg => msg.id));
      }
      
      return messagesWithProfiles;
    } catch (error) {
      console.error("Error loading conversation:", error);
      setConnectionError(true);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.id, getConversationState]);

  // Send a message
  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!user?.id || !content.trim()) {
      return;
    }

    setSending(true);
    try {
      console.log("Sending message to", receiverId);
      
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
      
      // Add message to local state with profile
      const messageWithProfile = {
        ...data,
        sender: {
          id: user.id,
          username: user.username || '',
          email: user.email || '',
          name: user.name || '',
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '')}`,
          bio: user.bio || '',
          location: user.location || '',
          trustScore: user.trustScore || 0,
          helpOffered: user.helpOffered || 0,
          helpReceived: user.helpReceived || 0,
          volunteerHours: user.volunteerHours || 0,
          createdAt: user.createdAt || new Date(),
          verifiedStatus: user.verifiedStatus || false,
          emailVerified: user.emailVerified || true,
          trustBadges: user.trustBadges || [],
          loginAttempts: user.loginAttempts || 0,
          lastLoginAttempt: user.lastLoginAttempt || null
        }
      };
      
      setMessages(prev => [...prev, messageWithProfile]);
      
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    } finally {
      setSending(false);
    }
  }, [user]);

  // Clear local messages
  const clearLocalMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Add profiles to messages
  const addProfilesToMessages = useCallback(async (messages: Message[]): Promise<Message[]> => {
    if (!messages || messages.length === 0) return [];
    
    try {
      const userIds = Array.from(new Set([
        ...messages.map(msg => msg.sender_id),
        ...messages.map(msg => msg.receiver_id)
      ]));
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
        
      const profileMap = new Map();
      (profiles || []).forEach(profile => {
        profileMap.set(profile.id, {
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
      
      return messages.map(message => {
        const senderProfile = profileMap.get(message.sender_id);
        
        return {
          ...message,
          sender: senderProfile
        };
      });
    } catch (error) {
      console.error("Error adding profiles to messages:", error);
      return messages;
    }
  }, []);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    if (!messageIds || messageIds.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds);
        
      if (error) {
        console.error("Error marking messages as read:", error);
      }
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  }, []);

  return {
    loading,
    sending,
    messages,
    conversations,
    archivedConversations,
    connectionError,
    setConnectionError,
    fetchConversations,
    refreshConversations,
    loadConversation,
    sendMessage,
    clearLocalMessages
  };
}
