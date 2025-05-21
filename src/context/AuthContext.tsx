
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, AuthProviderProps } from "./AuthTypes";
import { User, SignUpData } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { useAuthValidation } from "@/hooks/useAuthValidation";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);

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
    // Security fix: Set up auth state listener FIRST to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        if (session) {
          await handleSessionChange(session.user.id);
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
          await handleSessionChange(session.user.id);
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      // Security fix: Properly clean up subscription to prevent memory leaks
      subscription?.unsubscribe();
    };
  }, []);

  const handleSessionChange = async (userId: string) => {
    try {
      const profile = await fetchUserProfile(userId);
      setUser(profile);
      // For both email/password and OAuth logins, we set emailVerified to true
      // For OAuth providers like Google, email is already verified by the provider
      setEmailVerified(true);
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
    isLoading: isLoading || authOpLoading,
    isAuthenticated: !!user,
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
