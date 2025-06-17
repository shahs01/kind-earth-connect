
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Conversation } from "@/hooks/useMessages";
import { User as UserIcon, Archive, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { useConversationStates } from "@/hooks/useConversationStates";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import ProfileDialog from "@/components/ProfileDialog";

interface ConversationsListProps {
  conversations: Conversation[];
  onSelectConversation: (userId: string) => void;
  selectedUserId?: string;
  showArchived?: boolean;
}

const ConversationsList = ({ 
  conversations, 
  onSelectConversation, 
  selectedUserId,
  showArchived = false
}: ConversationsListProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchUserProfile } = useAuthProfile();
  const { archiveConversation, unarchiveConversation } = useConversationStates();
  const { toast } = useToast();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  console.log("ConversationsList component:", {
    conversations: conversations.length,
    selectedUserId,
    showArchived
  });

  const handleAvatarClick = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (userId === user?.id) {
      navigate(`/profile/${user.id}`);
      return;
    }

    try {
      setProfileLoading(true);
      const userData = await fetchUserProfile(userId);
      setSelectedProfileUser(userData);
      setProfileDialogOpen(true);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Error",
        description: "Could not load user profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleArchiveToggle = async (userId: string, isCurrentlyArchived: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (isCurrentlyArchived) {
        await unarchiveConversation(userId);
      } else {
        await archiveConversation(userId);
      }
      
      // Refresh conversations after state change
      window.location.reload();
    } catch (error) {
      console.error("Error toggling archive state:", error);
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-2">
          {showArchived ? 'No archived conversations' : 'No conversations yet'}
        </p>
        <p className="text-sm text-gray-400">
          {showArchived 
            ? 'Archived conversations will appear here' 
            : 'Start a new chat to begin messaging'
          }
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="overflow-y-auto max-h-[calc(100vh-15rem)]">
        {conversations.map((convo) => {
          const userId = convo.user?.id || '';
          const userName = convo.user?.name || convo.user?.username || 'Unknown User';
          const userAvatar = convo.user?.avatar || '';
          const lastMessageDate = convo.lastMessage?.created_at ? new Date(convo.lastMessage.created_at) : new Date();
          const lastMessageContent = convo.lastMessage?.content || '';
          const unreadCount = convo.unreadCount || 0;
          const isArchived = convo.isArchived || false;
          
          if (!userId) return null;

          console.log("Rendering conversation item:", { userId, userName, selectedUserId, isSelected: selectedUserId === userId });
          
          return (
            <div 
              key={userId}
              className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedUserId === userId ? 'bg-gray-100' : ''
              }`}
              onClick={() => onSelectConversation(userId)}
              role="button"
              tabIndex={0}
              aria-selected={selectedUserId === userId}
            >
              <div className="flex items-start gap-3">
                <Avatar 
                  className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-thryvance-blue transition-all flex-shrink-0" 
                  onClick={(e) => handleAvatarClick(userId, e)}
                >
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback>
                    {userName.charAt(0) || <UserIcon className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium truncate cursor-pointer hover:text-thryvance-blue transition-colors"
                        onClick={(e) => handleAvatarClick(userId, e)}>
                      {userName}
                    </h4>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {format(lastMessageDate, 'MMM d, h:mm a')}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleArchiveToggle(userId, isArchived, e)}
                        className="p-1 h-6 w-6 hover:bg-gray-200"
                        title={isArchived ? "Unarchive conversation" : "Archive conversation"}
                      >
                        {isArchived ? (
                          <Inbox className="h-3 w-3" />
                        ) : (
                          <Archive className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
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
                
                {profileLoading && (
                  <div className="animate-spin h-4 w-4 border-2 border-thryvance-green border-t-transparent rounded-full"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedProfileUser && (
        <ProfileDialog
          user={selectedProfileUser}
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
          onViewFullProfile={() => {
            navigate(`/profile/${selectedProfileUser.id}`);
            setProfileDialogOpen(false);
          }}
        />
      )}
    </>
  );
};

export default ConversationsList;
