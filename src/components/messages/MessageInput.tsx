
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
      // Better focus handling with multiple attempts
      const focusInput = () => {
        if (inputRef.current) {
          inputRef.current.focus();
          console.log("Message input focused");
        }
      };
      
      // Initial focus attempt
      focusInput();
      
      // Backup focus attempt after DOM has settled
      const timer = setTimeout(focusInput, 300);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim()) {
      console.log("Preparing to send message:", newMessage.substring(0, 20) + (newMessage.length > 20 ? '...' : ''));
      
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
          console.log("Input refocused after sending");
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
