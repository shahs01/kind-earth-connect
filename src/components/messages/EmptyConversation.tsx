
import React from "react";
import { MessageSquare, Users, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyConversationProps {
  error?: boolean;
  onRetry?: () => void;
}

const EmptyConversation = ({ error, onRetry }: EmptyConversationProps) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50">
        <div className="max-w-md">
          <AlertCircle className="h-16 w-16 mx-auto mb-6 text-red-400" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Unable to load conversation
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            There was an error loading this conversation. This may be due to a connection issue or the conversation may no longer be available.
          </p>
          
          {onRetry && (
            <Button onClick={onRetry} className="mb-4">
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50">
      <div className="max-w-md">
        <MessageSquare className="h-16 w-16 mx-auto mb-6 text-gray-300" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Select a conversation
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Choose a conversation from the sidebar to start messaging, or create a new conversation to connect with someone.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>Your conversations will appear on the left</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Plus className="h-4 w-4" />
            <span>Click "New Chat" to start a conversation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyConversation;
