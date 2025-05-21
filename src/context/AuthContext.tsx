import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { User as UserType } from "@/types";
import { toast } from "sonner";

interface AuthContextProps {
  user: UserType | null;
  session: Session | null;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserType>) => Promise<void>;
  isLoading: boolean;
  emailVerified: boolean;

  // Combined function to handle both requesting a reset and setting a new password
  resetPassword: (emailOrData: string | { email: string; token: string; newPassword: string }) => Promise<void>;
  
  // Aliases for better naming consistency
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateProfile: (data: Partial<UserType>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  validateField: (field: string, value: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
}

// Define the SignUpData type
interface SignUpData {
  email: string;
  password: string;
  username?: string;
  name?: string;
  location?: string;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const isAuthenticated = !!session;

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          // Defer Supabase call with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        // Defer Supabase call with setTimeout to prevent deadlock
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        setIsLoading(false);
        return;
      }

      if (data) {
        // Transform the data to match our UserType
        const userData: UserType = {
          id: data.id,
          username: data.username || "",
          name: data.name || "",
          email: data.email || "",
          avatar: data.avatar || "",
          bio: data.bio || "",
          location: data.location || "",
          createdAt: new Date(data.created_at),
          trustScore: data.trust_score || 5.0,
          helpOffered: data.help_offered || 0,
          helpReceived: data.help_received || 0,
          verifiedStatus: data.verified_status || false,
          emailVerified: true, // Assuming email is verified if we have a session
          loginAttempts: 0,
          lastLoginAttempt: null,
          trustBadges: data.trust_badges || [],
          volunteerHours: data.volunteer_hours || 0,
        };

        setUser(userData);
        setEmailVerified(true); // Assuming email is verified if we have a profile
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(data: SignUpData) {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            location: data.location,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Sign up successful! Please check your email for verification.");
      navigate("/login");
    } catch (error) {
      console.error("Error in signUp:", error);
      toast.error("An error occurred during sign up.");
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success("Sign in successful!");
        navigate("/");
      }
    } catch (error) {
      console.error("Error in signIn:", error);
      toast.error("An error occurred during sign in.");
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string, rememberMe = false) {
    return signIn(email, password);
  }

  async function logout() {
    return signOut();
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      navigate("/login");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  }

  // Combined function to handle both requesting a reset and setting a new password
  async function resetPassword(emailOrData: string | { email: string; token: string; newPassword: string }) {
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

  async function requestPasswordReset(email: string) {
    // Fixed: Instead of passing the email directly to resetPassword,
    // we explicitly cast it to ensure the type is correct
    return resetPassword(email as string);
  }

  async function updateUserProfile(data: Partial<UserType>) {
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

      // Refresh user data
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile");
    }
  }

  async function updateProfile(data: Partial<UserType>) {
    return updateUserProfile(data);
  }

  async function changePassword(currentPassword: string, newPassword: string) {
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

  async function deleteAccount() {
    try {
      if (!session) {
        toast.error("You must be logged in to delete your account");
        return;
      }

      // Delete the user account
      const { error } = await supabase.rpc('delete_user');
      
      if (error) {
        console.error("Error deleting account:", error);
        toast.error("Failed to delete account");
        return;
      }

      await signOut();
      toast.success("Your account has been deleted");
      navigate("/");
    } catch (error) {
      console.error("Error in deleteAccount:", error);
      toast.error("An error occurred while deleting your account");
    }
  }

  async function validateField(field: string, value: string): Promise<boolean> {
    try {
      // Field validation logic
      if (field === "username") {
        // Check if username is already taken
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", value)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error validating username:", error);
          return false;
        }
        
        return !data; // If no data, username is available
      } 
      else if (field === "email") {
        // Check if email is already taken
        const { data, error } = await supabase
          .from("profiles")
          .select("email")
          .eq("email", value)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error validating email:", error);
          return false;
        }
        
        return !data; // If no data, email is available
      }
      
      return true;
    } catch (error) {
      console.error(`Error validating ${field}:`, error);
      return false;
    }
  }

  async function sendEmailVerification() {
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
      // The token would typically be in the URL and handled by Supabase redirect
      
      // Refresh user session after verification
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        toast.error("Verification failed or session expired");
        return false;
      }
      
      // Update the user state
      setSession(data.session);
      setEmailVerified(true);
      
      if (data.session.user) {
        await fetchUserProfile(data.session.user.id);
      }
      
      toast.success("Email verified successfully");
      return true;
    } catch (error) {
      console.error("Error verifying email:", error);
      toast.error("Failed to verify email");
      return false;
    }
  }

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserProfile,
    isLoading,
    emailVerified,
    
    login,
    logout,
    isAuthenticated,
    updateProfile,
    changePassword,
    deleteAccount,
    validateField,
    requestPasswordReset,
    sendEmailVerification,
    verifyEmail
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
