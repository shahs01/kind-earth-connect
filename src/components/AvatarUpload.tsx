
import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Upload, X, Loader2 } from 'lucide-react';
import { useAvatarStorage } from "@/hooks/useAvatarStorage";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  currentAvatar: string | null;
  userId: string;
  onAvatarUpdate: (avatarUrl: string) => void;
}

const AvatarUpload = ({ currentAvatar, userId, onAvatarUpdate }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, removeAvatar } = useAvatarStorage();
  const { toast } = useToast();

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // Check file type
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file (jpg, png, gif, webp)",
          variant: "destructive"
        });
        return;
      }
      
      const result = await uploadAvatar(file, userId);
      
      if (result) {
        setAvatarUrl(result.url);
        onAvatarUpdate(result.url);
        
        toast({
          title: "Avatar updated",
          description: "Your profile photo has been updated successfully."
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading your photo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleRemoveAvatar = async () => {
    try {
      setUploading(true);
      
      if (avatarUrl && !avatarUrl.includes('ui-avatars.com')) {
        const removed = await removeAvatar(avatarUrl);
        
        if (removed) {
          const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userId)}`;
          setAvatarUrl(defaultAvatar);
          onAvatarUpdate(defaultAvatar);
          
          toast({
            title: "Avatar removed",
            description: "Your profile photo has been removed."
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was a problem removing your photo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-white shadow-md">
          <AvatarImage src={avatarUrl || undefined} alt="Profile" />
          <AvatarFallback>
            <User className="h-12 w-12 text-thryvance-neutral-dark" />
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1"
        >
          <Upload className="h-4 w-4" />
          Upload Photo
        </Button>
        
        {avatarUrl && !avatarUrl.includes('ui-avatars.com') && (
          <Button 
            variant="outline" 
            size="sm" 
            type="button"
            onClick={handleRemoveAvatar}
            disabled={uploading}
            className="flex items-center gap-1 text-red-500 hover:text-red-600"
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadAvatar}
        accept="image/*"
        className="hidden"
        disabled={uploading}
      />
      
      <p className="text-xs text-gray-500">
        Recommended: Square image, max 5MB
      </p>
    </div>
  );
};

export default AvatarUpload;
