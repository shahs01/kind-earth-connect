
import React from "react";
import { Loader2 } from "lucide-react";
import ConnectionErrorDisplay from "@/components/messages/ConnectionErrorDisplay";
import EmptyConversation from "@/components/messages/EmptyConversation";
import { useAuth } from "@/context/AuthContext";

interface ConnectionStatusHandlerProps {
  user: any;
  connectionError: boolean;
  isReconnecting: boolean;
  fetchError: boolean;
  profileLoading: boolean;
  otherUser: any;
  handleReconnect: () => void;
  handleRetry: () => void;
}

const ConnectionStatusHandler = ({
  user,
  connectionError,
  isReconnecting,
  fetchError,
  profileLoading,
  otherUser,
  handleReconnect,
  handleRetry
}: ConnectionStatusHandlerProps) => {
  // Redirect if user is not authenticated
  if (!user) {
    return <div className="p-8 text-center">Please log in to view messages</div>;
  }

  // Display connection error if there's an issue
  if (connectionError) {
    return (
      <ConnectionErrorDisplay 
        isReconnecting={isReconnecting}
        onReconnect={handleReconnect}
      />
    );
  }
  
  // Handle specific fetch error for this conversation
  if (fetchError) {
    return <EmptyConversation error={true} onRetry={handleRetry} />;
  }
  
  // Show loading state when user profile is loading
  if (profileLoading && !otherUser) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green mb-4" />
        <p className="text-gray-500">Loading conversation...</p>
      </div>
    );
  }

  return null;
};

export default ConnectionStatusHandler;
