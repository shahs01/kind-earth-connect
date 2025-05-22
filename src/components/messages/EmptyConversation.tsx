
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EmptyConversationProps {
  error?: boolean;
  onRetry?: () => void;
}

const EmptyConversation = ({ error, onRetry }: EmptyConversationProps) => {
  const navigate = useNavigate();
  
  if (error) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-center p-6">
        <div className="text-red-500 mb-4">
          <MessageSquare className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-xl font-medium mb-2">Failed to fetch conversation</h3>
        <p className="text-gray-500 mb-4">
          There was an error loading this conversation
        </p>
        {onRetry && (
          <Button onClick={onRetry} className="mr-2">
            Retry
          </Button>
        )}
        <Button variant="outline" onClick={() => navigate('/messages')}>
          Back to Messages
        </Button>
      </div>
    );
  }
  
  return (
    <div className="h-96 flex flex-col items-center justify-center text-center p-6">
      <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
      <p className="text-gray-500">
        Choose a conversation from the list or start a new one
      </p>
    </div>
  );
};

export default EmptyConversation;
