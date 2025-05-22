
import React from 'react';
import { RefreshCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionErrorDisplayProps {
  isReconnecting: boolean;
  onReconnect: () => void;
}

const ConnectionErrorDisplay = ({ isReconnecting, onReconnect }: ConnectionErrorDisplayProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] p-4">
      <div className="text-red-500 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3 className="text-xl font-medium mb-2">Connection Error</h3>
      <p className="text-gray-500 mb-4 text-center">Unable to load messages. Please check your connection and try again.</p>
      <div className="flex gap-3">
        <Button onClick={onReconnect} disabled={isReconnecting} className="flex items-center gap-2">
          {isReconnecting ? 
            <Loader2 className="h-4 w-4 animate-spin" /> : 
            <RefreshCcw className="h-4 w-4" />
          }
          {isReconnecting ? "Reconnecting..." : "Reconnect"}
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </div>
    </div>
  );
};

export default ConnectionErrorDisplay;
