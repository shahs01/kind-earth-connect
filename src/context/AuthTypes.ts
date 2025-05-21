
import { User, SignUpData, PasswordResetData } from "@/types";
import { ReactNode } from "react";
import { Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  emailVerified: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signInWithProvider: (provider: 'google') => Promise<void>;
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

export interface AuthProviderProps {
  children: ReactNode;
}
