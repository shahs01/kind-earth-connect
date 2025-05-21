
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface Post {
  id: string;
  title: string;
  description?: string;
  type: string;
  category?: string;
  location?: string;
  status?: string;
  created_at?: string;
  user_id: string;
  isFavorited?: boolean;
}

export interface Favorite {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  post?: Post;
}

export function useFavorites() {
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const { toast } = useToast();
  
  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          user_id,
          post_id,
          created_at,
          posts:post_id (
            id,
            title,
            description,
            type,
            category,
            location,
            status,
            created_at,
            user_id
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to flatten the posts
      const formattedFavorites = data.map((fav) => ({
        id: fav.id,
        user_id: fav.user_id,
        post_id: fav.post_id,
        created_at: fav.created_at,
        post: fav.posts as Post,
      }));
      
      setFavorites(formattedFavorites);
      return formattedFavorites;
    } catch (error: any) {
      toast({
        title: "Error fetching favorites",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const addFavorite = async (postId: string) => {
    setLoading(true);
    try {
      // Must include user_id in the insert
      const { data, error } = await supabase
        .from('favorites')
        .insert({ post_id: postId })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Added to favorites",
        description: "Post has been added to your favorites.",
      });
      
      await fetchFavorites();
      return true;
    } catch (error: any) {
      toast({
        title: "Error adding to favorites",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const removeFavorite = async (favoriteId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);
      
      if (error) throw error;
      
      toast({
        title: "Removed from favorites",
        description: "Post has been removed from your favorites.",
      });
      
      await fetchFavorites();
      return true;
    } catch (error: any) {
      toast({
        title: "Error removing from favorites",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const isFavorited = async (postId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('post_id', postId)
        .maybeSingle();
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error("Error checking if post is favorited:", error);
      return false;
    }
  };

  const getFavoriteId = async (postId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('post_id', postId)
        .maybeSingle();
      
      if (error) throw error;
      
      return data?.id || null;
    } catch (error) {
      console.error("Error getting favorite ID:", error);
      return null;
    }
  };
  
  return {
    loading,
    favorites,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorited,
    getFavoriteId
  };
}
