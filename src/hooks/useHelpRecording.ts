
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
    if (!helperId || !conversationId) {
      setIsHelpRecorded(false);
      return;
    }

    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        setIsHelpRecorded(false);
        return;
      }

      const { data, error } = await supabase
        .from('help_interactions')
        .select('id')
        .eq('helper_id', helperId)
        .eq('helped_by_id', currentUser.user.id)
        .eq('conversation_id', conversationId)
        .maybeSingle();

      if (error) {
        console.error("Error checking help status:", error);
        setIsHelpRecorded(false);
        return;
      }

      // Explicitly set to false if no data exists, true if data exists
      setIsHelpRecorded(data !== null);
    } catch (error) {
      console.error("Error in checkHelpStatus:", error);
      setIsHelpRecorded(false);
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
        setLoading(false);
        return;
      }

      if (isHelpRecorded) {
        // Remove help recording - first check if record exists
        const { data: existingRecord } = await supabase
          .from('help_interactions')
          .select('id')
          .eq('helper_id', helperId)
          .eq('helped_by_id', currentUser.user.id)
          .eq('conversation_id', conversationId)
          .maybeSingle();

        if (!existingRecord) {
          console.log("No existing record found to delete");
          setIsHelpRecorded(false);
          setLoading(false);
          return;
        }

        // Delete the specific record
        const { error, count } = await supabase
          .from('help_interactions')
          .delete({ count: 'exact' })
          .eq('id', existingRecord.id);

        if (error) {
          console.error("Error removing help recording:", error);
          toast({
            title: "Error",
            description: "Failed to remove help recording",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        if (count === 0) {
          console.log("No records were deleted");
          setIsHelpRecorded(false);
          setLoading(false);
          return;
        }

        console.log("Successfully removed help recording, count:", count);
        setIsHelpRecorded(false);
        toast({
          title: "Help recording removed",
          description: "The help recording has been removed"
        });
      } else {
        // Add help recording - first check if it already exists
        const { data: existingRecord } = await supabase
          .from('help_interactions')
          .select('id')
          .eq('helper_id', helperId)
          .eq('helped_by_id', currentUser.user.id)
          .eq('conversation_id', conversationId)
          .maybeSingle();

        if (existingRecord) {
          console.log("Record already exists");
          setIsHelpRecorded(true);
          setLoading(false);
          return;
        }

        // Insert new record
        const { error, data } = await supabase
          .from('help_interactions')
          .insert({
            helper_id: helperId,
            helped_by_id: currentUser.user.id,
            conversation_id: conversationId
          })
          .select();

        if (error) {
          console.error("Error recording help:", error);
          toast({
            title: "Error",
            description: "Failed to record help",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        console.log("Successfully recorded help, data:", data);
        setIsHelpRecorded(true);
        toast({
          title: "Help recorded",
          description: "Thank you for recording this person's help!"
        });
      }

      // Double-check the status after the operation
      await checkHelpStatus();
      
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
  }, [helperId, conversationId, isHelpRecorded, loading, toast, checkHelpStatus]);

  return {
    isHelpRecorded,
    toggleHelpRecording,
    loading
  };
}
