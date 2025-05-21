
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  redirectPath?: string;
  requireVerified?: boolean;
}

/**
 * Protected route component that redirects unauthenticated users
 * and can optionally require email verification
 */
const ProtectedRoute = ({ 
  redirectPath = "/login",
  requireVerified = false // Email verification is disabled by default
}: ProtectedRouteProps) => {
  const { user, isLoading, emailVerified, isAuthenticated } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Show toast notification if user is redirected to login
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "default"
      });
    }
  }, [isLoading, isAuthenticated]);

  // Show loading indicator while authentication state is being determined
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // If not authenticated, redirect to login with current location for redirect back
  if (!user || !isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Email verification check - should not trigger since verification is disabled
  if (requireVerified && !emailVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // Security improvement: Check for session expiration
  const sessionExpiry = localStorage.getItem('sessionExpiry');
  if (sessionExpiry && parseInt(sessionExpiry) < Date.now()) {
    // Clear expired session data
    localStorage.removeItem('sessionExpiry');
    
    // Redirect to login with timeout notification
    return <Navigate to="/login" state={{ from: location, sessionExpired: true }} replace />;
  }

  // Set session expiry time if not already set - 24 hour session
  if (!sessionExpiry) {
    localStorage.setItem('sessionExpiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
  }

  // User is authenticated and meets verification requirements
  return <Outlet />;
};

export default ProtectedRoute;
