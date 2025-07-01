
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAdminCheck } from "@/hooks/useAdmin";
import { Loader2, Shield } from "lucide-react";

const AdminProtectedRoute = () => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading, error: adminError } = useAdminCheck();
  const location = useLocation();

  console.log("AdminProtectedRoute: Auth state", {
    isAuthenticated,
    hasUser: !!user,
    authLoading,
    isAdminLoading,
    isAdmin,
    adminError
  });

  // Show loading while checking auth or admin status
  if (authLoading || isAdminLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-2" />
          <p className="text-red-700 font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    console.log("AdminProtectedRoute: Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but not admin, show access denied
  if (!isAdmin) {
    console.log("AdminProtectedRoute: User is not admin, showing access denied");
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-red-600 mb-6">
            You don't have administrator privileges to access this area.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-red-500">
              If you believe this is an error, please contact support.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log("AdminProtectedRoute: Access granted for admin user");
  // User is authenticated and is an admin
  return <Outlet />;
};

export default AdminProtectedRoute;

