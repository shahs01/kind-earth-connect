
import React, { useRef, useEffect } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Message } from "@/hooks/useMessages";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUserId: string | undefined;
}

const MessageList = ({ messages, loading, currentUserId }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    console.log("Messages changed, scrolling to bottom", messages.length);
    scrollToBottom();
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No messages yet</p>
        <p className="text-sm mt-1">Start the conversation by sending a message</p>
      </div>
    );
  }

  console.log("Rendering message list with", messages.length, "messages");
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.sender_id === currentUserId
                ? 'bg-thryvance-green text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            <p className="whitespace-pre-line">{message.content}</p>
            <div
              className={`text-xs mt-1 ${
                message.sender_id === currentUserId ? 'text-green-100' : 'text-gray-500'
              }`}
            >
              {format(new Date(message.created_at), 'MMM d, h:mm a')}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
