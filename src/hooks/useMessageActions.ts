
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useMessageActions() {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const findOrCreateConversation = useCallback(async (userId: string, currentUserId: string) => {
    try {
      // First, check if a conversation already exists
      const { data: existingConversation, error: findError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${currentUserId},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${currentUserId})`)
        .maybeSingle();

      if (findError) {
        console.error("Error finding conversation:", findError);
        throw findError;
      }

      if (existingConversation) {
        console.log("Found existing conversation:", existingConversation.id);
        return existingConversation.id;
      }

      // Create a new conversation if none exists
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          user1_id: currentUserId,
          user2_id: userId
        })
        .select('id')
        .single();

      if (createError) {
        console.error("Error creating new conversation:", createError);
        throw createError;
      }

      console.log("Created new conversation:", newConversation.id);
      return newConversation.id;
    } catch (error) {
      console.error("Error in findOrCreateConversation:", error);
      throw error;
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

      // Find the conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${user.id})`)
        .maybeSingle();

      if (convError || !conversation) {
        console.error("Error finding conversation:", convError);
        return;
      }

      // Mark all messages from the other user as read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversation.id)
        .eq('sender_id', userId)
        .eq('read', false);

      if (updateError) {
        console.error("Error marking messages as read:", updateError);
      }
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  }, []);

  return { sending, sendMessage, markMessagesAsRead };
}
