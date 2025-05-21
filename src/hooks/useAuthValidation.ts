
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

/**
 * Hook for handling authentication field validations
 */
export const useAuthValidation = (user: User | null) => {
  /**
   * Validates a field for authentication forms
   */
  const validateField = async (field: string, value: string): Promise<string | null> => {
    switch (field) {
      case 'username':
        if (!value) return "Username is required";
        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(value)) {
          return "Username must be 3-20 characters and contain only letters, numbers, dashes (-) and underscores (_)";
        }
        
        // Check if username is taken
        const { data: usernameData, error: usernameError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', value)
          .maybeSingle();
        
        if (usernameError) {
          console.error("Error checking username:", usernameError);
          return "Error validating username";
        }
        
        if (usernameData && (!user || usernameData.id !== user.id)) {
          return "Username is already taken";
        }
        
        return null;
        
      case 'email':
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address";
        }
        
        // We can't directly check if an email is taken in Supabase
        // The signUp function will handle this validation
        return null;
        
      case 'password':
        if (!value) return "Password is required";
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/.test(value)) {
          return "Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, one number, and one special character";
        }
        return null;
        
      default:
        return null;
    }
  };

  return { validateField };
};
