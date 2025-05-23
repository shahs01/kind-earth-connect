
import { format, isToday, isYesterday } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Conversation } from "@/hooks/useMessagingSystem";
import { UserIcon } from "lucide-react";

interface ConversationsListProps {
  conversations: Conversation[];
  selectedUserId?: string;
  onSelect: (userId: string) => void;
}

const ConversationsList = ({ conversations, selectedUserId, onSelect }: ConversationsListProps) => {
  // Format the date in a more human-readable way
  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (date.getFullYear() === new Date().getFullYear()) {
      return format(date, 'MMM d');
    } else {
      return format(date, 'MM/dd/yy');
    }
  };

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conversation) => {
        const lastMessageDate = conversation.lastMessage 
          ? new Date(conversation.lastMessage.created_at) 
          : new Date();
        
        return (
          <div
            key={conversation.userId}
            className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedUserId === conversation.userId ? 'bg-gray-100' : ''
            }`}
            onClick={() => onSelect(conversation.userId)}
            role="button"
            tabIndex={0}
            aria-selected={selectedUserId === conversation.userId}
          >
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage 
                  src={conversation.user.avatar} 
                  alt={conversation.user.name || 'User'}
                />
                <AvatarFallback>
                  {conversation.user.name?.charAt(0) || <UserIcon className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {conversation.user.name || conversation.user.username || 'Unknown User'}
                  </h4>
                  <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatMessageDate(lastMessageDate)}
                  </p>
                </div>
                
                <div className="mt-1 flex items-center justify-between">
                  <p className={`text-sm truncate ${
                    conversation.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'
                  }`} style={{ maxWidth: '180px' }}>
                    {conversation.lastMessage?.content || "No messages yet"}
                  </p>
                  
                  {conversation.unreadCount > 0 && (
                    <Badge className="bg-thryvance-green text-white ml-1">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationsList;
