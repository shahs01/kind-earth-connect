
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
      {conversations.map((convo) => {
        // Handle potentially undefined values gracefully
        const userId = convo.user?.id || '';
        const userName = convo.user?.name || convo.user?.username || 'Unknown User';
        const userAvatar = convo.user?.avatar || '';
        const lastMessageDate = convo.lastMessage?.created_at ? new Date(convo.lastMessage.created_at) : new Date();
        const lastMessageContent = convo.lastMessage?.content || '';
        const unreadCount = convo.unreadCount || 0;
        
        // Skip invalid conversations
        if (!userId) return null;
        
        return (
          <div 
            key={userId}
            className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedUserId === userId ? 'bg-gray-100' : ''
            }`}
            onClick={() => onSelect(userId)}
            role="button"
            tabIndex={0}
            aria-selected={selectedUserId === userId}
          >
            <div className="flex items-start gap-3">
              <Avatar 
                className="h-10 w-10 cursor-pointer flex-shrink-0" 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile(userId);
                }}
              >
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>
                  {userName.charAt(0) || <UserIcon className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium truncate">
                    {userName}
                  </h4>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {format(lastMessageDate, 'MMM d, h:mm a')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-600 truncate max-w-[180px]">
                    {lastMessageContent || "No messages yet"}
                  </p>
                  
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="bg-thryvance-green text-white ml-2 flex-shrink-0">
                      {unreadCount}
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

export default MessageList;
