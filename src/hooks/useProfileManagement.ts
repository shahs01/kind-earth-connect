
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { toast } from 'sonner';

export const useProfileManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (userId: string, userData: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', userId);
      
      if (updateError) {
        throw updateError;
      }
      
      toast.success('Profile updated successfully');
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      toast.error('Failed to update profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const validateUsername = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return !data; // Returns true if username is available
    } catch (err) {
      console.error('Error validating username:', err);
      return false;
    }
  };

  const validateEmail = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return !data; // Returns true if email is available
    } catch (err) {
      console.error('Error validating email:', err);
      return false;
    }
  };

  const deleteAccount = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fixed: Removing the string parameter that was causing the error
      // The RPC function is defined to not accept parameters
      const { error: deleteError } = await supabase.rpc('delete_user');
      
      if (deleteError) {
        throw deleteError;
      }
      
      toast.success('Account deleted successfully');
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      toast.error('Failed to delete account');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const validateField = async (field: string, value: string) => {
    if (field === 'username') {
      return validateUsername(value);
    } else if (field === 'email') {
      return validateEmail(value);
    }
    return true;
  };

  return {
    isLoading,
    error,
    updateProfile,
    validateUsername,
    validateEmail,
    validateField,
    deleteAccount,
  };
};
