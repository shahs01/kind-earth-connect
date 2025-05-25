
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalHelpRequests: number;
  totalHelpOffers: number;
  activeUsers: number;
  activePosts: number;
  totalMessages: number;
  usersThisMonth: number;
  postsThisMonth: number;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: string;
  target_id?: string;
  details?: any;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  updated_by?: string;
  updated_at: string;
}

export function useAdmin() {
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  
  const checkIfAdmin = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) throw error;
      
      setIsAdmin(data || false);
      return data;
    } catch (error: any) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };
  
  const fetchStats = async (): Promise<AdminStats> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_platform_stats');
      
      if (error) throw error;
      
      return {
        totalUsers: data.total_users || 0,
        activePosts: data.active_posts || 0,
        activeUsers: data.active_users || 0,
        totalPosts: data.total_posts || 0,
        totalHelpRequests: data.total_help_requests || 0,
        totalHelpOffers: data.total_help_offers || 0,
        totalMessages: data.total_messages || 0,
        usersThisMonth: data.users_this_month || 0,
        postsThisMonth: data.posts_this_month || 0
      };
    } catch (error: any) {
      toast({
        title: "Error fetching admin stats",
        description: error.message,
        variant: "destructive",
      });
      return {
        totalUsers: 0,
        totalPosts: 0,
        totalHelpRequests: 0,
        totalHelpOffers: 0,
        activeUsers: 0,
        activePosts: 0,
        totalMessages: 0,
        usersThisMonth: 0,
        postsThisMonth: 0
      };
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUsers = async (page = 1, pageSize = 10): Promise<User[]> => {
    setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(profile => ({
        id: profile.id,
        username: profile.username || '',
        email: profile.email || '',
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || '')}`,
        trustScore: profile.trust_score || 0,
        helpOffered: profile.help_offered || 0,
        helpReceived: profile.help_received || 0,
        volunteerHours: profile.volunteer_hours || 0,
        createdAt: new Date(profile.created_at || Date.now()),
        verifiedStatus: profile.verified_status || false,
        emailVerified: true,
        trustBadges: profile.trust_badges || [],
        loginAttempts: 0,
        lastLoginAttempt: null
      }));
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserRoles = async (): Promise<UserRole[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');
      
      if (error) throw error;
      
      return data as UserRole[];
    } catch (error: any) {
      toast({
        title: "Error fetching user roles",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const setUserRole = async (userId: string, role: 'user' | 'admin') => {
    setLoading(true);
    try {
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingRole) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        
        if (error) throw error;
      }
      
      // Log the action
      await supabase.rpc('log_admin_action', {
        action_text: `Changed user role to ${role}`,
        target_type_param: 'user',
        target_id_param: userId,
        details_param: { new_role: role, old_role: existingRole?.role || 'user' }
      });
      
      toast({
        title: "Role updated",
        description: `User role set to ${role}`,
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'banned' | 'suspended') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: status })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Log the action
      await supabase.rpc('log_admin_action', {
        action_text: `Changed user status to ${status}`,
        target_type_param: 'user',
        target_id_param: userId,
        details_param: { new_status: status }
      });
      
      toast({
        title: "User status updated",
        description: `User account ${status}`,
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating user status",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteSettings = async (): Promise<SiteSetting[]> => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key');
      
      if (error) throw error;
      
      return data as SiteSetting[];
    } catch (error: any) {
      toast({
        title: "Error fetching site settings",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const updateSiteSetting = async (key: string, value: any, description?: string) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key,
          value,
          description,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Log the action
      await supabase.rpc('log_admin_action', {
        action_text: `Updated site setting: ${key}`,
        target_type_param: 'setting',
        target_id_param: key,
        details_param: { new_value: value, description }
      });
      
      toast({
        title: "Setting updated",
        description: `${key} has been updated`,
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating setting",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const fetchAuditLogs = async (page = 1, pageSize = 20): Promise<AuditLog[]> => {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as AuditLog[];
    } catch (error: any) {
      toast({
        title: "Error fetching audit logs",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };
  
  return {
    loading,
    isAdmin,
    checkIfAdmin,
    fetchStats,
    fetchUsers,
    fetchUserRoles,
    setUserRole,
    updateUserStatus,
    fetchSiteSettings,
    updateSiteSetting,
    fetchAuditLogs
  };
}
