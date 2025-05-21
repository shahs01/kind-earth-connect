
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validatePassword } from "@/utils/validation";
import { ResetPasswordData } from "./useAuthMethods";
import { User as UserType } from "@/types";

export function usePasswordManagement(user: UserType | null) {
  async function resetPassword(
    emailOrData: string | ResetPasswordData
  ): Promise<void> {
    try {
      if (typeof emailOrData === 'string') {
        // This is the request password reset path
        const { error } = await supabase.auth.resetPasswordForEmail(emailOrData, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Password reset link sent to your email");
      } else {
        // This is the confirm password reset path
        const { newPassword } = emailOrData;

        // Validate password meets requirements
        if (!validatePassword(newPassword)) {
          toast.error("Password must contain at least one uppercase letter, lowercase letter, number, and special character");
          return;
        }
        
        // For password recovery, we need to set a new password
        const { error } = await supabase.auth.updateUser({ 
          password: newPassword
        });
        
        if (error) {
          toast.error(error.message);
          return;
        }
        
        toast.success("Password has been reset successfully");
      }
    } catch (error) {
      console.error("Error in resetPassword:", error);
      toast.error("An error occurred while processing your request");
    }
  }

  async function requestPasswordReset(email: string): Promise<void> {
    return resetPassword(email);
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        return;
      }

      // Update to the new password
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Error in changePassword:", error);
      toast.error("An error occurred while changing your password");
    }
  }

  return {
    resetPassword,
    requestPasswordReset,
    changePassword,
  };
}
