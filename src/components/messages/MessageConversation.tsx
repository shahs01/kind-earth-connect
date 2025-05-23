
import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/hooks/useMessagingSystem";
import { User, UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface MessageConversationProps {
  userId: string;
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  currentUserId: string;
  onSendMessage: (content: string) => void;
}

const MessageConversation = ({
  userId,
  messages,
  isLoading,
  isSending,
  currentUserId,
  onSendMessage
}: MessageConversationProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Set initial height based on content and set focus
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      textareaRef.current.focus();
    }
  }, [newMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Extract other user info from first message
  useEffect(() => {
    if (messages.length > 0 && !otherUser) {
      const firstMessage = messages[0];
      if (firstMessage.sender_id === userId && firstMessage.sender) {
        setOtherUser(firstMessage.sender);
      } else if (firstMessage.receiver_id === userId && firstMessage.receiver) {
        setOtherUser(firstMessage.receiver);
      }
    }
  }, [messages, userId, otherUser]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    try {
      onSendMessage(newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle Enter key to send message (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Group messages by date
  const messagesByDate = messages.reduce<Record<string, Message[]>>((groups, message) => {
    const date = new Date(message.created_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green mb-4" />
        <p className="text-gray-500">Loading conversation...</p>
      </div>
    );
  }

  return (
    <>
      {/* Conversation Header */}
      <div className="border-b border-gray-200 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser?.avatar} alt={otherUser?.name || 'User'} />
            <AvatarFallback>
              {otherUser?.name?.charAt(0) || <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h3 className="font-semibold">
              {otherUser?.name || otherUser?.username || 'User'}
            </h3>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
            </div>
          ) : (
            Object.entries(messagesByDate).map(([date, dateMessages]) => (
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
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
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
                          <AvatarImage src={user?.avatar_url || ''} alt={user?.name || 'You'} />
                          <AvatarFallback>
                            {(user?.name || 'You').charAt(0) || <User className="h-4 w-4" />}
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
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-2">
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 min-h-[40px] max-h-[120px] p-2 resize-none"
            disabled={isSending}
            rows={1}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Send'
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default MessageConversation;
