
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
  const [buttonLoading, setButtonLoading] = useState(false);

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
        console.log("Checking existing interaction for helper:", helperId);
        const interactions = await getHelpInteractions(helperId);
        if (mounted) {
          const hasInteraction = interactions.some(
            interaction => 
              interaction.helped_by_id === user.id && 
              interaction.conversation_id === (conversationId || null)
          );
          console.log("Has existing interaction:", hasInteraction);
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
    if (loading || initialLoading || buttonLoading) {
      return;
    }
    
    setButtonLoading(true);
    
    try {
      console.log("Toggling help interaction, current state:", hasMarked);
      
      if (hasMarked) {
        console.log("Removing help interaction");
        const success = await removeHelpInteraction(helperId, conversationId);
        if (success) {
          setHasMarked(false);
          console.log("Successfully removed interaction, state now:", false);
        }
      } else {
        console.log("Adding help interaction");
        const success = await markAsHelped(helperId, conversationId);
        if (success) {
          setHasMarked(true);
          console.log("Successfully added interaction, state now:", true);
        }
      }
    } catch (error) {
      console.error('Error toggling help interaction:', error);
    } finally {
      setButtonLoading(false);
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

  const isLoading = loading || buttonLoading;

  return (
    <Button
      onClick={handleToggleHelp}
      disabled={isLoading}
      size="sm"
      variant="ghost"
      className={`${
        hasMarked 
          ? "text-green-600 hover:text-green-700 hover:bg-green-50" 
          : "text-thryvance-green hover:text-thryvance-green-dark hover:bg-green-50"
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 mr-1 ${hasMarked ? 'fill-current' : ''}`} />
      )}
      {hasMarked ? "Impact recorded!" : "This person helped me"}
    </Button>
  );
};

export default HelpInteractionButton;
