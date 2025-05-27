
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
  const { markAsHelped, loading } = useHelpInteractions();
  const [hasMarked, setHasMarked] = useState(false);

  // Don't show if user is trying to mark themselves
  if (!user || user.id === helperId) {
    return null;
  }

  const handleMarkAsHelped = async () => {
    const success = await markAsHelped(helperId, conversationId);
    if (success) {
      setHasMarked(true);
    }
  };

  if (hasMarked) {
    return (
      <div className={`flex items-center text-green-600 text-sm ${className}`}>
        <Heart className="h-4 w-4 mr-1 fill-current" />
        Impact recorded!
      </div>
    );
  }

  return (
    <Button
      onClick={handleMarkAsHelped}
      disabled={loading}
      size="sm"
      variant="ghost"
      className={`text-thryvance-green hover:text-thryvance-green-dark hover:bg-green-50 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Heart className="h-4 w-4 mr-1" />
      )}
      This person helped me
    </Button>
  );
};

export default HelpInteractionButton;
