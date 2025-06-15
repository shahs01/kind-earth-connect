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
    console.log("AuthContext: Subscribing to auth state changes");
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      console.log("AuthContext: Initial session loaded", session?.user?.email || 'no session');
      if (!session) {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("AuthContext: Auth state changed", _event, session?.user?.email || 'no user');
        setSession(session);
      }
    );

    return () => {
      console.log("AuthContext: Unsubscribing from auth state changes");
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      if (!user || user.id !== session.user.id) {
        setIsLoading(true);
        console.log(`AuthContext: Session found for ${session.user.email}, fetching profile.`);
        fetchUserProfile(session.user.id)
          .then(profile => {
            if (profile) {
              console.log("AuthContext: Profile found", profile);
              setUser(profile);
              setEmailVerified(true);
            } else {
              console.log("AuthContext: No profile found, retrying after delay...");
              setTimeout(() => {
                fetchUserProfile(session.user.id).then(retryProfile => {
                  if (retryProfile) {
                    console.log("AuthContext: Profile found on retry", retryProfile);
                    setUser(retryProfile);
                    setEmailVerified(true);
                  } else {
                    console.error("AuthContext: Failed to create or fetch user profile after retry.");
                    logout();
                  }
                });
              }, 1500);
            }
          })
          .catch(error => {
            console.error("AuthContext: Error fetching user profile:", error);
            logout();
          })
          .finally(() => {
            setIsLoading(false);
            console.log("AuthContext: Finished profile fetch, loading complete.");
          });
      } else {
        setIsLoading(false);
      }
    } else {
      console.log("AuthContext: No session, clearing user data.");
      setUser(null);
      setEmailVerified(false);
      setIsLoading(false);
    }
  }, [session, user, fetchUserProfile, logout]);


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
