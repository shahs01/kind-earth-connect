
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { useHelpInteractions } from "@/hooks/useHelpInteractions";
import { useAuth } from "@/context/AuthContext";

interface HelpInteractionButtonProps {
  helperId: string;
  conversationId?: string;
  className?: string;
}

const HelpInteractionButton = ({ helperId, conversationId, className }: HelpInteractionButtonProps) => {
  const { user } = useAuth();
  const { markAsHelped, removeHelpInteraction, getHelpInteractions, loading } = useHelpInteractions();
  const [hasMarked, setHasMarked] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Don't show if user is trying to mark themselves
  if (!user || user.id === helperId) {
    return null;
  }

  // Check if user has already marked this helper
  useEffect(() => {
    let mounted = true;
    
    const checkExistingInteraction = async () => {
      if (!user || !helperId) {
        setInitialLoading(false);
        return;
      }
      
      try {
        const interactions = await getHelpInteractions(helperId);
        if (mounted) {
          const hasInteraction = interactions.some(
            interaction => 
              interaction.helped_by_id === user.id && 
              interaction.conversation_id === (conversationId || null)
          );
          setHasMarked(hasInteraction);
        }
      } catch (error) {
        console.error('Error checking help interaction:', error);
        if (mounted) {
          setHasMarked(false);
        }
      } finally {
        if (mounted) {
          setInitialLoading(false);
        }
      }
    };

    checkExistingInteraction();
    
    return () => {
      mounted = false;
    };
  }, [helperId, conversationId, user, getHelpInteractions]);

  const handleToggleHelp = async () => {
    if (loading || initialLoading) {
      return;
    }
    
    try {
      let success = false;
      
      if (hasMarked) {
        success = await removeHelpInteraction(helperId, conversationId);
        if (success) {
          setHasMarked(false);
        }
      } else {
        success = await markAsHelped(helperId, conversationId);
        if (success) {
          setHasMarked(true);
        }
      }
    } catch (error) {
      console.error('Error toggling help interaction:', error);
    }
  };

  // Show loading only during initial check
  if (initialLoading) {
    return (
      <Button
        disabled
        size="sm"
        variant="ghost"
        className={`text-gray-400 ${className}`}
      >
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <Button
      onClick={handleToggleHelp}
      disabled={loading}
      size="sm"
      variant="ghost"
      className={`${
        hasMarked 
          ? "text-green-600 hover:text-green-700 hover:bg-green-50" 
          : "text-thryvance-green hover:text-thryvance-green-dark hover:bg-green-50"
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 mr-1 ${hasMarked ? 'fill-current' : ''}`} />
      )}
      {hasMarked ? "Impact recorded!" : "This person helped me"}
    </Button>
  );
};

export default HelpInteractionButton;
