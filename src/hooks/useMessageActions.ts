
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useMessageActions() {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Cannot send an empty message",
        variant: "destructive"
      });
      return null;
    }

    setSending(true);
    console.log(`Sending message to ${receiverId}: ${content.slice(0, 20)}${content.length > 20 ? '...' : ''}`);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error getting current user:", userError);
        toast({
          title: "Authentication Error",
          description: "Please log in to send messages",
          variant: "destructive"
        });
        throw userError || new Error("User not authenticated");
      }

      // Send the message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content: content.trim(),
          read: false
        })
        .select('*, sender:profiles!sender_id(*)')
        .single();

      if (messageError) {
        console.error("Error sending message:", messageError);
        toast({
          title: "Failed to send message",
          description: messageError.message || "Please try again later",
          variant: "destructive",
        });
        throw messageError;
      }

      console.log("Message sent successfully:", message);
      toast({
        title: "Message sent",
        description: "Your message has been delivered"
      });
      return message;
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Failed to send message",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setSending(false);
    }
  }, [toast]);

  const markMessagesAsRead = useCallback(async (userId: string) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error getting user:", userError);
        return;
      }

      // Mark all messages from the other user as read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', userId)
        .eq('receiver_id', user.id)
        .eq('read', false);

      if (updateError) {
        console.error("Error marking messages as read:", updateError);
        toast({
          title: "Error",
          description: "Failed to mark messages as read",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark messages as read",
        variant: "destructive"
      });
    }
  }, [toast]);

  const deleteConversation = useCallback(async (userId: string) => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error getting user:", userError);
        toast({
          title: "Authentication Error",
          description: "Please log in to delete conversations",
          variant: "destructive"
        });
        throw userError || new Error("User not authenticated");
      }

      // Delete all messages between the two users
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`);

      if (deleteError) {
        console.error("Error deleting messages:", deleteError);
        toast({
          title: "Failed to delete conversation",
          description: deleteError.message || "Please try again later",
          variant: "destructive",
        });
        throw deleteError;
      }

      console.log("Conversation deleted successfully");
      toast({
        title: "Success",
        description: "Conversation deleted successfully"
      });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Failed to delete conversation",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  return { sending, sendMessage, markMessagesAsRead, deleteConversation };
}
