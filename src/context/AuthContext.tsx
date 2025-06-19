
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
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
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

  // Initialize auth state on app start
  useEffect(() => {
    console.log("AuthContext: Initializing authentication state");
    
    const initAuth = async () => {
      try {
        // Set up auth state change listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("AuthContext: Auth state changed", event, newSession?.user?.email || 'no user');
            
            setSession(newSession);
            setEmailVerified(!!newSession?.user?.email_confirmed_at);
            
            if (newSession?.user) {
              // Fetch user profile after session is established
              try {
                const profile = await fetchUserProfile(newSession.user.id);
                if (profile) {
                  console.log("AuthContext: Profile loaded", profile);
                  setUser(profile);
                } else {
                  console.log("AuthContext: No profile found for user");
                  setUser(null);
                }
              } catch (error) {
                console.error("AuthContext: Error fetching user profile:", error);
                setUser(null);
              }
            } else {
              setUser(null);
            }
            
            // Always set loading to false after handling auth state change
            setIsLoading(false);
          }
        );

        // Get current session after setting up listener
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthContext: Error getting session:", error);
          setIsLoading(false);
        } else {
          console.log("AuthContext: Initial session check", currentSession?.user?.email || 'no session');
          
          if (currentSession) {
            // Session exists, the onAuthStateChange will handle the rest
            setSession(currentSession);
            setEmailVerified(!!currentSession.user?.email_confirmed_at);
          } else {
            // No session, clear everything and stop loading
            setSession(null);
            setUser(null);
            setIsLoading(false);
          }
        }

        setIsInitialized(true);

        // Cleanup function
        return () => {
          console.log("AuthContext: Unsubscribing from auth state changes");
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error("AuthContext: Error during initialization:", error);
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    const cleanup = initAuth();
    
    // Return cleanup function
    return () => {
      if (cleanup instanceof Promise) {
        cleanup.then(cleanupFn => cleanupFn?.());
      }
    };
  }, [fetchUserProfile]);

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
    isAuthenticated: !!session, // Simple check - if we have a session, user is authenticated
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
