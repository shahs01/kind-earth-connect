
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
import { X, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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

  const handleReportUser = () => {
    if (user) {
      toast({
        title: "Report submitted",
        description: `We've received your report about ${user.name || user.username}. Our team will review it shortly.`
      });
      onOpenChange(false);
    }
  };

  // Don't render anything if user is null to prevent glitches
  if (!user) {
    return null;
  }

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
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleReportUser}
          >
            <Flag className="h-4 w-4 mr-2" />
            Report User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
