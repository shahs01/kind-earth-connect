
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { useToast } from "./use-toast";

export const useProfileManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch user's posts
  const fetchUserPosts = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: "Error fetching posts",
        description: error.message || "Could not load your posts",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a post
  const deletePost = async (postId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting post",
        description: error.message || "Could not delete your post",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    fetchUserPosts,
    deletePost
  };
};
