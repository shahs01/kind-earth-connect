
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMessageActions } from "@/hooks/useMessageActions";

interface UseConversationActionsProps {
  userId?: string;
  currentUserId?: string;
  clearMessages: () => void;
}

export function useConversationActions({
  userId,
  currentUserId,
  clearMessages
}: UseConversationActionsProps) {
  const { toast } = useToast();
  const { deleteConversation } = useMessageActions();
  
  const handleDeleteConversation = useCallback(async () => {
    if (!userId || !currentUserId) {
      toast({
        title: "Error",
        description: "Cannot delete conversation: missing user information",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log(`Deleting conversation between ${currentUserId} and ${userId}`);
      await deleteConversation(userId);
      clearMessages();
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been successfully deleted.",
      });
      
      return true;
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [userId, currentUserId, deleteConversation, clearMessages, toast]);

  // Handle archiving conversation (for now just hide it from view)
  const handleArchiveConversation = useCallback(() => {
    toast({
      title: "Conversation archived",
      description: "The conversation has been archived.",
    });
    
    return true;
  }, [toast]);

  return {
    handleDeleteConversation,
    handleArchiveConversation
  };
}
