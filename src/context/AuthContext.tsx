import { createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { User as UserType } from "@/types";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthMethods } from "@/hooks/useAuthMethods";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { usePasswordManagement, ResetPasswordData } from "@/hooks/usePasswordManagement";
import { useEmailVerification } from "@/hooks/useEmailVerification";

interface AuthContextProps {
  user: UserType | null;
  session: Session | null;
  signUp: (data: import("@/types").SignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserType>) => Promise<void>;
  isLoading: boolean;
  emailVerified: boolean;
  resetPassword: (emailOrData: string | ResetPasswordData) => Promise<void>;
  
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

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, session, isLoading, emailVerified } = useAuthState();
  const { signUp, signIn, signOut, login, logout } = useAuthMethods();
  const { updateUserProfile, updateProfile, validateField, deleteAccount } = useProfileManagement(user);
  const { resetPassword, requestPasswordReset, changePassword } = usePasswordManagement(user);
  const { sendEmailVerification, verifyEmail } = useEmailVerification(user);
  
  const isAuthenticated = !!session;

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
