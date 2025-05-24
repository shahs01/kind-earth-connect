
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, ArchiveIcon, Trash2, UserIcon, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    onDeleteConversation();
    setIsDeleting(false);
  };

  if (loading || !otherUser) {
    return (
      <div className="border-b border-gray-200 p-3 flex items-center">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="ml-3">
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200 p-3 flex items-center justify-between">
      <div className="flex items-center cursor-pointer hover:bg-gray-50 rounded-lg p-2 -ml-2" onClick={onViewProfile}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser.avatar} alt={otherUser.name || 'User'} />
          <AvatarFallback>
            {otherUser.name?.charAt(0) || <UserIcon className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h3 className="font-semibold hover:text-thryvance-blue transition-colors">
            {otherUser.name || otherUser.username || 'Unknown User'}
          </h3>
          {otherUser.status && (
            <p className="text-xs text-gray-500">
              {otherUser.status === 'online' ? 'Active now' : 'Offline'}
            </p>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
            <span className="sr-only">More options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onViewProfile}>
            <UserIcon className="mr-2 h-4 w-4" />
            View Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onArchiveConversation}>
            <ArchiveIcon className="mr-2 h-4 w-4" />
            Archive Conversation
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onReportUser}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Report User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete Conversation'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ConversationHeader;
