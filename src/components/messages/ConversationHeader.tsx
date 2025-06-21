
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, User, Flag, Trash2, Archive, Inbox } from "lucide-react";
import { useParams } from "react-router-dom";
import { useConversationStates } from "@/hooks/useConversationStates";

interface ConversationHeaderProps {
  otherUser: any;
  loading: boolean;
  onViewProfile: () => void;
  onReportUser: () => void;
  onDeleteConversation: () => void;
  onArchiveConversation: () => void;
}

const ConversationHeader = ({
  otherUser,
  loading,
  onViewProfile,
  onReportUser,
  onDeleteConversation,
  onArchiveConversation
}: ConversationHeaderProps) => {
  const { userId } = useParams<{ userId: string }>();
  const { unarchiveConversation } = useConversationStates();
  const [isArchived, setIsArchived] = React.useState(false);

  // Check if conversation is archived
  React.useEffect(() => {
    const checkArchiveStatus = async () => {
      if (userId) {
        const { getConversationState } = require("@/hooks/useConversationStates");
        const state = await getConversationState(userId);
        setIsArchived(state?.is_archived || false);
      }
    };
    
    checkArchiveStatus();
  }, [userId]);

  const handleUnarchive = async () => {
    if (userId) {
      await unarchiveConversation(userId);
      setIsArchived(false);
      // Refresh the page to update the conversation list
      window.location.reload();
    }
  };

  if (loading || !otherUser) {
    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
          <AvatarFallback>
            {otherUser.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium text-gray-900">{otherUser.name}</h2>
          <p className="text-sm text-gray-500">@{otherUser.username}</p>
        </div>
        {isArchived && (
          <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            Archived
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewProfile}>
              <User className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onReportUser}>
              <Flag className="mr-2 h-4 w-4" />
              Report User
            </DropdownMenuItem>
            {isArchived ? (
              <DropdownMenuItem onClick={handleUnarchive}>
                <Inbox className="mr-2 h-4 w-4" />
                Unarchive Conversation
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={onArchiveConversation}>
                <Archive className="mr-2 h-4 w-4" />
                Archive Conversation
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDeleteConversation} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ConversationHeader;
