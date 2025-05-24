
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
        
        // First, try to get the session from Supabase
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
            .single();
          
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
          
          // Store session info for debugging
          localStorage.setItem('supabase_session_debug', JSON.stringify({
            timestamp: new Date().toISOString(),
            user_id: data.session.user.id,
            email: data.session.user.email
          }));
          
          toast({
            title: "Login successful!",
            description: "Welcome back to Thryvance.",
          });
          
          // Navigate to home page after successful auth
          navigate("/", { replace: true });
        } else {
          console.log("No session found in auth callback, checking URL hash for tokens");
          
          // Check if there are auth tokens in the URL that might not have been processed yet
          const hashParams = new URLSearchParams(window.location.hash.substr(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken) {
            console.log("Found access token in URL, waiting for Supabase to process...");
            // Give Supabase a moment to process the tokens
            setTimeout(async () => {
              const { data: retryData, error: retryError } = await supabase.auth.getSession();
              if (retryData?.session) {
                console.log("Session found on retry");
                
                // Check if this is an OAuth user without a username
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('username')
                  .eq('id', retryData.session.user.id)
                  .single();
                
                if (!profileData || !profileData.username) {
                  console.log("OAuth user needs to select username on retry");
                  setOauthUserData({
                    email: retryData.session.user.email,
                    name: retryData.session.user.user_metadata?.name || retryData.session.user.user_metadata?.full_name || "",
                    phone: retryData.session.user.user_metadata?.phone || ""
                  });
                  setNeedsUsername(true);
                  return;
                }
                
                toast({
                  title: "Login successful!",
                  description: "Welcome back to Thryvance.",
                });
                navigate("/", { replace: true });
              } else {
                console.log("No session found on retry, redirecting to login");
                navigate("/login", { replace: true });
              }
            }, 1000);
          } else {
            console.log("No tokens found, redirecting to login");
            navigate("/login", { replace: true });
          }
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
