
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useHelpInteractions() {
  const [loading, setLoading] = useState(false);

  const markAsHelped = async (helperId: string, conversationId?: string) => {
    setLoading(true);
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from('help_interactions')
        .insert([{
          helper_id: helperId,
          helped_by_id: currentUser.id,
          conversation_id: conversationId || null
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return false;
        }
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error("Error recording help interaction:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeHelpInteraction = async (helperId: string, conversationId?: string) => {
    setLoading(true);
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        throw new Error("Not authenticated");
      }

      console.log("Attempting to remove interaction:", {
        helper_id: helperId,
        helped_by_id: currentUser.id,
        conversation_id: conversationId || null
      });

      const { error, count } = await supabase
        .from('help_interactions')
        .delete({ count: 'exact' })
        .eq('helper_id', helperId)
        .eq('helped_by_id', currentUser.id)
        .eq('conversation_id', conversationId || null);

      if (error) {
        console.error("Database error removing interaction:", error);
        throw error;
      }

      console.log("Removed interaction count:", count);
      
      // Only return true if we actually deleted a row
      return count !== null && count > 0;
    } catch (error: any) {
      console.error("Error removing help interaction:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getHelpInteractions = async (helperId: string) => {
    try {
      const { data, error } = await supabase
        .from('help_interactions')
        .select('*')
        .eq('helper_id', helperId);

      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error: any) {
      console.error("Error fetching help interactions:", error);
      return [];
    }
  };

  return {
    markAsHelped,
    removeHelpInteraction,
    getHelpInteractions,
    loading
  };
}
