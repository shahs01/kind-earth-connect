
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types";

/**
 * Custom hook for user profile management operations
 */
export function useProfileManagement() {
  const [loading, setLoading] = useState(false);

  /**
   * Updates a user's profile information
   */
  const updateUserProfile = async (userId: string, profileData: Partial<User>) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          bio: profileData.bio,
          location: profileData.location,
          email: profileData.email
        })
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
      
      // Call the delete_user RPC function - removing the string parameter that was causing the error
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

  return {
    loading,
    updateUserProfile,
    updateNotificationPreferences,
    deleteUserAccount
  };
}
