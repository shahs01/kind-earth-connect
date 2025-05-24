
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
    let mounted = true;
    
    console.log("AuthContext: Initializing authentication");
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting initial session:", error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        if (session && mounted) {
          console.log("Initial session found for:", session.user.email);
          setSession(session);
          await handleSessionUser(session.user.id);
        } else {
          console.log("No initial session found");
          if (mounted) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, session?.user?.email || 'no user');
        
        setSession(session);
        
        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in, fetching profile");
          await handleSessionUser(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out, clearing state");
          setUser(null);
          setEmailVerified(false);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log("Token refreshed");
          // Don't refetch profile on token refresh, just update session
          setIsLoading(false);
        } else if (session) {
          await handleSessionUser(session.user.id);
        } else {
          setUser(null);
          setEmailVerified(false);
          setIsLoading(false);
        }
      }
    );

    // Initialize session
    getInitialSession();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleSessionUser = async (userId: string) => {
    try {
      // Only fetch profile if we don't have user data or user ID changed
      if (!user || user.id !== userId) {
        const profile = await fetchUserProfile(userId);
        if (profile) {
          setUser(profile);
          setEmailVerified(true);
        } else {
          console.log("No profile found, creating one");
          // Wait a moment for profile creation trigger
          setTimeout(async () => {
            const retryProfile = await fetchUserProfile(userId);
            if (retryProfile) {
              setUser(retryProfile);
              setEmailVerified(true);
            } else {
              console.error("Failed to create or fetch user profile");
              logout();
            }
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error handling session user:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailVerification = async () => {
    await sendVerificationEmail(user);
  };

  const handleLogin = async (email: string, password: string, rememberMe = false) => {
    await login(email, password, rememberMe);
  };

  const handleSignInWithProvider = async (provider: 'google') => {
    await signInWithProvider(provider);
  };

  const handleSignUp = async (userData: SignUpData) => {
    // Check username uniqueness
    const usernameError = await validateField("username", userData.username);
    if (usernameError) {
      throw new Error(usernameError);
    }
    
    await signUp(userData);
    setEmailVerified(true);
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
