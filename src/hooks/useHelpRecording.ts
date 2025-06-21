
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseHelpRecordingProps {
  helperId: string;
  conversationId?: string;
}

export function useHelpRecording({ helperId, conversationId }: UseHelpRecordingProps) {
  const [isHelpRecorded, setIsHelpRecorded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Check if help is already recorded for this conversation
  const checkHelpStatus = useCallback(async () => {
    if (!helperId || !conversationId) return;

    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      const { data, error } = await supabase
        .from('help_interactions')
        .select('id')
        .eq('helper_id', helperId)
        .eq('helped_by_id', currentUser.user.id)
        .eq('conversation_id', conversationId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking help status:", error);
        return;
      }

      setIsHelpRecorded(!!data);
    } catch (error) {
      console.error("Error in checkHelpStatus:", error);
    }
  }, [helperId, conversationId]);

  useEffect(() => {
    checkHelpStatus();
  }, [checkHelpStatus]);

  const toggleHelpRecording = useCallback(async () => {
    if (!helperId || !conversationId) {
      toast({
        title: "Error",
        description: "Cannot record help: missing information",
        variant: "destructive"
      });
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to record help",
          variant: "destructive"
        });
        return;
      }

      if (isHelpRecorded) {
        // Remove help recording
        const { error } = await supabase
          .from('help_interactions')
          .delete()
          .eq('helper_id', helperId)
          .eq('helped_by_id', currentUser.user.id)
          .eq('conversation_id', conversationId);

        if (error) {
          console.error("Error removing help recording:", error);
          toast({
            title: "Error",
            description: "Failed to remove help recording",
            variant: "destructive"
          });
          return;
        }

        // Immediately update state after successful deletion
        setIsHelpRecorded(false);
        toast({
          title: "Help recording removed",
          description: "The help recording has been removed"
        });
      } else {
        // Add help recording
        const { error } = await supabase
          .from('help_interactions')
          .insert({
            helper_id: helperId,
            helped_by_id: currentUser.user.id,
            conversation_id: conversationId
          });

        if (error) {
          console.error("Error recording help:", error);
          toast({
            title: "Error",
            description: "Failed to record help",
            variant: "destructive"
          });
          return;
        }

        // Immediately update state after successful insertion
        setIsHelpRecorded(true);
        toast({
          title: "Help recorded",
          description: "Thank you for recording this person's help!"
        });
      }
    } catch (error) {
      console.error("Error in toggleHelpRecording:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [helperId, conversationId, isHelpRecorded, loading, toast]);

  return {
    isHelpRecorded,
    toggleHelpRecording,
    loading
  };
}
