import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAdminCheck } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminSession {
  id: string;
  session_token: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  ip_address?: string | null;
  user_agent?: string | null;
  user_id: string;
}

export const useAdminSecurity = () => {
  const { user } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  const { toast } = useToast();
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(false);

  // Create secure admin session
  const createAdminSession = useCallback(async () => {
    if (!user || !isAdmin) return null;

    try {
      const sessionToken = crypto.getRandomValues(new Uint8Array(32))
        .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
      
      const expiresAt = new Date(Date.now() + (2 * 60 * 60 * 1000)); // 2 hours

      const { data, error } = await supabase
        .from('admin_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          ip_address: null, // Would be set server-side in production
          user_agent: navigator.userAgent
        })
        .select()
        .single();

      if (error) throw error;

      setAdminSession(data as AdminSession);
      localStorage.setItem('admin_session_token', sessionToken);
      
      return data;
    } catch (error) {
      console.error('Failed to create admin session:', error);
      return null;
    }
  }, [user, isAdmin]);

  // Verify admin session is still valid
  const verifyAdminSession = useCallback(async () => {
    if (!user || !isAdmin) return false;

    const storedToken = localStorage.getItem('admin_session_token');
    if (!storedToken) {
      return await createAdminSession() !== null;
    }

    try {
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('session_token', storedToken)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        localStorage.removeItem('admin_session_token');
        return await createAdminSession() !== null;
      }

      // Check if session is expired
      if (new Date(data.expires_at) < new Date()) {
        await supabase
          .from('admin_sessions')
          .update({ is_active: false })
          .eq('id', data.id);
        
        localStorage.removeItem('admin_session_token');
        return await createAdminSession() !== null;
      }

      setAdminSession(data as AdminSession);
      return true;
    } catch (error) {
      console.error('Failed to verify admin session:', error);
      return false;
    }
  }, [user, isAdmin, createAdminSession]);

  // Secure admin action wrapper
  const executeAdminAction = useCallback(async (
    action: () => Promise<any>,
    actionName: string
  ) => {
    setIsVerifyingAdmin(true);
    
    try {
      const isValidSession = await verifyAdminSession();
      
      if (!isValidSession) {
        toast({
          title: "Admin verification failed",
          description: "Your admin session has expired. Please refresh and try again.",
          variant: "destructive",
        });
        return null;
      }

      const result = await action();
      
      // Log the admin action
      await supabase.rpc('log_admin_action_secure', {
        action_text: actionName,
        target_type_param: 'admin_action',
        details_param: { 
          session_id: adminSession?.id,
          timestamp: new Date().toISOString() 
        }
      });

      return result;
    } catch (error: any) {
      toast({
        title: "Admin action failed",
        description: error.message || "An error occurred while performing the admin action.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsVerifyingAdmin(false);
    }
  }, [verifyAdminSession, adminSession, toast]);

  // Invalidate admin session
  const invalidateAdminSession = useCallback(async () => {
    const storedToken = localStorage.getItem('admin_session_token');
    
    if (storedToken && adminSession) {
      try {
        await supabase
          .from('admin_sessions')
          .update({ is_active: false })
          .eq('id', adminSession.id);
      } catch (error) {
        console.error('Failed to invalidate admin session:', error);
      }
    }

    localStorage.removeItem('admin_session_token');
    setAdminSession(null);
  }, [adminSession]);

  // Initialize admin session on mount
  useEffect(() => {
    if (user && isAdmin) {
      verifyAdminSession();
    }
  }, [user, isAdmin, verifyAdminSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (adminSession) {
        invalidateAdminSession();
      }
    };
  }, []);

  return {
    adminSession,
    isVerifyingAdmin,
    executeAdminAction,
    verifyAdminSession,
    invalidateAdminSession,
    createAdminSession
  };
};