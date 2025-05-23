
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { User } from "@/types";

export interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

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
      
      // Get all users the current user has sent messages to or received messages from
      const { data: sentToUsers, error: sentError } = await supabase
        .from('messages')
        .select('receiver_id')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });
        
      const { data: receivedFromUsers, error: receivedError } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });
        
      if (sentError || receivedError) {
        console.error("Error fetching conversation users:", sentError || receivedError);
        setConnectionError(true);
        throw sentError || receivedError;
      }
      
      // Extract unique user IDs
      const userIdSet = new Set<string>();
      
      sentToUsers?.forEach(msg => userIdSet.add(msg.receiver_id));
      receivedFromUsers?.forEach(msg => userIdSet.add(msg.sender_id));
      
      const uniqueUserIds = Array.from(userIdSet);
      
      console.log("Found conversations with users:", uniqueUserIds);
      setConnectionError(false);
      
      // Format conversations and fetch user details
      const formattedConversations: Conversation[] = [];
      
      // Process each conversation with other user details
      for (const otherUserId of uniqueUserIds) {
        try {
          // Get other user profile
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherUserId)
            .maybeSingle();
          
          if (userError) {
            console.error("Error fetching user:", userError);
            continue;
          }
          
          if (!userData) {
            console.error("No user found with ID:", otherUserId);
            continue;
          }
          
          // Count unread messages
          const { count, error: countError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', otherUserId)
            .eq('receiver_id', user.id)
            .eq('read', false);
          
          if (countError) {
            console.error("Error counting unread messages:", countError);
            continue;
          }
          
          // Get the last message
          const { data: lastMessageData, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (msgError) {
            console.error("Error fetching last message:", msgError);
            continue;
          }
          
          if (!lastMessageData) {
            console.error("No last message found for conversation with", otherUserId);
            continue;
          }
          
          // Create user object from profile
          const otherUser: User = {
            id: userData.id,
            username: userData.username || '',
            email: userData.email || '',
            name: userData.name || '',
            avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || '')}`,
            bio: userData.bio || '',
            location: userData.location || '',
            trustScore: userData.trust_score || 0,
            helpOffered: userData.help_offered || 0,
            helpReceived: userData.help_received || 0,
            volunteerHours: userData.volunteer_hours || 0,
            createdAt: new Date(userData.created_at || Date.now()),
            verifiedStatus: userData.verified_status || false,
            emailVerified: true,
            trustBadges: userData.trust_badges || [],
            loginAttempts: 0,
            lastLoginAttempt: null
          };
          
          formattedConversations.push({
            user: otherUser,
            lastMessage: lastMessageData as Message,
            unreadCount: count || 0
          });
        } catch (err) {
          console.error("Error processing conversation:", err);
          continue;
        }
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
              table: 'messages',
              filter: `receiver_id=eq.${user.id}`
            },
            (payload) => {
              console.log("Received new message notification:", payload);
              // Refresh conversations to update last message and unread count
              fetchConversations();
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `sender_id=eq.${user.id}`
            },
            (payload) => {
              console.log("New message sent notification:", payload);
              // Refresh conversations to update last message
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
