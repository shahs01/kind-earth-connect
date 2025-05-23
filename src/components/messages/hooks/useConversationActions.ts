
import { useCallback } from "react";
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
  // Access message actions directly for delete functionality
  const { deleteConversation: deleteConversationAction } = useMessageActions();

  // Delete conversation handler
  const handleDeleteConversation = useCallback(async () => {
    if (!userId || !currentUserId) {
      console.error("Cannot delete conversation: missing userId or not logged in");
      return Promise.reject(new Error("Missing user information"));
    }
    
    try {
      console.log("Deleting conversation with user:", userId);
      await deleteConversationAction(userId);
      
      // Clean up state after deletion
      clearMessages();
      
      return true;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  }, [userId, currentUserId, deleteConversationAction, clearMessages]);

  return {
    handleDeleteConversation
  };
}
