
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
  const { session, isLoading, emailVerified } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute: Auth state check", {
    isLoading,
    hasSession: !!session,
    currentPath: location.pathname
  });

  // Show loading indicator while authentication state is being determined
  if (isLoading) {
    console.log("ProtectedRoute: Showing loading state");
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // If not authenticated (no session), redirect to login
  if (!session || !session.user) {
    console.log("ProtectedRoute: Redirecting to login - no session");
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Email verification check (only if required)
  if (requireVerified && !emailVerified) {
    console.log("ProtectedRoute: Redirecting to email verification");
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // User has a session - they're authenticated
  console.log("ProtectedRoute: Access granted");
  return <Outlet />;
};

export default ProtectedRoute;
