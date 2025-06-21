
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
  const [isChecking, setIsChecking] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Don't show if user is trying to mark themselves
  if (!user || user.id === helperId) {
    return null;
  }

  // Check if user has already marked this helper
  useEffect(() => {
    const checkExistingInteraction = async () => {
      if (!user || !helperId) return;
      
      setIsChecking(true);
      try {
        const interactions = await getHelpInteractions(helperId);
        const hasInteraction = interactions.some(
          interaction => 
            interaction.helped_by_id === user.id && 
            interaction.conversation_id === (conversationId || null)
        );
        setHasMarked(hasInteraction);
      } catch (error) {
        console.error('Error checking help interaction:', error);
        setHasMarked(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkExistingInteraction();
  }, [helperId, conversationId, user, getHelpInteractions]);

  const handleToggleHelp = async () => {
    if (loading || isProcessing) return; // Prevent double clicks
    
    setIsProcessing(true);
    try {
      if (hasMarked) {
        // Remove the help interaction
        const success = await removeHelpInteraction(helperId, conversationId);
        if (success) {
          setHasMarked(false);
        }
      } else {
        // Add the help interaction
        const success = await markAsHelped(helperId, conversationId);
        if (success) {
          setHasMarked(true);
        }
      }
    } catch (error) {
      console.error('Error toggling help interaction:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading only during initial check
  if (isChecking) {
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
      disabled={loading || isProcessing}
      size="sm"
      variant="ghost"
      className={`${
        hasMarked 
          ? "text-green-600 hover:text-green-700 hover:bg-green-50" 
          : "text-thryvance-green hover:text-thryvance-green-dark hover:bg-green-50"
      } ${className}`}
    >
      {(loading || isProcessing) ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 mr-1 ${hasMarked ? 'fill-current' : ''}`} />
      )}
      {hasMarked ? "Impact recorded!" : "This person helped me"}
    </Button>
  );
};

export default HelpInteractionButton;
