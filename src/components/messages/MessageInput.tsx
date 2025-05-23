
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  sending: boolean;
  loading: boolean;
  onSendMessage: (message: string) => void;
}

const MessageInput = ({ sending, loading, onSendMessage }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(1);
  const maxRows = 5;
  
  // Focus input when component mounts or conversation changes
  useEffect(() => {
    if (textareaRef.current && !loading) {
      textareaRef.current.focus();
      console.log("Focus on message input");
    }
  }, [loading]);

  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      
      // Calculate new height
      const newRows = Math.min(
        maxRows,
        Math.max(1, Math.ceil(textareaRef.current.scrollHeight / 24))
      );
      
      setRows(newRows);
      
      // Set the height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newMessage, maxRows]);

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
        if (textareaRef.current) {
          textareaRef.current.focus();
          console.log("Re-focusing input after sending");
        }
      }, 50);
    }
  }, [newMessage, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-3 border-t border-gray-200">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-end space-x-2"
      >
        <Textarea
          ref={textareaRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={sending || loading}
          className="flex-1 min-h-[40px] max-h-[120px] p-2 resize-none"
          autoComplete="off"
          rows={rows}
          aria-label="Message input"
          data-testid="message-input"
        />
        <Button 
          type="submit" 
          disabled={sending || !newMessage.trim() || loading}
          data-testid="send-button"
          className="h-10"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" />
              <span>Send</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
