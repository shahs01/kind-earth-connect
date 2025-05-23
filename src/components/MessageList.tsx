
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Conversation } from "@/hooks/useMessages";
import { UserIcon } from "lucide-react";

interface MessageListProps {
  conversations: Conversation[];
  onSelect: (userId: string) => void;
  selectedUserId?: string;
  onViewProfile: (userId: string) => void;
}

const MessageList = ({ conversations, onSelect, selectedUserId, onViewProfile }: MessageListProps) => {
  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-2">No conversations yet</p>
        <p className="text-sm text-gray-400">
          Start a new chat to begin messaging
        </p>
      </div>
    );
  }
  
  return (
    <div className="overflow-y-auto max-h-[calc(100vh-15rem)]">
      {conversations.map((convo) => (
        <div 
          key={convo.user.id}
          className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
            selectedUserId === convo.user.id ? 'bg-gray-100' : ''
          }`}
          onClick={() => onSelect(convo.user.id)}
          role="button"
          tabIndex={0}
          aria-selected={selectedUserId === convo.user.id}
        >
          <div className="flex items-start gap-3">
            <Avatar 
              className="h-10 w-10 cursor-pointer flex-shrink-0" 
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile(convo.user.id);
              }}
            >
              <AvatarImage src={convo.user.avatar} alt={convo.user.name || 'User'} />
              <AvatarFallback>
                {convo.user.name?.charAt(0) || <UserIcon className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="font-medium truncate">
                  {convo.user.name || convo.user.username || 'Unknown User'}
                </h4>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {format(new Date(convo.lastMessage.created_at), 'MMM d, h:mm a')}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-600 truncate max-w-[180px]">
                  {convo.lastMessage.content}
                </p>
                
                {convo.unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-thryvance-green text-white ml-2 flex-shrink-0">
                    {convo.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
