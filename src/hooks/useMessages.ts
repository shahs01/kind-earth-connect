
import { useState, useEffect, useCallback } from "react";
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
  
  // Set up event listener for user reporting
  useEffect(() => {
    const handleReportUser = (event: any) => {
      const { userId } = event.detail;
      
      if (userId) {
        toast({
          title: "Report submitted",
          description: "We've received your report. Our team will review it shortly.",
        });
      }
    };
    
    window.addEventListener('report-user', handleReportUser as EventListener);
    
    return () => {
      window.removeEventListener('report-user', handleReportUser as EventListener);
    };
  }, [toast]);
  
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching conversations");
      // First, get the authenticated user's ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Authentication error:", authError);
        throw new Error(authError.message);
      }
      
      if (!user) {
        console.error("Not authenticated");
        throw new Error("Not authenticated");
      }
      
      // Get the latest message with each user the current user has conversed with
      const { data, error } = await supabase.rpc('get_conversations');
      
      if (error) {
        console.error("Error fetching conversations:", error);
        throw error;
      }
      
      console.log("Raw conversations data:", data);
      
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
      
      console.log("Formatted conversations:", formattedConversations);
      setConversations(formattedConversations);
      return formattedConversations;
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
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
  
  const fetchMessages = useCallback(async (userId: string) => {
    if (!userId) {
      console.error("No userId provided to fetchMessages");
      return [];
    }
    
    setLoading(true);
    try {
      console.log("Fetching messages with userId:", userId);
      // Get the authenticated user's ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Authentication error:", authError);
        throw new Error(authError.message);
      }
      
      if (!user) {
        console.error("Not authenticated");
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
      
      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }
      
      console.log("Messages fetched:", data?.length);
      setMessages(data || []);
      
      // Mark messages as read
      await markMessagesAsRead(userId);
      
      return data || [];
    } catch (error: any) {
      console.error("Error fetching messages:", error);
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
  
  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!receiverId || !content.trim()) {
      throw new Error("Recipient and message content are required");
    }
    
    try {
      console.log("Sending message to:", receiverId, "content:", content);
      // Get the authenticated user's ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Authentication error:", authError);
        throw new Error(authError.message);
      }
      
      if (!user) {
        console.error("Not authenticated");
        throw new Error("Not authenticated");
      }
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          receiver_id: receiverId,
          sender_id: user.id,
          content,
          read: false
        })
        .select();
      
      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }
      
      console.log("Message sent successfully:", data);
      
      // Add to messages state immediately without refetching
      if (data && data.length > 0) {
        setMessages(prev => [...prev, data[0]]);
      }
      
      return data?.[0];
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);
  
  const markMessagesAsRead = useCallback(async (senderId: string) => {
    if (!senderId) {
      console.error("No senderId provided to markMessagesAsRead");
      return;
    }
    
    try {
      console.log("Marking messages as read from sender:", senderId);
      // Get the authenticated user's ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Authentication error:", authError);
        return;
      }
      
      if (!user) {
        console.error("Not authenticated");
        return;
      }
      
      // Mark all messages from the sender as read
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id)
        .eq('read', false);
      
      if (error) {
        console.error("Error marking messages as read:", error);
        return;
      }
      
      console.log("Messages marked as read");
      
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
      await fetchConversations();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [fetchConversations]);
  
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
