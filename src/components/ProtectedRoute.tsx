
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  redirectPath?: string;
  requireVerified?: boolean;
}

const ProtectedRoute = ({ 
  redirectPath = "/login",
  requireVerified = false
}: ProtectedRouteProps) => {
  const { user, isLoading, emailVerified, isAuthenticated } = useAuth();
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

  // If not authenticated, redirect to login with current location for redirect back
  if (!user || !isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Email verification check
  if (requireVerified && !emailVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // User is authenticated and meets verification requirements
  return <Outlet />;
};

export default ProtectedRoute;
