
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { User } from "@/types";

export interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
  conversationId: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export function useConversations() {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [connectionError, setConnectionError] = useState(false);
  const { toast } = useToast();
  
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching conversations");
      // First, get the authenticated user's ID
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
      
      // Get all messages involving the current user
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, created_at, content, read')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
        
      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        setConnectionError(true);
        throw messagesError;
      }
      
      console.log(`Found ${messagesData?.length || 0} messages`);
      setConnectionError(false);
      
      if (!messagesData || messagesData.length === 0) {
        setConversations([]);
        return [];
      }
      
      // Group messages by conversation partners
      const conversationMap = new Map<string, {
        userId: string;
        lastMessage: Message;
        unreadCount: number;
        conversationId: string;
      }>();
      
      for (const message of messagesData) {
        const otherUserId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        if (!otherUserId) continue;
        
        const key = otherUserId;
        const existing = conversationMap.get(key);
        
        if (!existing || new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
          const unreadCount = existing?.unreadCount || 0;
          const shouldIncrement = message.sender_id === otherUserId && !message.read;
          
          conversationMap.set(key, {
            userId: otherUserId,
            lastMessage: message as Message,
            unreadCount: shouldIncrement ? unreadCount + 1 : unreadCount,
            conversationId: `${user.id}-${otherUserId}`
          });
        } else if (existing && message.sender_id === otherUserId && !message.read) {
          existing.unreadCount += 1;
        }
      }
      
      // Fetch user profiles for all conversation partners
      const userIds = Array.from(conversationMap.keys());
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
        // Continue without profiles
      }
      
      // Create conversations array
      const formattedConversations: Conversation[] = [];
      
      for (const [userId, convData] of conversationMap.entries()) {
        const profile = profilesData?.find(p => p.id === userId);
        
        if (!profile) {
          console.warn("No profile found for user:", userId);
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
          conversationId: convData.conversationId
        });
      }
      
      // Sort by most recent message
      formattedConversations.sort((a, b) => 
        new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );
      
      console.log("Formatted conversations:", formattedConversations.length);
      setConversations(formattedConversations);
      return formattedConversations;
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      setConnectionError(true);
      toast({
        title: "Error fetching conversations",
        description: error.message || "Failed to load conversations",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Set up real-time subscription for new messages
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return null;

        console.log("Setting up global realtime subscription for new messages");
        
        const channel = supabase.channel('public:messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages'
            },
            (payload) => {
              console.log("Received new message notification:", payload);
              // Refresh conversations to update last message and unread count
              fetchConversations();
            }
          )
          .subscribe((status) => {
            console.log("Global messages subscription status:", status);
          });
        
        return channel;
      } catch (error) {
        console.error("Error setting up realtime subscription:", error);
        return null;
      }
    };
    
    const channel = setupRealtimeSubscription();
    
    return () => {
      if (channel) {
        channel.then(ch => {
          if (ch) supabase.removeChannel(ch);
        });
      }
    };
  }, [fetchConversations]);
  
  return {
    loading,
    conversations,
    fetchConversations,
    connectionError,
    setConnectionError
  };
}
