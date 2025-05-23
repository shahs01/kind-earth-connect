
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { Message } from "./useConversations";

export function useMessageActions() {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!receiverId || !content.trim()) {
      console.error("Missing receiverId or content");
      throw new Error("Recipient and message content are required");
    }
    
    setSending(true);
    try {
      console.log("Sending message to:", receiverId, "content:", content.substring(0, 20) + (content.length > 20 ? '...' : ''));
      
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
      
      console.log("Current user ID:", user.id);
      
      // Structure the message data
      const messageData = {
        receiver_id: receiverId,
        sender_id: user.id,
        content,
        read: false
      };
      
      console.log("Inserting message with data:", {
        receiver_id: messageData.receiver_id,
        sender_id: messageData.sender_id,
        content_length: messageData.content.length,
        read: messageData.read
      });
      
      // Insert the message
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select();
      
      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }
      
      console.log("Message sent successfully, data returned:", data?.length > 0);
      return data?.[0] as Message;
    } catch (error: any) {
      console.error("Error sending message:", error);
      throw error;
    } finally {
      // Add a small delay to avoid UI jitter
      setTimeout(() => {
        setSending(false);
      }, 300);
    }
  }, []);
  
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
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, []);

  return {
    sending,
    sendMessage,
    markMessagesAsRead
  };
}
