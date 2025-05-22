
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User as UserType } from "@/types";

export function useConversationProfile() {
  const [otherUser, setOtherUser] = useState<UserType | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { toast } = useToast();

  // Fetch profile information
  const fetchOtherUser = async (userId: string) => {
    try {
      setProfileLoading(true);
      console.log("Fetching user profile for:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user profile:", error);
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
  };

  const handleReportUser = useCallback(() => {
    if (!otherUser) return;
    
    const event = new CustomEvent('report-user', { 
      detail: { userId: otherUser.id } 
    });
    window.dispatchEvent(event);
  }, [otherUser]);

  return {
    otherUser,
    profileLoading,
    isProfileOpen,
    setIsProfileOpen,
    fetchOtherUser,
    handleReportUser
  };
}
