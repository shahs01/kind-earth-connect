
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMessageActions } from "@/hooks/useMessageActions";
import { NavigateFunction } from "react-router-dom";

interface UseConversationActionsProps {
  userId?: string;
  currentUserId?: string;
  clearMessages: () => void;
  navigate: NavigateFunction;
}

export function useConversationActions({
  userId,
  currentUserId,
  clearMessages,
  navigate
}: UseConversationActionsProps) {
  const { toast } = useToast();
  const { deleteConversation } = useMessageActions();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  
  const handleDeleteConversation = useCallback(async () => {
    if (!userId || !currentUserId) {
      toast({
        title: "Error",
        description: "Cannot delete conversation: missing user information",
        variant: "destructive"
      });
      return false;
    }
    
    if (isDeleting) return false;
    
    setIsDeleting(true);
    
    try {
      console.log(`Deleting conversation between ${currentUserId} and ${userId}`);
      
      // Optimistic update - clear messages immediately
      clearMessages();
      
      await deleteConversation(userId);
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been successfully deleted.",
      });
      
      // Navigate back to messages root after deletion
      navigate('/messages');
      
      return true;
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [userId, currentUserId, deleteConversation, clearMessages, toast, navigate, isDeleting]);

  // Handle archiving conversation (for now just hide it from view)
  const handleArchiveConversation = useCallback(async () => {
    if (isArchiving) return false;
    
    setIsArchiving(true);
    
    try {
      // For now, just show a success message
      // In the future, this could mark conversations as archived in the database
      toast({
        title: "Conversation archived",
        description: "The conversation has been archived.",
      });
      
      return true;
    } catch (error) {
      console.error("Failed to archive conversation:", error);
      toast({
        title: "Error",
        description: "Failed to archive conversation. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsArchiving(false);
    }
  }, [toast, isArchiving]);

  return {
    handleDeleteConversation,
    handleArchiveConversation,
    isDeleting,
    isArchiving
  };
}
