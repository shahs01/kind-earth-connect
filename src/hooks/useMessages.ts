
import { useState } from "react";
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
  const { toast } = useToast();
  
  const fetchConversations = async () => {
    setLoading(true);
    try {
      // First, get the authenticated user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }
      
      // Get the latest message with each user the current user has conversed with
      const { data, error } = await supabase.rpc('get_conversations');
      
      if (error) throw error;
      
      // Format conversations and fetch user details
      const formattedConversations: Conversation[] = [];
      
      // Process each conversation with other user details
      for (const convo of data || []) {
        // Get other user profile (the one they're talking to)
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', convo.other_user_id)
          .single();
        
        if (userError) {
          console.error("Error fetching user:", userError);
          continue;
        }
        
        // Count unread messages
        const { count, error: countError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', convo.other_user_id)
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
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .or(`sender_id.eq.${convo.other_user_id},receiver_id.eq.${convo.other_user_id}`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (msgError) {
          console.error("Error fetching last message:", msgError);
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
      }
      
      // Sort by most recent message
      formattedConversations.sort((a, b) => 
        new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
      );
      
      setConversations(formattedConversations);
      return formattedConversations;
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error fetching conversations",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMessages = async (userId: string) => {
    setLoading(true);
    try {
      // Get the authenticated user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }
      
      // Get messages between current user and the selected user
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          content,
          read,
          created_at
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setMessages(data || []);
      
      // Mark messages as read
      await markMessagesAsRead(userId);
      
      return data;
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error fetching messages",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const sendMessage = async (receiverId: string, content: string) => {
    setLoading(true);
    try {
      // Get the authenticated user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          receiver_id: receiverId,
          sender_id: user.id,
          content
        })
        .select();
      
      if (error) throw error;
      
      // Add to messages state immediately without refetching
      if (data && data.length > 0) {
        setMessages(prev => [...prev, data[0]]);
      }
      
      return data?.[0];
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const markMessagesAsRead = async (senderId: string) => {
    try {
      // Get the authenticated user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }
      
      // Mark all messages from the sender as read
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      
      // Update the messages state to reflect the changes
      setMessages(prev => prev.map(msg => 
        msg.sender_id === senderId && msg.receiver_id === user.id
          ? { ...msg, read: true }
          : msg
      ));
      
      // Also update the conversations list if it exists
      setConversations(prev => prev.map(convo => 
        convo.user.id === senderId 
          ? { ...convo, unreadCount: 0 } 
          : convo
      ));
      
      // Refresh conversations to update the unread count
      fetchConversations();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };
  
  return {
    loading,
    messages,
    conversations,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessagesAsRead
  };
}
