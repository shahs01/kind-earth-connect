
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface MessageInputProps {
  sending: boolean;
  loading: boolean;
  onSendMessage: (message: string) => void;
}

const MessageInput = ({ sending, loading, onSendMessage }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts or conversation changes
  useEffect(() => {
    console.log("MessageInput mounted or loading state changed:", { loading, isFocused: document.activeElement === inputRef.current });
    
    if (!loading && inputRef.current) {
      // Delayed focus to ensure DOM is ready
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          console.log("Input focused after delay");
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage);
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center space-x-2"
      >
        <Input
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={sending || loading}
          className="flex-1"
          autoComplete="off"
          aria-label="Message input"
        />
        <Button 
          type="submit" 
          disabled={sending || !newMessage.trim() || loading}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
