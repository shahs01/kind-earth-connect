
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UsernameSelectionForm from "@/components/UsernameSelectionForm";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [needsUsername, setNeedsUsername] = useState(false);
  const [oauthUserData, setOauthUserData] = useState<any>(null);
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Auth callback initiated, checking URL params:", window.location.href);
        
        // Handle the auth callback from URL fragments
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          toast({
            title: "Authentication error", 
            description: error.message,
            variant: "destructive",
          });
          navigate("/login", { replace: true });
          return;
        }
        
        if (data?.session) {
          console.log("Auth callback successful, session found:", data.session.user.email);
          
          // Check if this is an OAuth user without a username
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', data.session.user.id)
            .maybeSingle();
          
          // If profile doesn't exist or username is missing, show username selection
          if (!profileData || !profileData.username) {
            console.log("OAuth user needs to select username");
            setOauthUserData({
              email: data.session.user.email,
              name: data.session.user.user_metadata?.name || data.session.user.user_metadata?.full_name || "",
              phone: data.session.user.user_metadata?.phone || ""
            });
            setNeedsUsername(true);
            return;
          }
          
          toast({
            title: "Login successful!",
            description: "Welcome back to Thryvance.",
          });
          
          // Navigate to home page after successful auth
          navigate("/", { replace: true });
        } else {
          console.log("No session found in auth callback, waiting for auth state change");
          
          // Set up a temporary listener for auth state changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log("Auth state change in callback:", event, session?.user?.email);
              
              if (session) {
                // Check if this is an OAuth user without a username
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('username')
                  .eq('id', session.user.id)
                  .maybeSingle();
                
                if (!profileData || !profileData.username) {
                  console.log("OAuth user needs to select username");
                  setOauthUserData({
                    email: session.user.email,
                    name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || "",
                    phone: session.user.user_metadata?.phone || ""
                  });
                  setNeedsUsername(true);
                  subscription.unsubscribe();
                  return;
                }
                
                toast({
                  title: "Login successful!",
                  description: "Welcome back to Thryvance.",
                });
                navigate("/", { replace: true });
                subscription.unsubscribe();
              } else if (event === 'SIGNED_OUT') {
                console.log("User signed out, redirecting to login");
                navigate("/login", { replace: true });
                subscription.unsubscribe();
              }
            }
          );
          
          // Clean up subscription after 10 seconds if nothing happens
          setTimeout(() => {
            subscription.unsubscribe();
            if (!needsUsername) {
              navigate("/login", { replace: true });
            }
          }, 10000);
        }
      } catch (err) {
        console.error("Auth callback handling error:", err);
        toast({
          title: "Authentication error",
          description: "Something went wrong during authentication",
          variant: "destructive",
        });
        navigate("/login", { replace: true });
      }
    };
    
    handleAuthCallback();
  }, [navigate, toast, location]);
  
  const handleUsernameComplete = async (userData: any) => {
    try {
      // Update the user's profile with the selected username
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error("No authenticated user found");
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ username: userData.username })
        .eq('id', session.session.user.id);
      
      if (error) throw error;
      
      toast({
        title: "Welcome to Thryvance!",
        description: "Your account has been set up successfully.",
      });
      
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Error updating username:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete setup",
        variant: "destructive",
      });
    }
  };
  
  if (needsUsername && oauthUserData) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-hero-pattern">
        <div className="max-w-md w-full px-4">
          <UsernameSelectionForm 
            userData={oauthUserData}
            onComplete={handleUsernameComplete}
            isLoading={false}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
      <p className="mt-4 text-gray-600">Completing your login...</p>
      <p className="mt-2 text-sm text-gray-500">Please wait while we sign you in...</p>
    </div>
  );
};

export default AuthCallback;
