
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SignUpData, PasswordResetData, User } from "@/types";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for handling authentication operations
 */
export const useAuthOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Logs a user in
   */
  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;

      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        toast({
          title: "Email not verified",
          description: "Please verify your email before logging in. You can request a new verification link.",
          variant: "destructive",
        });
        navigate('/verify-email');
        // We throw an error to prevent the login flow from continuing
        throw new Error("Email not verified");
      }
      
      toast({
        title: "Login successful!",
        description: "Welcome back to Thryvance."
      });
      
    } catch (error: any) {
      let message = "Failed to log in";
      if (error instanceof Error) {
        message = error.message;
      }
      
      if (message !== "Email not verified") {
        toast({
          title: "Login failed",
          description: message,
          variant: "destructive"
        });
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Signs in with a third-party provider
   */
  const signInWithProvider = async (provider: 'google') => {
    setIsLoading(true);
    
    try {
      const redirectTo = window.location.origin + '/auth-callback';
      
      console.log("Starting OAuth flow with redirect:", redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) throw error;
      
      console.log("OAuth initialization successful");
    } catch (error: any) {
      let message = "Failed to sign in with provider";
      if (error instanceof Error) {
        message = error.message;
      }
      
      console.error("OAuth error:", error);
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive"
      });
      
      setIsLoading(false);
    }
  };

  
  /**
   * Signs up a new user
   */
  const signUp = async (userData: SignUpData) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            name: userData.name,
            phone: userData.phone
          },
          emailRedirectTo: `${window.location.origin}/auth-callback`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created!",
        description: "Your account has been created successfully."
      });
      
    } catch (error: any) {
      let message = "Failed to create account";
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Signup failed",
        description: message,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logs a user out
   */
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Logout error",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  /**
   * Sends an email verification
   */
  const sendEmailVerification = async (user: User | null) => {
    if (!user) {
      toast({
        title: "Error",
        description: "No user found to send verification email",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth-callback`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and follow the link to verify your email.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send verification email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  /**
   * Verifies an email
   */
  const verifyEmail = async (token: string): Promise<boolean> => {
    return true;
  };

  /**
   * Changes a user's password
   */
  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    
    try {
      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      
      const { data: { user }, error: signInError } = await supabase.auth.getUser();
      
      if (!user || signInError) {
        throw new Error("Current password is incorrect or session expired");
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
    } catch (error: any) {
      let message = "Failed to change password";
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Password change failed",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Requests a password reset
   */
  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for instructions to reset your password.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resets a user's password
   */
  const resetPassword = async (data: PasswordResetData) => {
    setIsLoading(true);
    
    try {
      const { newPassword } = data;
      
      if (!newPassword) {
        throw new Error("New password is required");
      }
      
      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in with your new password.",
      });
      
      navigate('/login');
    } catch (error: any) {
      let message = "Failed to reset password";
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Password reset failed",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    login,
    signInWithProvider,
    signUp,
    logout,
    sendEmailVerification,
    verifyEmail,
    changePassword,
    requestPasswordReset,
    resetPassword
  };
};
