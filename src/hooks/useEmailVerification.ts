
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User as UserType } from "@/types";

export function useEmailVerification(user: UserType | null) {
  async function sendEmailVerification(): Promise<void> {
    try {
      if (!user || !user.email) {
        toast.error("No user email found");
        return;
      }
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      
      if (error) {
        toast.error(error.message);
        return;
      }
      
      toast.success("Verification email sent. Please check your inbox.");
    } catch (error) {
      console.error("Error sending email verification:", error);
      toast.error("Failed to send verification email");
    }
  }

  async function verifyEmail(token: string): Promise<boolean> {
    try {
      // In Supabase, verification happens automatically via link
      // This function would just handle post-verification actions
      
      // Refresh user session after verification
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        toast.error("Verification failed or session expired");
        return false;
      }
      
      toast.success("Email verified successfully");
      return true;
    } catch (error) {
      console.error("Error verifying email:", error);
      toast.error("Failed to verify email");
      return false;
    }
  }

  return {
    sendEmailVerification,
    verifyEmail,
  };
}
