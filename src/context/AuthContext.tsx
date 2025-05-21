
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
  signUp: (email: string, password: string, userData: Partial<UserType>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserType>) => Promise<void>;
  isLoading: boolean;
  emailVerified: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);

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

  async function signUp(email: string, password: string, userData: Partial<UserType>) {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            location: userData.location,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success("Sign up successful! Please check your email for verification.");
        navigate("/login");
      }
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

  async function resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password reset link sent to your email");
    } catch (error) {
      console.error("Error in resetPassword:", error);
      toast.error("An error occurred while sending reset password link.");
    }
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
