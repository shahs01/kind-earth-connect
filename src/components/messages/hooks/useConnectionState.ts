
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useConnectionState(
  connectionError: boolean,
  isReconnecting: boolean,
  handleReconnect: () => void
) {
  const [fetchError, setFetchError] = useState(false);
  const { toast } = useToast();
  
  // Handle fetch errors
  useEffect(() => {
    if (connectionError && !isReconnecting) {
      setFetchError(true);
    } else {
      setFetchError(false);
    }
  }, [connectionError, isReconnecting]);
  
  const handleRetry = useCallback(() => {
    setFetchError(false);
    handleReconnect();
    toast({
      title: "Retrying",
      description: "Attempting to reconnect..."
    });
  }, [handleReconnect, toast]);
  
  return {
    fetchError,
    setFetchError,
    handleRetry
  };
}
