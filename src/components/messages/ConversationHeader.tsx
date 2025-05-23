
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MoreVertical, UserIcon, Archive, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User } from "@/types";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ConversationHeaderProps {
  otherUser: User | null;
  loading: boolean;
  onViewProfile: () => void;
  onReportUser: () => void;
  onDeleteConversation?: () => void;
  onArchiveConversation?: () => void;
}

const ConversationHeader = ({ 
  otherUser, 
  loading, 
  onViewProfile, 
  onReportUser,
  onDeleteConversation,
  onArchiveConversation
}: ConversationHeaderProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (loading || !otherUser) {
    return (
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteDialogOpen(false);
    if (onDeleteConversation) {
      onDeleteConversation();
    }
  };

  return (
    <>
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 cursor-pointer" onClick={onViewProfile}>
            <AvatarImage src={otherUser.avatar} alt={otherUser.name || otherUser.username} />
            <AvatarFallback>
              {otherUser.name?.charAt(0) || otherUser.username?.charAt(0) || <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium" onClick={onViewProfile} role="button">
              {otherUser.name || otherUser.username || "Unknown User"}
            </h3>
            {otherUser.username && otherUser.name && (
              <p className="text-xs text-gray-500">@{otherUser.username}</p>
            )}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewProfile}>
              <UserIcon className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onReportUser}>
              Report User
            </DropdownMenuItem>
            {onArchiveConversation && (
              <DropdownMenuItem onClick={onArchiveConversation}>
                <Archive className="mr-2 h-4 w-4" />
                Archive Conversation
              </DropdownMenuItem>
            )}
            {onDeleteConversation && (
              <DropdownMenuItem onClick={handleDeleteClick} className="text-red-500">
                <Trash className="mr-2 h-4 w-4" />
                Delete Conversation
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConversationHeader;
