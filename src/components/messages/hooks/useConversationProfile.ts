
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User as UserType } from "@/types";

export function useConversationProfile() {
  const [otherUser, setOtherUser] = useState<UserType | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { toast } = useToast();
  const [lastFetchedId, setLastFetchedId] = useState<string | null>(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);

  // Fetch profile information with retry logic
  const fetchOtherUser = useCallback(async (userId: string) => {
    // Skip if we're already loading this user
    if (profileLoading && lastFetchedId === userId) {
      return;
    }
    
    try {
      setProfileLoading(true);
      setLastFetchedId(userId);
      console.log("Fetching user profile for:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        
        // Retry logic for temporary failures (max 3 attempts)
        if (fetchAttempts < 3) {
          setFetchAttempts(prev => prev + 1);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
          return fetchOtherUser(userId);
        }
        
        toast({
          title: "Error",
          description: "Could not load user information",
          variant: "destructive"
        });
        return;
      }
      
      console.log("User profile fetched:", data);
      
      if (!data) {
        toast({
          title: "User not found",
          description: "The user profile could not be found",
          variant: "destructive"
        });
        return;
      }
      
      // Reset fetch attempts on success
      setFetchAttempts(0);
      
      const userData: UserType = {
        id: data.id,
        username: data.username || '',
        email: data.email || '',
        name: data.name || '',
        avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || '')}`,
        bio: data.bio || '',
        location: data.location || '',
        trustScore: data.trust_score || 0,
        helpOffered: data.help_offered || 0,
        helpReceived: data.help_received || 0,
        volunteerHours: data.volunteer_hours || 0,
        createdAt: new Date(data.created_at || Date.now()),
        verifiedStatus: data.verified_status || false,
        emailVerified: true,
        trustBadges: data.trust_badges || [],
        loginAttempts: 0,
        lastLoginAttempt: null
      };
      
      setOtherUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast({
        title: "Error",
        description: "Could not load user information",
        variant: "destructive"
      });
    } finally {
      setProfileLoading(false);
    }
  }, [toast, profileLoading, lastFetchedId, fetchAttempts]);

  // Clear other user data when component unmounts to prevent stale data
  useEffect(() => {
    return () => {
      setOtherUser(null);
      setLastFetchedId(null);
      setFetchAttempts(0);
    };
  }, []);

  const handleReportUser = useCallback(() => {
    if (!otherUser) return;
    
    const event = new CustomEvent('report-user', { 
      detail: { userId: otherUser.id } 
    });
    window.dispatchEvent(event);
    
    toast({
      title: "Report submitted",
      description: "Your report has been submitted for review"
    });
  }, [otherUser, toast]);

  return {
    otherUser,
    profileLoading,
    isProfileOpen,
    setIsProfileOpen,
    fetchOtherUser,
    handleReportUser
  };
}
