
import React, { useState, useEffect, useRef, useCallback } from "react";
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
    // Immediate focus attempt
    if (inputRef.current) {
      inputRef.current.focus();
      console.log("Immediate focus attempt on message input");
    }
    
    // Backup focus with timeouts to ensure focus works after rendering
    const timers = [100, 300, 500].map(delay => 
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          console.log(`Focus attempt after ${delay}ms on message input`);
        }
      }, delay)
    );
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [loading]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage.substring(0, 20) + (newMessage.length > 20 ? '...' : ''));
      
      // Store message locally before clearing input
      const messageToSend = newMessage.trim();
      
      // Clear input first for better UX
      setNewMessage("");
      
      // Then send message
      onSendMessage(messageToSend);
      
      // Re-focus input after sending
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          console.log("Re-focusing input after sending");
        }
      }, 50);
    }
  }, [newMessage, onSendMessage]);

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
          disabled={sending}
          className="flex-1"
          autoComplete="off"
          aria-label="Message input"
          data-testid="message-input"
        />
        <Button 
          type="submit" 
          disabled={sending || !newMessage.trim()}
          data-testid="send-button"
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
