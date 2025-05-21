
import { useState } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User as UserType } from "@/types";
import AvatarUpload from "@/components/AvatarUpload";
import { useAuth } from "@/context/AuthContext";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditProfileDialog = ({ open, onOpenChange }: EditProfileDialogProps) => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    username: user?.username || ""
  });
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle avatar update
  const handleAvatarUpdate = (avatarUrl: string) => {
    if (user) {
      updateProfile({
        ...user,
        avatar: avatarUrl
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!user) return;
      
      await updateProfile({
        ...user,
        ...formData
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile.",
        variant: "destructive"
      });
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <AvatarUpload
              currentAvatar={user.avatar}
              userId={user.id}
              onAvatarUpdate={handleAvatarUpdate}
            />
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                className="resize-none min-h-[100px]"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
