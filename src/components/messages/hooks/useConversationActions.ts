import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useConversationStates } from "@/hooks/useConversationStates";
import { NavigateFunction } from "react-router-dom";

interface UseConversationActionsProps {
  userId?: string;
  currentUserId?: string;
  clearMessages: () => void;
  navigate: NavigateFunction;
  refreshConversations?: () => void;
}

export function useConversationActions({
  userId,
  currentUserId,
  clearMessages,
  navigate,
  refreshConversations
}: UseConversationActionsProps) {
  const { toast } = useToast();
  const { deleteConversation, archiveConversation } = useConversationStates();
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
      console.log(`Deleting conversation with ${userId} for user ${currentUserId}`);
      
      // Optimistic update - clear messages immediately
      clearMessages();
      
      const success = await deleteConversation(userId);
      
      if (success) {
        // Refresh conversations list to remove from sidebar
        if (refreshConversations) {
          refreshConversations();
        }
        
        // Navigate back to messages root after deletion
        navigate('/messages');
        
        toast({
          title: "Conversation deleted",
          description: "The conversation has been deleted from your messages."
        });
      }
      
      return success;
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
  }, [userId, currentUserId, deleteConversation, clearMessages, toast, navigate, refreshConversations, isDeleting]);

  const handleArchiveConversation = useCallback(async () => {
    if (!userId || !currentUserId) {
      toast({
        title: "Error",
        description: "Cannot archive conversation: missing user information",
        variant: "destructive"
      });
      return false;
    }
    
    if (isArchiving) return false;
    
    setIsArchiving(true);
    
    try {
      console.log(`Archiving conversation with ${userId} for user ${currentUserId}`);
      
      const success = await archiveConversation(userId);
      
      if (success) {
        // Refresh conversations list to update the sidebar
        if (refreshConversations) {
          refreshConversations();
        }
        
        // Clear messages and navigate back to messages root
        clearMessages();
        navigate('/messages');
      }
      
      return success;
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
  }, [userId, currentUserId, archiveConversation, clearMessages, toast, navigate, isArchiving]);

  return {
    handleDeleteConversation,
    handleArchiveConversation,
    isDeleting,
    isArchiving
  };
}
