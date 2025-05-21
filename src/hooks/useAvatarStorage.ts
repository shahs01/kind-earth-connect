
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAvatarStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  /**
   * Upload an avatar image to Supabase storage
   */
  const uploadAvatar = async (
    file: File, 
    userId: string
  ): Promise<{ url: string } | null> => {
    try {
      setIsUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      const { data, error } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(data.path);

      return { url: publicUrlData.publicUrl };
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your avatar.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Remove an avatar from storage
   */
  const removeAvatar = async (
    avatarUrl: string
  ): Promise<boolean> => {
    try {
      setIsUploading(true);
      
      // Extract the file name from the URL
      const fileName = avatarUrl.split('/').pop();
      
      if (!fileName) return false;
      
      const { error } = await supabase
        .storage
        .from('avatars')
        .remove([fileName]);
        
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was a problem removing your avatar.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadAvatar,
    removeAvatar
  };
};
