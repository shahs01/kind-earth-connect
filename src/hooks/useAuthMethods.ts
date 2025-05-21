
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User as UserType } from "@/types";
import { validatePassword } from "@/utils/validation";

// Define the SignUpData type
export interface SignUpData {
  email: string;
  password: string;
  username?: string;
  name?: string;
  location?: string;
}

// Define the ResetPasswordData type
export interface ResetPasswordData {
  email: string;
  token: string;
  newPassword: string;
}

export function useAuthMethods() {
  const navigate = useNavigate();

  async function signUp(data: SignUpData): Promise<void> {
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
    }
  }

  async function signIn(email: string, password: string): Promise<void> {
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
    }
  }

  async function login(email: string, password: string, rememberMe = false): Promise<void> {
    return signIn(email, password);
  }

  async function signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      navigate("/login");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  }

  async function logout(): Promise<void> {
    return signOut();
  }

  return {
    signUp,
    signIn,
    signOut,
    login,
    logout,
  };
}
