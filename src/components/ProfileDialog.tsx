
import React from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import ProfileCard from "@/components/ProfileCard";
import { User } from "@/types";

interface ProfileDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileDialog = ({ user, open, onOpenChange }: ProfileDialogProps) => {
  const handleConnectClick = () => {
    // In a real app, this would initiate a connection request
    console.log("Connect request sent to", user?.name);
    // Could display a toast notification here
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">User Profile</DialogTitle>
        </DialogHeader>
        {user && (
          <ProfileCard 
            user={user} 
            onConnectClick={handleConnectClick} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
