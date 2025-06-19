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
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
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
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("AuthContext: Auth state changed", event, newSession?.user?.email || 'no session');
            
            setSession(newSession);
            setEmailVerified(!!newSession?.user?.email_confirmed_at);
            
            if (!newSession) {
              setUser(null);
              setIsLoading(false);
            }
            
            // Mark auth as initialized after first state change
            if (!authInitialized) {
              setAuthInitialized(true);
            }
          }
        );

        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthContext: Error getting session:", error);
        } else {
          console.log("AuthContext: Initial session check", currentSession?.user?.email || 'no session');
          
          if (currentSession) {
            setSession(currentSession);
            setEmailVerified(!!currentSession.user?.email_confirmed_at);
          } else {
            setSession(null);
            setUser(null);
            setIsLoading(false);
          }
        }
        
        setAuthInitialized(true);
        
        // Store subscription for cleanup
        return subscription;
      } catch (error) {
        console.error("AuthContext: Error during initialization:", error);
        setIsLoading(false);
        setAuthInitialized(true);
      }
    };

    const subscription = initAuth();
    
    return () => {
      subscription?.then(sub => sub?.unsubscribe());
    };
  }, []);

  // Handle user profile fetching when session changes
  useEffect(() => {
    if (!authInitialized) return;
    
    if (!session) {
      console.log("AuthContext: No session, clearing user data.");
      setUser(null);
      setIsLoading(false);
      return;
    }

    // If we already have the user for this session, don't refetch
    if (user && user.id === session.user.id) {
      setIsLoading(false);
      return;
    }

    // Fetch user profile
    console.log(`AuthContext: Session found for ${session.user.email}, fetching profile.`);
    
    const fetchProfile = async () => {
      try {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          console.log("AuthContext: Profile found", profile);
          setUser(profile);
        } else {
          console.log("AuthContext: No profile found, retrying after delay...");
          // Retry after a short delay
          setTimeout(async () => {
            try {
              const retryProfile = await fetchUserProfile(session.user.id);
              if (retryProfile) {
                console.log("AuthContext: Profile found on retry", retryProfile);
                setUser(retryProfile);
              } else {
                console.error("AuthContext: Failed to create or fetch user profile after retry.");
                // Don't logout automatically - let user stay authenticated but without profile
                setUser(null);
              }
            } catch (retryError) {
              console.error("AuthContext: Error on profile retry:", retryError);
              setUser(null);
            } finally {
              setIsLoading(false);
            }
          }, 1500);
          return; // Don't set loading to false yet
        }
      } catch (error) {
        console.error("AuthContext: Error fetching user profile:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session, authInitialized, fetchUserProfile]);

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
    isAuthenticated: !!session && authInitialized, // Only authenticated when we have session AND auth is initialized
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
