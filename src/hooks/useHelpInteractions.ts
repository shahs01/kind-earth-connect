
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useHelpInteractions() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const markAsHelped = async (helperId: string, conversationId?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('help_interactions')
        .insert([{
          helper_id: helperId,
          helped_by_id: (await supabase.auth.getUser()).data.user?.id!,
          conversation_id: conversationId
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already recorded",
            description: "You've already marked this person as having helped you.",
            variant: "destructive"
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Impact recorded!",
        description: "This person's help has been added to their impact score.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error recording help interaction:", error);
      toast({
        title: "Error",
        description: "Failed to record the help interaction. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeHelpInteraction = async (helperId: string, conversationId?: string) => {
    setLoading(true);
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('help_interactions')
        .delete()
        .eq('helper_id', helperId)
        .eq('helped_by_id', currentUser.id)
        .eq('conversation_id', conversationId || null);

      if (error) throw error;

      toast({
        title: "Impact removed",
        description: "The help interaction has been removed.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error removing help interaction:", error);
      toast({
        title: "Error",
        description: "Failed to remove the help interaction. Please try again.",
        variant: "destructive"
      });
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

      if (error) throw error;
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
