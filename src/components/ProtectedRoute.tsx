
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

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
  requireVerified = true 
}: ProtectedRouteProps) => {
  const { user, isLoading, emailVerified } = useAuth();
  const location = useLocation();

  // Show loading indicator while authentication state is being determined
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    // Redirect to login page but save the current location they were trying to access
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If verification is required but email is not verified
  if (requireVerified && !emailVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // If authenticated and meets verification requirements, render the outlet (child routes)
  return <Outlet />;
};

export default ProtectedRoute;
