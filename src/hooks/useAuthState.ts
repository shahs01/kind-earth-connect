
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType } from "@/types";

interface AuthState {
  user: UserType | null;
  session: Session | null;
  isLoading: boolean;
  emailVerified: boolean;
}

export function useAuthState(): AuthState {
  const [user, setUser] = useState<UserType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
          // Defer Supabase call with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        // Defer Supabase call with setTimeout to prevent deadlock
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        setIsLoading(false);
        return;
      }

      if (data) {
        // Transform the data to match our UserType
        const userData: UserType = {
          id: data.id,
          username: data.username || "",
          name: data.name || "",
          email: data.email || "",
          avatar: data.avatar || "",
          bio: data.bio || "",
          location: data.location || "",
          createdAt: new Date(data.created_at),
          trustScore: data.trust_score || 5.0,
          helpOffered: data.help_offered || 0,
          helpReceived: data.help_received || 0,
          verifiedStatus: data.verified_status || false,
          emailVerified: true, // Assuming email is verified if we have a session
          loginAttempts: 0,
          lastLoginAttempt: null,
          trustBadges: data.trust_badges || [],
          volunteerHours: data.volunteer_hours || 0,
        };

        setUser(userData);
        setEmailVerified(true); // Assuming email is verified if we have a profile
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    user,
    session,
    isLoading,
    emailVerified
  };
}
