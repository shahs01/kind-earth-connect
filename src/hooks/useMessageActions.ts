
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useMessageActions() {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const findOrCreateConversation = useCallback(async (userId: string, currentUserId: string) => {
    try {
      // First, check if a conversation already exists using raw query to avoid type issues
      const { data: existingConversation, error: findError } = await supabase
        .rpc('get_conversations')
        .eq('other_user_id', userId)
        .maybeSingle();

      if (findError) {
        console.error("Error finding conversation:", findError);
      }

      if (existingConversation) {
        // Find the actual conversation record
        const { data: convData, error: convError } = await supabase
          .from('messages')
          .select('conversation_id')
          .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`)
          .limit(1)
          .maybeSingle();

        if (convData?.conversation_id) {
          console.log("Found existing conversation:", convData.conversation_id);
          return convData.conversation_id;
        }
      }

      // Create a new conversation using a direct SQL approach
      const { data: newConversation, error: createError } = await supabase
        .rpc('exec_sql', {
          query: `
            INSERT INTO conversations (user1_id, user2_id) 
            VALUES ('${currentUserId}', '${userId}') 
            ON CONFLICT (user1_id, user2_id) DO NOTHING 
            RETURNING id;
          `
        });

      if (createError) {
        console.error("Error creating new conversation:", createError);
        // Fallback: try to find if conversation was created by another process
        const { data: fallbackConv } = await supabase
          .from('messages')
          .select('conversation_id')
          .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`)
          .limit(1)
          .maybeSingle();
        
        if (fallbackConv?.conversation_id) {
          return fallbackConv.conversation_id;
        }
        throw createError;
      }

      const conversationId = newConversation?.[0]?.id || `${currentUserId}-${userId}`;
      console.log("Created new conversation:", conversationId);
      return conversationId;
    } catch (error) {
      console.error("Error in findOrCreateConversation:", error);
      // Return a deterministic ID as fallback
      return `${currentUserId}-${userId}`;
    }
  }, []);

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!content.trim()) {
      return null;
    }

    setSending(true);
    console.log(`Sending message to ${receiverId}: ${content.slice(0, 20)}${content.length > 20 ? '...' : ''}`);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error getting current user:", userError);
        throw userError || new Error("User not authenticated");
      }

      // Find or create a conversation
      const conversationId = await findOrCreateConversation(receiverId, user.id);

      // Send the message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: receiverId, // Keep for backward compatibility
          content: content.trim(),
          read: false
        })
        .select('*, sender:profiles!sender_id(*)')
        .single();

      if (messageError) {
        console.error("Error sending message:", messageError);
        throw messageError;
      }

      console.log("Message sent successfully:", message);
      return message;
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again later",
        variant: "destructive",
      });
      return null;
    } finally {
      setSending(false);
    }
  }, [toast, findOrCreateConversation]);

  const markMessagesAsRead = useCallback(async (userId: string) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error getting user:", userError);
        return;
      }

      // Find the conversation using messages table
      const { data: conversationData, error: convError } = await supabase
        .from('messages')
        .select('conversation_id')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .limit(1)
        .maybeSingle();

      if (convError || !conversationData?.conversation_id) {
        console.error("Error finding conversation:", convError);
        return;
      }

      // Mark all messages from the other user as read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationData.conversation_id)
        .eq('sender_id', userId)
        .eq('read', false);

      if (updateError) {
        console.error("Error marking messages as read:", updateError);
      }
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  }, []);

  const deleteConversation = useCallback(async (userId: string) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error getting user:", userError);
        throw userError || new Error("User not authenticated");
      }

      // Find messages to get conversation_id
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('conversation_id')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .limit(1)
        .maybeSingle();

      if (messagesError) {
        console.error("Error finding messages:", messagesError);
        throw messagesError;
      }

      if (messagesData?.conversation_id) {
        // Delete all messages in the conversation
        const { error: deleteMessagesError } = await supabase
          .from('messages')
          .delete()
          .eq('conversation_id', messagesData.conversation_id);

        if (deleteMessagesError) {
          console.error("Error deleting messages:", deleteMessagesError);
          throw deleteMessagesError;
        }

        console.log("Conversation deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      throw error;
    }
  }, []);

  return { sending, sendMessage, markMessagesAsRead, deleteConversation };
}
