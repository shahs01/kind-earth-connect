
import React, { useRef, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Message } from "@/hooks/useMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserIcon } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUserId: string | undefined;
}

interface GroupedMessages {
  [date: string]: Message[];
}

const MessageSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="flex items-end gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-64 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

const MessageList: React.FC<MessageListProps> = ({ messages, loading, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Memoize grouped messages to prevent unnecessary recalculations
  const messagesByDate = useMemo((): GroupedMessages => {
    const groups: GroupedMessages = {};
    
    if (messages && messages.length) {
      messages.forEach((message: Message) => {
        if (!message.created_at) return;
        
        const date = new Date(message.created_at).toLocaleDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
      });
    }
    
    return groups;
  }, [messages]);
  
  // Add console log for debugging
  useEffect(() => {
    console.log("MessageList render with messages:", {
      count: messages.length, 
      loading: loading
    });
  }, [messages.length, loading]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <div className="space-y-4 w-full">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
          </div>
          <MessageSkeleton />
        </div>
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
          
          {dateMessages.map((message: Message, index: number) => {
            const isCurrentUser = message.sender_id === currentUserId;
            const isSameSenderAsPrevious = index > 0 && 
              dateMessages[index - 1].sender_id === message.sender_id;
            
            // Skip empty initialization messages (if there are any)
            if (!message.content || message.content.trim() === '') return null;
            
            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} ${
                  isSameSenderAsPrevious ? 'mt-1' : 'mt-4'
                }`}
              >
                {!isCurrentUser && !isSameSenderAsPrevious && (
                  <Avatar className="h-8 w-8 mb-1 flex-shrink-0">
                    <AvatarImage src={message.sender?.avatar || ''} alt={message.sender?.name || 'User'} />
                    <AvatarFallback>
                      {(message.sender?.name || 'User').charAt(0) || <UserIcon className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                {!isCurrentUser && isSameSenderAsPrevious && (
                  <div className="w-8 flex-shrink-0"></div> 
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
                    {message.created_at ? format(new Date(message.created_at), 'h:mm a') : ''}
                  </div>
                </div>
                
                {isCurrentUser && !isSameSenderAsPrevious && (
                  <Avatar className="h-8 w-8 mb-1 flex-shrink-0">
                    <AvatarImage src={message.sender?.avatar || ''} alt={message.sender?.name || 'User'} />
                    <AvatarFallback>
                      {(message.sender?.name || 'User').charAt(0) || <UserIcon className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                {isCurrentUser && isSameSenderAsPrevious && (
                  <div className="w-8 flex-shrink-0"></div>
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
