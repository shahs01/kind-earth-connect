
import React from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import ProfileCard from "@/components/ProfileCard";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileDialog = ({ user, open, onOpenChange }: ProfileDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleConnectClick = () => {
    if (user) {
      // Navigate to message conversation with this user
      navigate(`/messages/${user.id}`);
      onOpenChange(false);
      
      toast({
        title: "Conversation opened",
        description: `You can now message ${user.name || user.username}`
      });
    }
  };

  const handleViewFullProfile = () => {
    if (user) {
      // Navigate to the full profile page
      navigate(`/profile/${user.id}`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">User Profile</DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        {user && (
          <ProfileCard 
            user={user} 
            onConnectClick={handleConnectClick}
            onViewFullProfile={handleViewFullProfile}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
