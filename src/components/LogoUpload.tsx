
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Building } from 'lucide-react';
import { useAvatarStorage } from "@/hooks/useAvatarStorage";
import { useToast } from "@/hooks/use-toast";

interface LogoUploadProps {
  currentLogo: string | null;
  onLogoUpdate: (logoUrl: string) => void;
}

const LogoUpload = ({ currentLogo, onLogoUpdate }: LogoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogo);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, removeAvatar } = useAvatarStorage();
  const { toast } = useToast();

  const handleUploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      
      // Use a unique identifier for nonprofit logos
      const logoId = `nonprofit-logo-${Date.now()}`;
      const result = await uploadAvatar(file, logoId);
      
      if (result) {
        setLogoUrl(result.url);
        onLogoUpdate(result.url);
        
        toast({
          title: "Logo uploaded",
          description: "The nonprofit logo has been uploaded successfully."
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "There was a problem uploading the logo.",
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
  
  const handleRemoveLogo = async () => {
    try {
      setUploading(true);
      
      if (logoUrl && !logoUrl.includes('ui-avatars.com')) {
        const removed = await removeAvatar(logoUrl);
        
        if (removed) {
          setLogoUrl('');
          onLogoUpdate('');
          
          toast({
            title: "Logo removed",
            description: "The nonprofit logo has been removed."
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was a problem removing the logo.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-lg bg-red-50 flex items-center justify-center overflow-hidden border-2 border-red-100">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo preview" 
                className="h-full w-full object-cover"
              />
            ) : (
              <Building className="h-8 w-8 text-red-600" />
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
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
            Upload Logo
          </Button>
          
          {logoUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              type="button"
              onClick={handleRemoveLogo}
              disabled={uploading}
              className="flex items-center gap-1 text-red-500 hover:text-red-600"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadLogo}
        accept="image/*"
        className="hidden"
        disabled={uploading}
      />
      
      <p className="text-xs text-gray-500">
        Recommended: Square image, max 5MB (JPG, PNG, GIF, WebP)
      </p>
    </div>
  );
};

export default LogoUpload;
