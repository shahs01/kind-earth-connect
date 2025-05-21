
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalHelpRequests: number;
  totalHelpOffers: number;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'user' | 'admin';
  created_at: string;
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
      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) throw usersError;
      
      // Get total posts
      const { count: totalPosts, error: postsError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
      
      if (postsError) throw postsError;
      
      // Get total help requests
      const { count: totalHelpRequests, error: requestsError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'request');
      
      if (requestsError) throw requestsError;
      
      // Get total help offers
      const { count: totalHelpOffers, error: offersError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'offer');
      
      if (offersError) throw offersError;
      
      return {
        totalUsers: totalUsers || 0,
        totalPosts: totalPosts || 0,
        totalHelpRequests: totalHelpRequests || 0,
        totalHelpOffers: totalHelpOffers || 0
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
        totalHelpOffers: 0
      };
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUsers = async (page = 1, pageSize = 10): Promise<User[]> => {
    setLoading(true);
    try {
      // Calculate the range based on page and pageSize
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match the User type
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
      // Check if user already has a role
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        
        if (error) throw error;
      }
      
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
  
  return {
    loading,
    isAdmin,
    checkIfAdmin,
    fetchStats,
    fetchUsers,
    fetchUserRoles,
    setUserRole
  };
}
