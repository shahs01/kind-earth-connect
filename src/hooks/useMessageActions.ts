
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { Message } from "./useConversations";

export function useMessageActions() {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!receiverId || !content.trim()) {
      console.error("Missing receiverId or content", { receiverId, contentLength: content?.length || 0 });
      throw new Error("Recipient and message content are required");
    }
    
    // Set sending state immediately
    setSending(true);
    console.log(`Sending message to user ${receiverId}: ${content.substring(0, 20)}${content.length > 20 ? '...' : ''}`);
    
    try {
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
      
      // Structure the message data
      const messageData = {
        receiver_id: receiverId,
        sender_id: user.id,
        content,
        read: false
      };
      
      console.log("Message data structured:", { 
        receiver_id: receiverId, 
        sender_id: user.id, 
        contentLength: content.length,
        timestamp: new Date().toISOString()
      });
      
      // Insert the message
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select(`
          *,
          sender:profiles!sender_id(*),
          receiver:profiles!receiver_id(*)
        `);
      
      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.error("No data returned from message insert");
        throw new Error("Failed to send message - no data returned");
      }
      
      console.log("Message sent successfully:", data[0]?.id);
      
      // Format the returned message
      const message = data[0];
      const formattedMessage: Message = {
        ...message,
        sender: message.sender ? {
          id: message.sender.id,
          username: message.sender.username || '',
          email: message.sender.email || '',
          name: message.sender.name || '',
          avatar: message.sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender.name || '')}`,
          bio: message.sender.bio || '',
          location: message.sender.location || '',
          trustScore: message.sender.trust_score || 0,
          helpOffered: message.sender.help_offered || 0,
          helpReceived: message.sender.help_received || 0,
          volunteerHours: message.sender.volunteer_hours || 0,
          createdAt: new Date(message.sender.created_at || Date.now()),
          verifiedStatus: message.sender.verified_status || false,
          emailVerified: true,
          trustBadges: message.sender.trust_badges || [],
          loginAttempts: 0,
          lastLoginAttempt: null
        } : undefined,
        receiver: message.receiver ? {
          id: message.receiver.id,
          username: message.receiver.username || '',
          email: message.receiver.email || '',
          name: message.receiver.name || '',
          avatar: message.receiver.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.receiver.name || '')}`,
          bio: message.receiver.bio || '',
          location: message.receiver.location || '',
          trustScore: message.receiver.trust_score || 0,
          helpOffered: message.receiver.help_offered || 0,
          helpReceived: message.receiver.help_received || 0,
          volunteerHours: message.receiver.volunteer_hours || 0,
          createdAt: new Date(message.receiver.created_at || Date.now()),
          verifiedStatus: message.receiver.verified_status || false,
          emailVerified: true,
          trustBadges: message.receiver.trust_badges || [],
          loginAttempts: 0,
          lastLoginAttempt: null
        } : undefined
      };
      
      return formattedMessage;
    } catch (error: any) {
      console.error("Error sending message:", error);
      throw error;
    } finally {
      // Add a small delay to avoid UI jitter
      setTimeout(() => {
        setSending(false);
      }, 500);
    }
  }, []);
  
  const markMessagesAsRead = useCallback(async (senderId: string) => {
    if (!senderId) {
      console.error("No senderId provided to markMessagesAsRead");
      return;
    }
    
    console.log(`Marking messages from user ${senderId} as read`);
    
    try {
      // Get the authenticated user's ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Authentication error or not authenticated");
        return;
      }
      
      // Mark all messages from the sender as read
      const { data, error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id)
        .eq('read', false)
        .select();
      
      if (error) {
        console.error("Error marking messages as read:", error);
      } else {
        console.log(`Marked ${data?.length || 0} messages as read`);
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, []);
  
  // Add function to delete conversation
  const deleteConversation = useCallback(async (otherUserId: string) => {
    if (!otherUserId) {
      console.error("No otherUserId provided to deleteConversation");
      throw new Error("User ID is required to delete conversation");
    }
    
    console.log(`Deleting conversation with user ${otherUserId}`);
    
    try {
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
      
      // Delete all messages between the current user and the other user
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`);
      
      if (deleteError) {
        console.error("Error deleting conversation:", deleteError);
        throw deleteError;
      }
      
      console.log(`Successfully deleted conversation with user ${otherUserId}`);
      return true;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  }, []);

  // Archive conversation (in production, this would update a status field in the database)
  const archiveConversation = useCallback(async (otherUserId: string) => {
    // This is a mock function for now - in a real implementation, we would add an 'archived' field
    // to the messages table and update it here.
    console.log(`Archiving conversation with user ${otherUserId}`);
    return true;
  }, []);

  return {
    sending,
    sendMessage,
    markMessagesAsRead,
    deleteConversation,
    archiveConversation
  };
}
