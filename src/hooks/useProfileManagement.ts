
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User as UserType } from "@/types";

export function useProfileManagement(user: UserType | null) {
  async function updateUserProfile(data: Partial<UserType>): Promise<void> {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: data.name,
          bio: data.bio,
          location: data.location,
          avatar: data.avatar,
        })
        .eq("id", user.id);

      if (error) {
        toast.error("Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile");
    }
  }

  async function updateProfile(data: Partial<UserType>): Promise<void> {
    return updateUserProfile(data);
  }

  async function validateField(field: string, value: string): Promise<boolean> {
    try {
      if (field === "username") {
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", value)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error validating username:", error);
          return false;
        }

        return !data; // Username is available if no data returned
      }

      if (field === "email") {
        const { data, error } = await supabase
          .from("profiles")
          .select("email")
          .eq("email", value)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error validating email:", error);
          return false;
        }

        return !data; // Email is available if no data returned
      }

      return true;
    } catch (error) {
      console.error(`Error validating ${field}:`, error);
      return false;
    }
  }

  async function deleteAccount(): Promise<void> {
    try {
      // We're calling the Supabase RPC function without parameters as it expects none
      const { error } = await supabase.rpc("delete_user");

      if (error) {
        console.error("Error deleting account:", error);
        toast.error("Failed to delete account");
        return;
      }

      toast.success("Your account has been deleted");
    } catch (error) {
      console.error("Error in deleteAccount:", error);
      toast.error("An error occurred while deleting your account");
    }
  }

  return {
    updateUserProfile,
    updateProfile,
    validateField,
    deleteAccount,
  };
}
