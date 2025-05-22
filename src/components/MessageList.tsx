
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Conversation } from "@/hooks/useMessages";
import { Button } from "@/components/ui/button";
import { UserIcon, Flag } from "lucide-react";

interface MessageListProps {
  conversations: Conversation[];
  onSelect: (userId: string) => void;
  selectedUserId?: string;
  onViewProfile: (userId: string) => void;
}

const MessageList = ({ conversations, onSelect, selectedUserId, onViewProfile }: MessageListProps) => {
  return (
    <div className="overflow-y-auto max-h-[70vh]">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No conversations yet
        </div>
      ) : (
        conversations.map((convo) => (
          <div 
            key={convo.user.id}
            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedUserId === convo.user.id ? 'bg-gray-100' : ''
            }`}
            onClick={() => onSelect(convo.user.id)}
            role="button"
            tabIndex={0}
            aria-selected={selectedUserId === convo.user.id}
          >
            <div className="flex items-start gap-3">
              <Avatar 
                className="h-10 w-10 cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile(convo.user.id);
                }}
              >
                <AvatarImage src={convo.user.avatar} alt={convo.user.name} />
                <AvatarFallback>
                  {convo.user.name?.charAt(0) || <UserIcon className="h-4 w-4" />}
                </AvatarFallback>
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
            
            <div className="mt-2 flex justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs text-thryvance-blue"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile(convo.user.id);
                }}
              >
                View Profile
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  // Show a toast notification for reporting
                  const event = new CustomEvent('report-user', { 
                    detail: { userId: convo.user.id } 
                  });
                  window.dispatchEvent(event);
                }}
              >
                <Flag className="h-3 w-3 mr-1" />
                Report
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MessageList;
