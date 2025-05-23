
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
  const listContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  
  // Debug current message state
  useEffect(() => {
    console.log(`MessageList: Rendering with ${messages.length} messages, loading: ${loading}`);
    if (messages.length > 0) {
      console.log("First message:", messages[0].id, "Last message:", messages[messages.length - 1].id);
    }
    
    // Update ref to track message count changes
    prevMessagesLengthRef.current = messages.length;
  }, [messages, loading]);
  
  // Always scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      console.log("Scrolled to bottom of messages");
    }
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
      </div>
    );
  }

  if (!loading && messages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="font-medium">No messages yet</p>
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
      ref={listContainerRef}
      className="space-y-6" 
      data-testid="messages-container"
    >
      {Object.entries(messagesByDate).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
          
          {dateMessages.map((message, index) => {
            const isCurrentUser = message.sender_id === currentUserId;
            const isSameSenderAsPrevious = index > 0 && 
              dateMessages[index - 1].sender_id === message.sender_id;
            
            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} ${
                  isSameSenderAsPrevious ? 'mt-1' : 'mt-4'
                }`}
                data-testid={`message-${message.id}`}
                data-sender={message.sender_id}
                data-receiver={message.receiver_id}
              >
                {!isCurrentUser && !isSameSenderAsPrevious && (
                  <Avatar className="h-8 w-8 mb-1">
                    <AvatarImage src={message.sender?.avatar} />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                {!isCurrentUser && isSameSenderAsPrevious && (
                  <div className="w-8"></div> 
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    isCurrentUser
                      ? 'bg-thryvance-green text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line break-words">{message.content}</p>
                  <div
                    className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-green-100' : 'text-gray-500'
                    }`}
                  >
                    {format(new Date(message.created_at), 'h:mm a')}
                  </div>
                </div>
                
                {isCurrentUser && !isSameSenderAsPrevious && (
                  <Avatar className="h-8 w-8 mb-1">
                    <AvatarImage src={message.sender?.avatar} />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                {isCurrentUser && isSameSenderAsPrevious && (
                  <div className="w-8"></div>
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
