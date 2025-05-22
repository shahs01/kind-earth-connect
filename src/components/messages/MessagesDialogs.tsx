
import { User } from "@/types";
import NewMessageForm from "@/components/messages/NewMessageForm";
import ProfileDialog from "@/components/ProfileDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MessagesDialogsProps {
  isNewMessageOpen: boolean;
  setIsNewMessageOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  selectedProfile: User | null;
}

const MessagesDialogs = ({
  isNewMessageOpen,
  setIsNewMessageOpen,
  isProfileOpen,
  setIsProfileOpen,
  selectedProfile
}: MessagesDialogsProps) => {
  return (
    <>
      {/* New Message Dialog */}
      <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <NewMessageForm />
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      {selectedProfile && (
        <ProfileDialog 
          user={selectedProfile}
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
        />
      )}
    </>
  );
};

export default MessagesDialogs;
