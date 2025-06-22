
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AboutImage {
  id: string;
  section_key: string;
  image_url: string;
  alt_text?: string;
  caption?: string;
  order_position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useAboutImages = (sectionKey?: string) => {
  return useQuery({
    queryKey: ['about-images', sectionKey],
    queryFn: async () => {
      let query = supabase
        .from('about_images')
        .select('*')
        .eq('is_active', true)
        .order('order_position');

      if (sectionKey) {
        query = query.eq('section_key', sectionKey);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AboutImage[];
    },
  });
};

export const useAdminAboutImages = () => {
  return useQuery({
    queryKey: ['admin-about-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_images')
        .select('*')
        .order('section_key', { ascending: true })
        .order('order_position', { ascending: true });
      
      if (error) throw error;
      return data as AboutImage[];
    },
  });
};

export const useCreateAboutImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (imageData: Omit<AboutImage, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('about_images')
        .insert({ 
          ...imageData, 
          created_by: user.user?.id 
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-images'] });
      queryClient.invalidateQueries({ queryKey: ['about-images'] });
      toast({
        title: "Success",
        description: "Image added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add image",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAboutImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<AboutImage> & { id: string }) => {
      const { error } = await supabase
        .from('about_images')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-images'] });
      queryClient.invalidateQueries({ queryKey: ['about-images'] });
      toast({
        title: "Success",
        description: "Image updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update image",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAboutImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('about_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-images'] });
      queryClient.invalidateQueries({ queryKey: ['about-images'] });
      toast({
        title: "Success",
        description: "Image removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    },
  });
};

export const useUploadAboutImage = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('about-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('about-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    },
  });
};
