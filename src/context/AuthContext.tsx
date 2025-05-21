
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User, SignUpData, AuthValidationErrors, PasswordResetData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateUsername, validateEmail } from "@/utils/validation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  emailVerified: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  logout: () => void;
  sendEmailVerification: () => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (data: PasswordResetData) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  validateField: (field: string, value: string) => Promise<string | null>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        if (session) {
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setEmailVerified(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
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
          loginAttempts: 0, // Adding missing properties
          lastLoginAttempt: null // Adding missing properties
        };

        setUser(userProfile);
        setEmailVerified(true);
        console.log("User profile loaded:", userProfile);
      } else {
        console.log("No user profile found for ID:", userId);
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Login successful!",
        description: "Welcome back to Thryvance."
      });
      
      navigate('/profile');
    } catch (error: any) {
      let message = "Failed to log in";
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: SignUpData) => {
    setIsLoading(true);
    
    try {
      // Check username uniqueness
      const usernameError = await validateField("username", userData.username);
      if (usernameError) {
        throw new Error(usernameError);
      }
      
      // Sign up the user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            name: userData.name,
            location: userData.location
          }
        }
      });
      
      if (error) throw error;

      // The user is created but may need to verify email
      setEmailVerified(false);
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account."
      });
      
      // Redirect to verification page
      navigate('/verify-email');
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

  const sendEmailVerification = async () => {
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
        email: user.email
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

  const verifyEmail = async (token: string): Promise<boolean> => {
    // For Supabase, email verification is handled by their email flow
    // This method is kept for compatibility with the existing interfaces
    return true;
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Logout error",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
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
      
      // Update profile in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          username: userData.username || user.username,
          name: userData.name || user.name,
          bio: userData.bio,
          location: userData.location,
          avatar: userData.avatar
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local user state
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
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

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    
    try {
      // Verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });
      
      if (signInError) {
        throw new Error("Current password is incorrect");
      }
      
      // Update password
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

  const resetPassword = async (data: PasswordResetData) => {
    setIsLoading(true);
    
    try {
      const { newPassword } = data;
      
      if (!newPassword) {
        throw new Error("New password is required");
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

  const deleteAccount = async () => {
    if (!user) {
      throw new Error("No user logged in");
    }
    
    setIsLoading(true);
    
    try {
      // Call the delete_user RPC function without parameters
      // The RPC function will use the authenticated user's session
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
    } finally {
      setIsLoading(false);
    }
  };

  const validateField = async (field: string, value: string): Promise<string | null> => {
    switch (field) {
      case 'username':
        if (!value) return "Username is required";
        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(value)) {
          return "Username must be 3-20 characters and contain only letters, numbers, dashes (-) and underscores (_)";
        }
        
        // Check if username is taken
        const { data: usernameData, error: usernameError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', value)
          .maybeSingle();
        
        if (usernameError) {
          console.error("Error checking username:", usernameError);
          return "Error validating username";
        }
        
        if (usernameData && (!user || usernameData.id !== user.id)) {
          return "Username is already taken";
        }
        
        return null;
        
      case 'email':
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address";
        }
        
        // We can't directly check if an email is taken in Supabase
        // The signUp function will handle this validation
        return null;
        
      case 'password':
        if (!value) return "Password is required";
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/.test(value)) {
          return "Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, one number, and one special character";
        }
        return null;
        
      default:
        return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        emailVerified,
        login,
        signUp,
        logout,
        sendEmailVerification,
        verifyEmail,
        updateProfile,
        changePassword,
        resetPassword,
        requestPasswordReset,
        deleteAccount,
        validateField,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
