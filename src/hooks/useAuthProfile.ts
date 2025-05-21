import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

/**
 * Hook for handling user profile operations
 */
export const useAuthProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Fetches a user's profile from Supabase
   */
  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        const userProfile: User = {
          id: userId,
          email: data.email || '',
          username: data.username || '',
          name: data.name || '',
          avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || '')}`,
          bio: data.bio || '',
          location: data.location || '',
          trustScore: data.trust_score || 5.0,
          helpOffered: data.help_offered || 0,
          helpReceived: data.help_received || 0,
          volunteerHours: data.volunteer_hours || 0,
          createdAt: data.created_at ? new Date(data.created_at) : new Date(),
          verifiedStatus: data.verified_status || false,
          emailVerified: true, // If we have a Supabase session, the email is verified
          trustBadges: data.trust_badges || [],
          loginAttempts: 0,
          lastLoginAttempt: null
        };

        console.log("User profile loaded:", userProfile);
        return userProfile;
      }
      
      console.log("No user profile found for ID:", userId);
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  /**
   * Updates a user's profile
   */
  const updateProfile = async (user: User | null, userData: Partial<User>): Promise<void> => {
    if (!user) {
      throw new Error("No user logged in");
    }
    
    setIsLoading(true);
    
    try {
      // Check username uniqueness if being updated
      if (userData.username && userData.username !== user.username) {
        const { data: existingUsers } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', userData.username)
          .neq('id', user.id);
        
        if (existingUsers && existingUsers.length > 0) {
          throw new Error("Username is already taken");
        }
      }
      
      // Check if email is being updated
      let emailVerificationRequired = false;
      if (userData.email && userData.email !== user.email) {
        // Update email in auth.users
        const { error: updateAuthError } = await supabase.auth.updateUser({
          email: userData.email
        });
        
        if (updateAuthError) throw updateAuthError;
        
        emailVerificationRequired = true;
      }
      
      // Prepare update data
      const updateData: any = {};
      
      // Only include fields that are explicitly provided
      if (userData.username !== undefined) updateData.username = userData.username;
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.bio !== undefined) updateData.bio = userData.bio;
      if (userData.location !== undefined) updateData.location = userData.location;
      if (userData.avatar !== undefined) updateData.avatar = userData.avatar;
      
      // Update profile in profiles table
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: emailVerificationRequired
          ? "Your profile has been updated. Please verify your new email address."
          : "Your profile has been updated successfully.",
      });
      
      if (emailVerificationRequired) {
        navigate('/verify-email');
      }
    } catch (error: any) {
      let message = "Failed to update profile";
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deletes a user account
   */
  const deleteAccount = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Call the delete_user RPC function without any parameters
      const { error } = await supabase.rpc('delete_user');
      
      if (error) throw error;
      
      await supabase.auth.signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    fetchUserProfile,
    updateProfile,
    deleteAccount
  };
};
