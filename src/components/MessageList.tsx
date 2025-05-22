
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Conversation } from "@/hooks/useMessages";
import { Link } from "react-router-dom";

interface MessageListProps {
  conversations: Conversation[];
  onSelect: (userId: string) => void;
  selectedUserId?: string;
}

const MessageList = ({ conversations, onSelect, selectedUserId }: MessageListProps) => {
  return (
    <div className="overflow-y-auto max-h-[70vh]">
      {conversations.map((convo) => (
        <div 
          key={convo.user.id}
          onClick={() => onSelect(convo.user.id)}
          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
            selectedUserId === convo.user.id ? 'bg-gray-50' : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={convo.user.avatar} alt={convo.user.name} />
              <AvatarFallback>{convo.user.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="font-medium truncate">
                  {convo.user.name || convo.user.username}
                </h4>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {format(new Date(convo.lastMessage.created_at), 'MMM d, h:mm a')}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-600 truncate">
                  {convo.lastMessage.content}
                </p>
                
                {convo.unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-thryvance-green text-white ml-2">
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
