import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ImpactMetric, ImpactPhoto, CoveredLocation } from "@/hooks/useImpact";
import type { User, Post } from "@/types/index";

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

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio?: string;
  photo_url?: string;
  linkedin_url?: string;
  order_position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface SiteContentItem {
  id: string;
  section_key: string;
  title?: string;
  content?: string;
  updated_at: string;
  updated_by?: string;
}

// --- Queries ---

export const useAdminCheck = () => {
  return useQuery({
    queryKey: ['adminCheck'],
    queryFn: async () => {
      try {
        // First check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.log("Admin check: No session found");
          return false;
        }

        console.log("Admin check: Checking for user", session.user.id);

        // Try the RPC function first
        const { data: rpcResult, error: rpcError } = await supabase.rpc('is_admin');
        
        if (!rpcError && rpcResult !== null) {
          console.log("Admin check via RPC:", rpcResult);
          return rpcResult;
        }

        console.log("RPC failed, checking user_roles table directly:", rpcError);

        // Fallback: Check user_roles table directly
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (roleError) {
          console.error("Error checking user roles:", roleError);
          return false;
        }

        const isAdmin = roleData?.role === 'admin';
        console.log("Admin check via user_roles table:", isAdmin);
        return isAdmin;
      } catch (error) {
        console.error("Admin check error:", error);
        return false;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useAdminStats = () => {
  return useQuery<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_platform_stats');
      if (error) throw error;
      const statsData = data as any;
      return {
        totalUsers: statsData.total_users || 0,
        activePosts: statsData.active_posts || 0,
        activeUsers: statsData.active_users || 0,
        totalPosts: statsData.total_posts || 0,
        totalHelpRequests: statsData.total_help_requests || 0,
        totalHelpOffers: statsData.total_help_offers || 0,
        totalMessages: statsData.total_messages || 0,
        usersThisMonth: statsData.users_this_month || 0,
        postsThisMonth: statsData.posts_this_month || 0
      };
    },
  });
};

export const useAdminUsers = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: ['adminUsers', page, pageSize],
    queryFn: async () => {
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
        name: profile.name || '',
        email: profile.email || '',
        avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || '')}`,
        bio: profile.bio || '',
        location: profile.location || '',
        createdAt: new Date(profile.created_at || Date.now()),
        trustScore: profile.trust_score || 0,
        helpOffered: profile.help_offered || 0,
        helpReceived: profile.help_received || 0,
        verifiedStatus: profile.verified_status || false,
        emailVerified: false, // not in profiles table
        loginAttempts: 0, // not in profiles table
        lastLoginAttempt: null, // not in profiles table
        trustBadges: profile.trust_badges || [],
        volunteerHours: profile.volunteer_hours || 0,
        reviewsGiven: [],
        notificationPreferences: { emailUpdates: true, messageNotifications: true, helpRequestAlerts: true, marketingEmails: false },
        account_status: profile.account_status || 'active',
      })) as (User & { account_status?: string })[];
    },
  });
};

export const useAdminUserRoles = () => {
  return useQuery({
    queryKey: ['adminUserRoles'],
    queryFn: async (): Promise<UserRole[]> => {
      const { data, error } = await supabase.from('user_roles').select('*');
      if (error) throw error;
      return data as UserRole[];
    },
  });
};

export const useAdminPosts = () => {
    return useQuery({
        queryKey: ['adminPosts'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('posts')
                .select(`*, profiles(username, name, avatar)`)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching admin posts:", error);
                throw error;
            }

            return data?.map((post: any) => ({
                ...post,
                createdAt: new Date(post.created_at),
                user: post.profiles || { username: 'unknown', name: 'Unknown User', avatar: '' }
            })) as Post[];
        }
    })
};

export const useAdminAuditLogs = (page: number, pageSize: number) => {
  return useQuery({
    queryKey: ['adminAuditLogs', page, pageSize],
    queryFn: async (): Promise<AuditLog[]> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AuditLog[];
    },
  });
};

export const useAdminSiteSettings = () => {
  return useQuery({
    queryKey: ['adminSiteSettings'],
    queryFn: async (): Promise<SiteSetting[]> => {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) throw error;
      return data as SiteSetting[];
    },
  });
};

// Impact management functions
export const useAdminImpactMetrics = () => {
  return useQuery({
    queryKey: ['admin-impact-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('impact_metrics')
        .select('*')
        .order('metric_key');
      
      if (error) throw error;
      return data as ImpactMetric[];
    },
  });
};

export const useUpdateImpactMetric = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, metric_value }: { id: string; metric_value: number }) => {
      const { error } = await supabase
        .from('impact_metrics')
        .update({ metric_value, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-impact-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['impact-metrics'] });
      toast({
        title: "Success",
        description: "Impact metric updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update impact metric",
        variant: "destructive",
      });
    },
  });
};

export const useAdminImpactPhotos = () => {
  return useQuery({
    queryKey: ['admin-impact-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('impact_photos')
        .select('*')
        .order('order_position');
      
      if (error) throw error;
      return data as ImpactPhoto[];
    },
  });
};

export const useCreateImpactPhoto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (photoData: Omit<ImpactPhoto, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('impact_photos')
        .insert({ 
          ...photoData, 
          created_by: user.user?.id 
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-impact-photos'] });
      queryClient.invalidateQueries({ queryKey: ['impact-photos'] });
      toast({
        title: "Success",
        description: "Impact photo added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add impact photo",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteImpactPhoto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('impact_photos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-impact-photos'] });
      queryClient.invalidateQueries({ queryKey: ['impact-photos'] });
      toast({
        title: "Success",
        description: "Impact photo removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove impact photo",
        variant: "destructive",
      });
    },
  });
};

export const useAdminCoveredLocations = () => {
  return useQuery({
    queryKey: ['admin-covered-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('covered_locations')
        .select('*')
        .order('city_name');
      
      if (error) throw error;
      return data as CoveredLocation[];
    },
  });
};

export const useCreateCoveredLocation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (locationData: Omit<CoveredLocation, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('covered_locations')
        .insert(locationData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-covered-locations'] });
      queryClient.invalidateQueries({ queryKey: ['covered-locations'] });
      toast({
        title: "Success",
        description: "Location added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add location",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCoveredLocation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('covered_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-covered-locations'] });
      queryClient.invalidateQueries({ queryKey: ['covered-locations'] });
      toast({
        title: "Success",
        description: "Location removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove location",
        variant: "destructive",
      });
    },
  });
};

// --- Mutations ---

export const useSetUserRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: 'user' | 'admin' }) => {
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
      
      await supabase.rpc('log_admin_action', {
        action_text: `Changed user role to ${role}`,
        target_type_param: 'user',
        target_id_param: userId,
        details_param: { new_role: role, old_role: existingRole?.role || 'user' }
      });
    },
    onSuccess: (_, variables) => {
      toast({ title: "Role updated", description: `User role set to ${variables.role}` });
      queryClient.invalidateQueries({ queryKey: ['adminUserRoles'] });
    },
    onError: (error: any) => {
      toast({ title: "Error updating role", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string, status: 'active' | 'banned' | 'suspended' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ account_status: status })
        .eq('id', userId);
      
      if (error) throw error;
      
      await supabase.rpc('log_admin_action', {
        action_text: `Changed user status to ${status}`,
        target_type_param: 'user',
        target_id_param: userId,
        details_param: { new_status: status }
      });
    },
    onSuccess: (_, variables) => {
      toast({ title: "User status updated", description: `User account ${variables.status}` });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (error: any) => {
      toast({ title: "Error updating user status", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateSiteSetting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string, value: any }) => {
      const { data: userResponse } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('site_settings')
        .update({ value, updated_by: userResponse.user?.id })
        .eq('key', key);
      if (error) throw error;
      
      await supabase.rpc('log_admin_action', {
        action_text: `Updated site setting: ${key}`,
        target_type_param: 'setting',
        target_id_param: key,
        details_param: { new_value: value }
      });
    },
    onSuccess: (_, variables) => {
      toast({ title: 'Setting updated', description: `Setting "${variables.key}" has been saved.` });
      queryClient.invalidateQueries({ queryKey: ['adminSiteSettings'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating setting', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdatePostStatus = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ postId, newStatus }: { postId: string, newStatus: "active" | "completed" | "archived" | "deleted" | "pending" | "rejected" }) => {
            const { error } = await supabase.from('posts').update({ status: newStatus }).eq('id', postId);
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            toast({ title: "Status updated", description: `Post status changed to ${variables.newStatus}` });
            queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
        },
        onError: (error: any) => {
            toast({ title: "Error updating status", description: error.message, variant: "destructive" });
        }
    });
};

export const useDeletePost = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (postId: string) => {
            const { error } = await supabase.from('posts').delete().eq('id', postId);
            if (error) throw error;
        },
        onSuccess: () => {
            toast({ title: "Post deleted", description: "The post has been permanently deleted" });
            queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
        },
        onError: (error: any) => {
            toast({ title: "Error deleting post", description: error.message, variant: "destructive" });
        }
    });
};
