
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

/**
 * Custom hook for user profile management operations
 */
export function useProfileManagement() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Updates a user's profile information
   */
  const updateUserProfile = async (userId: string, profileData: Partial<User>) => {
    try {
      setLoading(true);
      
      // Prepare update data
      const updateData: any = {};
      
      // Only include fields that are explicitly provided
      if (profileData.name !== undefined) updateData.name = profileData.name;
      if (profileData.bio !== undefined) updateData.bio = profileData.bio;
      if (profileData.location !== undefined) updateData.location = profileData.location;
      if (profileData.email !== undefined) updateData.email = profileData.email;
      if (profileData.avatar !== undefined) updateData.avatar = profileData.avatar;
      if (profileData.username !== undefined) updateData.username = profileData.username;
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates notification preferences for a user
   */
  const updateNotificationPreferences = async (
    userId: string, 
    preferences: { 
      emailUpdates?: boolean; 
      messageNotifications?: boolean; 
      helpRequestAlerts?: boolean;
      marketingEmails?: boolean;
    }
  ) => {
    try {
      setLoading(true);
      
      // In a real implementation, this would update a notifications table
      // For now, we'll just simulate success
      
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been updated."
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating preferences",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes a user account
   */
  const deleteUserAccount = async (userId: string) => {
    try {
      setLoading(true);
      
      // Call the delete_user RPC function without any parameters
      const { error } = await supabase.rpc('delete_user');
      
      if (error) throw error;
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted."
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting account",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Adds a post to favorites
   */
  const addToFavorites = async (postId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('favorites')
        .insert({ post_id: postId });
      
      if (error) throw error;
      
      toast({
        title: "Added to favorites",
        description: "The post has been added to your favorites."
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error adding to favorites",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Removes a post from favorites
   */
  const removeFromFavorites = async (postId: string) => {
    try {
      setLoading(true);
      
      // First, find the favorite id
      const { data: favorite, error: findError } = await supabase
        .from('favorites')
        .select('id')
        .eq('post_id', postId)
        .single();
      
      if (findError) throw findError;
      
      if (favorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', favorite.id);
        
        if (error) throw error;
        
        toast({
          title: "Removed from favorites",
          description: "The post has been removed from your favorites."
        });
      }
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error removing from favorites",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateUserProfile,
    updateNotificationPreferences,
    deleteAccount: deleteUserAccount,
    addToFavorites,
    removeFromFavorites
  };
}
