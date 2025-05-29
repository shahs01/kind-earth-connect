import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useConversationRealtime } from "@/components/messages/hooks/useConversationRealtime";
import { useLocalMessages } from "@/components/messages/hooks/useLocalMessages";

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
}

export function useMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sending, setSending] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [currentConversationUserId, setCurrentConversationUserId] = useState<string | null>(null);
  
  const {
    localMessages,
    setLocalMessages,
    handleMessageReceived,
    handleMessageDeleted,
    clearLocalMessages
  } = useLocalMessages();

  const { setupRealtimeSubscription } = useConversationRealtime({
    userId: currentConversationUserId,
    currentUserId: user?.id,
    onMessageReceived: handleMessageReceived,
    onMessageDeleted: handleMessageDeleted,
    setConnectionError
  });

  // Remove a specific message by ID
  const removeMessage = useCallback((messageId: string) => {
    setLocalMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, [setLocalMessages]);

  const loadConversations = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    try {
      // Fetch conversations
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          name,
          avatar
        `);

      if (error) {
        console.error("Error fetching conversations:", error);
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        const conversationsData: Conversation[] = data.map((profile) => ({
          user: {
            id: profile.id,
            username: profile.username || '',
            name: profile.name || '',
            avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || '')}`,
          },
          lastMessage: {
            content: "No messages yet",
            created_at: new Date().toISOString()
          },
          unreadCount: 0
        }));
        setConversations(conversationsData);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const loadConversation = useCallback(async (userId: string): Promise<Message[]> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    setLoading(true);
    setCurrentConversationUserId(userId);
    console.log("Loading conversation with user:", userId);

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(*)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error loading conversation:", error);
        throw error;
      }

      console.log(`Loaded ${data?.length || 0} messages`);
      const messages = data || [];
      setLocalMessages(messages as Message[]);
      
      // Set up realtime subscription for this conversation
      setupRealtimeSubscription();

      return messages as Message[];
    } catch (error) {
      console.error("Failed to load conversation:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, setLocalMessages, setupRealtimeSubscription]);

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!user || !content.trim()) {
      throw new Error("Cannot send message: user not authenticated or empty content");
    }

    setSending(true);
    console.log("Sending message to:", receiverId);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content: content.trim(),
          read: false
        })
        .select(`
          *,
          sender:profiles!sender_id(*)
        `)
        .single();

      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }

      console.log("Message sent successfully");
      return data;
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    } finally {
      setSending(false);
    }
  }, [user]);

  return {
    loading,
    messages: localMessages,
    conversations,
    sending,
    connectionError,
    loadConversation,
    sendMessage,
    clearLocalMessages,
    removeMessage,
    setConnectionError
  };
}
