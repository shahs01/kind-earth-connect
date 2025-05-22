
import React, { useRef, useEffect } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Message } from "@/hooks/useMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUserId: string | undefined;
}

const MessageList = ({ messages, loading, currentUserId }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Only scroll to bottom when new messages are added or on initial load
  useEffect(() => {
    console.log("MessageList updating with messages count:", messages.length);
    
    if (messages.length > 0) {
      const scrollToBottom = () => {
        if (messagesEndRef.current && containerRef.current) {
          // Use scrollIntoView with behavior smooth to avoid page jumping
          messagesEndRef.current.scrollIntoView({ 
            behavior: "smooth", 
            block: "end" 
          });
          console.log("Scrolled to bottom of message container");
        }
      };
      
      // Small delay to prevent scrolling issues
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

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

  // Group messages by date
  const messagesByDate: { [date: string]: Message[] } = {};
  messages.forEach((message) => {
    const date = new Date(message.created_at).toLocaleDateString();
    if (!messagesByDate[date]) {
      messagesByDate[date] = [];
    }
    messagesByDate[date].push(message);
  });

  return (
    <div 
      className="space-y-4 pb-2" 
      data-testid="messages-container"
      ref={containerRef}
    >
      {Object.entries(messagesByDate).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
              {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
          
          {dateMessages.map((message) => {
            const isCurrentUser = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${message.id}`}
              >
                {!isCurrentUser && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={message.sender?.avatar} />
                    <AvatarFallback>
                      <UserIcon className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    isCurrentUser
                      ? 'bg-thryvance-green text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                  <div
                    className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-green-100' : 'text-gray-500'
                    }`}
                  >
                    {format(new Date(message.created_at), 'h:mm a')}
                  </div>
                </div>
                
                {isCurrentUser && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={message.sender?.avatar} />
                    <AvatarFallback>
                      <UserIcon className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
