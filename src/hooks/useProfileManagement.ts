
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

// Define interface for the post object to include all possible properties
interface PostData {
  title: string;
  description: string;
  category: string;
  location: string;
  type: "offer" | "request";
  user_id: string;
  created_at: string;
  status: string;
  availability?: string;
  timeframe?: string;
}

export const useProfileManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch user's posts
  const fetchUserPosts = async (userId: string) => {
    try {
      setIsLoading(true);
      console.log("Fetching posts for user ID:", userId);
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching user posts:", error);
        throw error;
      }
      
      console.log("Fetched posts:", data);
      return data || [];
    } catch (error: any) {
      console.error("Error in fetchUserPosts:", error);
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

  // Create a post
  const createPost = async (postData: any) => {
    try {
      setIsLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("You must be logged in to create a post");
      }
      
      // Map the form data to the database columns
      const post: PostData = {
        title: postData.title,
        description: postData.description,
        category: postData.category,
        location: postData.location,
        type: postData.type,
        user_id: userData.user.id,
        created_at: new Date().toISOString(),
        status: 'active'
      };
      
      // Add type-specific fields
      if (postData.type === 'offer') {
        post.availability = postData.availability;
      } else if (postData.type === 'request') {
        post.timeframe = postData.timeframe;
      }
      
      console.log("Creating post with data:", post);
      
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single();

      if (error) {
        console.error("Error creating post:", error);
        throw error;
      }

      toast({
        title: "Post created",
        description: "Your post has been successfully created",
      });

      return data;
    } catch (error: any) {
      console.error("Error in createPost:", error.message);
      toast({
        title: "Error creating post",
        description: error.message || "Could not create your post",
        variant: "destructive"
      });
      return null;
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
    createPost,
    deletePost
  };
};
