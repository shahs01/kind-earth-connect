
import { useState } from "react";
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
  const { markAsHelped, removeHelpInteraction, loading } = useHelpInteractions();
  const [hasMarked, setHasMarked] = useState(false);

  // Don't show if user is trying to mark themselves
  if (!user || user.id === helperId) {
    return null;
  }

  const handleToggleHelp = async () => {
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
  };

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
