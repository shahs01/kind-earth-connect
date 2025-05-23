
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
    if (!loading && inputRef.current) {
      const focusInput = () => {
        if (inputRef.current) {
          inputRef.current.focus();
          console.log("Message input focused");
        }
      };
      
      // Immediate focus
      setTimeout(focusInput, 100);
      
      // Backup focus attempts
      const timer1 = setTimeout(focusInput, 500);
      const timer2 = setTimeout(focusInput, 1000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
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
        }
      }, 100);
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
          disabled={sending || loading}
          className="flex-1"
          autoComplete="off"
          aria-label="Message input"
          data-testid="message-input"
        />
        <Button 
          type="submit" 
          disabled={sending || !newMessage.trim() || loading}
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
