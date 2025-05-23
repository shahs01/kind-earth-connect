
import React from "react";
import { MessageSquare, AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyConversationProps {
  error?: boolean;
  onRetry?: () => void;
}

const EmptyConversation = ({ error = false, onRetry }: EmptyConversationProps) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">Failed to load conversation</h3>
        <p className="text-gray-500 mb-4 max-w-sm">
          There was an error loading this conversation. This could be due to a network issue or the server is unavailable.
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RotateCw className="h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
      <p className="text-gray-500 max-w-sm">
        Select a conversation from the sidebar or start a new one to begin messaging.
      </p>
    </div>
  );
};

export default EmptyConversation;
