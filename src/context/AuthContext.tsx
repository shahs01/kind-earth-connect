
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, AuthProviderProps } from "./AuthTypes";
import { User, SignUpData } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { useAuthValidation } from "@/hooks/useAuthValidation";
import { Session } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const { toast } = useToast();

  const { fetchUserProfile, updateProfile, deleteAccount: deleteUserAccount } = useAuthProfile();
  const { 
    isLoading: authOpLoading, 
    login, 
    signInWithProvider,
    signUp, 
    logout, 
    sendEmailVerification: sendVerificationEmail, 
    verifyEmail, 
    changePassword, 
    requestPasswordReset, 
    resetPassword 
  } = useAuthOperations();
  const { validateField } = useAuthValidation(user);

  useEffect(() => {
    console.log("AuthContext: Setting up auth state listener");
    
    // Set up auth state listener FIRST to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email || 'no user');
        
        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in, fetching profile");
          setSession(session);
          await handleSessionChange(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out, clearing state");
          setUser(null);
          setSession(null);
          setEmailVerified(false);
          // Clear any stored session debug info
          localStorage.removeItem('supabase_session_debug');
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log("Token refreshed, updating session");
          setSession(session);
        } else if (session) {
          setSession(session);
          await handleSessionChange(session.user.id);
        } else {
          setUser(null);
          setSession(null);
          setEmailVerified(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        console.log("AuthContext: Checking for existing session");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
        } else if (session?.user) {
          console.log("Found existing session for:", session.user.email);
          setSession(session);
          await handleSessionChange(session.user.id);
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log("AuthContext: Cleaning up auth listener");
      subscription?.unsubscribe();
    };
  }, []);

  const handleSessionChange = async (userId: string) => {
    try {
      const profile = await fetchUserProfile(userId);
      if (profile) {
        setUser(profile);
        // For both email/password and OAuth logins, we set emailVerified to true
        // For OAuth providers like Google, email is already verified by the provider
        setEmailVerified(true);
      } else {
        // If no profile found but we have a session, create a profile
        console.log("No profile found for user, attempting to create one");
        toast({
          title: "Profile not found",
          description: "We're setting up your profile now",
        });
        // The profile will be created via database trigger when authentication happens
        // Re-fetch the profile after a short delay
        setTimeout(async () => {
          const retryProfile = await fetchUserProfile(userId);
          if (retryProfile) {
            setUser(retryProfile);
            setEmailVerified(true);
          } else {
            console.error("Failed to create or fetch user profile");
            logout();
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error handling session change:", error);
      // If there's an error fetching the profile, we'll sign the user out
      logout();
    }
  };

  const sendEmailVerification = async () => {
    await sendVerificationEmail(user);
  };

  const handleLogin = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      await login(email, password, rememberMe);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInWithProvider = async (provider: 'google') => {
    setIsLoading(true);
    try {
      await signInWithProvider(provider);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (userData: SignUpData) => {
    setIsLoading(true);
    try {
      // Check username uniqueness
      const usernameError = await validateField("username", userData.username);
      if (usernameError) {
        throw new Error(usernameError);
      }
      
      await signUp(userData);
      // Since email verification is disabled, we can set this to true
      setEmailVerified(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) {
      throw new Error("No user email found");
    }
    
    await changePassword(currentPassword, newPassword);
  };

  const contextValue: AuthContextType = {
    user,
    session,
    isLoading: isLoading || authOpLoading,
    isAuthenticated: !!user && !!session,
    emailVerified,
    login: handleLogin,
    signInWithProvider: handleSignInWithProvider,
    signUp: handleSignUp,
    logout,
    sendEmailVerification,
    verifyEmail,
    updateProfile: (userData) => updateProfile(user, userData),
    changePassword: handleChangePassword,
    resetPassword,
    requestPasswordReset,
    deleteAccount: deleteUserAccount,
    validateField,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
