
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get URL hash, which contains access token after OAuth login
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        toast({
          title: "Authentication error",
          description: error.message,
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
      
      if (data?.session) {
        toast({
          title: "Login successful!",
          description: "Welcome back to Thryvance.",
        });
        navigate("/profile");
      } else {
        navigate("/login");
      }
    };
    
    handleAuthCallback();
  }, [navigate, toast]);
  
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
      <p className="mt-4 text-gray-600">Completing your login...</p>
    </div>
  );
};

export default AuthCallback;
