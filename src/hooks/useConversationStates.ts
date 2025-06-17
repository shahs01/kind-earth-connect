
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ConversationState {
  id: string;
  user_id: string;
  other_user_id: string;
  is_deleted: boolean;
  is_archived: boolean;
  last_message_read_at?: string;
  created_at: string;
  updated_at: string;
}

export function useConversationStates() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getConversationState = useCallback(async (otherUserId: string): Promise<ConversationState | null> => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return null;

      const { data, error } = await supabase
        .from('user_conversation_states')
        .select('*')
        .eq('user_id', currentUser.user.id)
        .eq('other_user_id', otherUserId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching conversation state:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getConversationState:", error);
      return null;
    }
  }, []);

  const updateConversationState = useCallback(async (
    otherUserId: string, 
    updates: Partial<Pick<ConversationState, 'is_deleted' | 'is_archived' | 'last_message_read_at'>>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return false;

      // First, try to get existing state
      const existingState = await getConversationState(otherUserId);

      if (existingState) {
        // Update existing state
        const { error } = await supabase
          .from('user_conversation_states')
          .update(updates)
          .eq('id', existingState.id);

        if (error) {
          console.error("Error updating conversation state:", error);
          return false;
        }
      } else {
        // Create new state
        const { error } = await supabase
          .from('user_conversation_states')
          .insert({
            user_id: currentUser.user.id,
            other_user_id: otherUserId,
            ...updates
          });

        if (error) {
          console.error("Error creating conversation state:", error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error in updateConversationState:", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getConversationState]);

  const deleteConversation = useCallback(async (otherUserId: string): Promise<boolean> => {
    const success = await updateConversationState(otherUserId, { is_deleted: true });
    if (success) {
      toast({
        title: "Conversation deleted",
        description: "The conversation has been deleted from your view.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive"
      });
    }
    return success;
  }, [updateConversationState, toast]);

  const archiveConversation = useCallback(async (otherUserId: string): Promise<boolean> => {
    const success = await updateConversationState(otherUserId, { is_archived: true });
    if (success) {
      toast({
        title: "Conversation archived",
        description: "The conversation has been archived.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to archive conversation. Please try again.",
        variant: "destructive"
      });
    }
    return success;
  }, [updateConversationState, toast]);

  const unarchiveConversation = useCallback(async (otherUserId: string): Promise<boolean> => {
    const success = await updateConversationState(otherUserId, { is_archived: false });
    if (success) {
      toast({
        title: "Conversation unarchived",
        description: "The conversation has been moved back to your inbox.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to unarchive conversation. Please try again.",
        variant: "destructive"
      });
    }
    return success;
  }, [updateConversationState, toast]);

  return {
    loading,
    getConversationState,
    updateConversationState,
    deleteConversation,
    archiveConversation,
    unarchiveConversation
  };
}
