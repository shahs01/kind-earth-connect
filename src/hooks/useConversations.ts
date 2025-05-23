
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

interface DatabaseMessage {
  sender_id: string;
  receiver_id: string;
  created_at: string;
  content: string;
  read: boolean;
}

interface DatabaseProfile {
  id: string;
  username?: string;
  email?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  trust_score?: number;
  help_offered?: number;
  help_received?: number;
  volunteer_hours?: number;
  created_at?: string;
  verified_status?: boolean;
  trust_badges?: string[];
}

export function useConversations() {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [connectionError, setConnectionError] = useState(false);
  const { toast } = useToast();
  
  const fetchConversations = useCallback(async (): Promise<Conversation[]> => {
    setLoading(true);
    try {
      console.log("Fetching conversations");
      // First, get the authenticated user's ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Authentication error:", authError);
        setConnectionError(true);
        toast({
          title: "Authentication Error",
          description: authError.message,
          variant: "destructive",
        });
        throw new Error(authError.message);
      }
      
      if (!user) {
        console.error("Not authenticated");
        setConnectionError(true);
        toast({
          title: "Authentication Required",
          description: "Please log in to view conversations",
          variant: "destructive",
        });
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
        toast({
          title: "Error fetching messages",
          description: messagesError.message,
          variant: "destructive",
        });
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
      
      for (const message of messagesData as DatabaseMessage[]) {
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
        toast({
          title: "Warning",
          description: "Some profile information could not be loaded",
          variant: "destructive",
        });
        // Continue without profiles
      }
      
      // Create conversations array
      const formattedConversations: Conversation[] = [];
      
      for (const [userId, convData] of conversationMap.entries()) {
        const profile = (profilesData as DatabaseProfile[] || []).find(p => p.id === userId);
        
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
    } catch (error: unknown) {
      console.error("Error fetching conversations:", error);
      setConnectionError(true);
      const errorMessage = error instanceof Error ? error.message : "Failed to load conversations";
      toast({
        title: "Error fetching conversations",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Set up real-time subscription for new messages with proper cleanup
  useEffect(() => {
    let channel: any = null;
    
    const setupRealtimeSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return null;

        console.log("Setting up global realtime subscription for new messages");
        
        channel = supabase.channel('public:messages')
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
          .subscribe((status: string) => {
            console.log("Global messages subscription status:", status);
          });
        
        return channel;
      } catch (error) {
        console.error("Error setting up realtime subscription:", error);
        return null;
      }
    };
    
    setupRealtimeSubscription();
    
    return () => {
      if (channel) {
        console.log("Cleaning up conversations realtime subscription");
        channel.unsubscribe();
        supabase.removeChannel(channel);
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
