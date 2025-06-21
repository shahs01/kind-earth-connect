
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useHelpInteractions() {
  const [loading, setLoading] = useState(false);

  const toggleHelpInteraction = async (helperId: string, conversationId?: string) => {
    setLoading(true);
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        throw new Error("Not authenticated");
      }

      // First check if interaction exists
      const { data: existing, error: checkError } = await supabase
        .from('help_interactions')
        .select('id')
        .eq('helper_id', helperId)
        .eq('helped_by_id', currentUser.id)
        .eq('conversation_id', conversationId || null)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existing) {
        // Remove existing interaction
        const { error: deleteError } = await supabase
          .from('help_interactions')
          .delete()
          .eq('id', existing.id);

        if (deleteError) {
          throw deleteError;
        }
        return false; // Now unselected
      } else {
        // Add new interaction
        const { error: insertError } = await supabase
          .from('help_interactions')
          .insert([{
            helper_id: helperId,
            helped_by_id: currentUser.id,
            conversation_id: conversationId || null
          }]);

        if (insertError) {
          throw insertError;
        }
        return true; // Now selected
      }
    } catch (error: any) {
      console.error("Error toggling help interaction:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkHelpInteraction = async (helperId: string, conversationId?: string) => {
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        return false;
      }

      const { data, error } = await supabase
        .from('help_interactions')
        .select('id')
        .eq('helper_id', helperId)
        .eq('helped_by_id', currentUser.id)
        .eq('conversation_id', conversationId || null)
        .maybeSingle();

      if (error) {
        console.error("Error checking help interaction:", error);
        return false;
      }

      return !!data;
    } catch (error: any) {
      console.error("Error checking help interaction:", error);
      return false;
    }
  };

  return {
    toggleHelpInteraction,
    checkHelpInteraction,
    loading
  };
}
