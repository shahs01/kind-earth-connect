
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
  const { toggleHelpInteraction, checkHelpInteraction, loading } = useHelpInteractions();
  const [isSelected, setIsSelected] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Don't show if user is trying to mark themselves
  if (!user || user.id === helperId) {
    return null;
  }

  // Check initial state
  useEffect(() => {
    const checkInitialState = async () => {
      if (!user || !helperId) {
        setInitialLoading(false);
        return;
      }

      try {
        const isHelped = await checkHelpInteraction(helperId, conversationId);
        setIsSelected(isHelped);
      } catch (error) {
        console.error('Error checking initial help state:', error);
        setIsSelected(false);
      } finally {
        setInitialLoading(false);
      }
    };

    checkInitialState();
  }, [helperId, conversationId, user, checkHelpInteraction]);

  const handleToggle = async () => {
    if (loading || initialLoading) {
      return;
    }

    try {
      const newState = await toggleHelpInteraction(helperId, conversationId);
      setIsSelected(newState);
    } catch (error) {
      console.error('Error toggling help interaction:', error);
    }
  };

  // Show loading during initial check
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
      onClick={handleToggle}
      disabled={loading}
      size="sm"
      variant="ghost"
      className={`${
        isSelected 
          ? "text-red-500 hover:text-red-600" 
          : "text-gray-500 hover:text-red-500"
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 mr-1 ${isSelected ? 'fill-current' : ''}`} />
      )}
      This person helped me
    </Button>
  );
};

export default HelpInteractionButton;
