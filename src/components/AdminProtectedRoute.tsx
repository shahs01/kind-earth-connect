
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useEffect, useState } from "react";
import { Loader2, Shield } from "lucide-react";

const AdminProtectedRoute = () => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { checkIfAdmin } = useAdmin();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAdminAccess = async () => {
      if (!authLoading && isAuthenticated && user) {
        setChecking(true);
        const adminStatus = await checkIfAdmin();
        setIsAdmin(adminStatus);
        setChecking(false);
      } else if (!authLoading && !isAuthenticated) {
        setIsAdmin(false);
        setChecking(false);
      }
    };

    verifyAdminAccess();
  }, [user, isAuthenticated, authLoading, checkIfAdmin]);

  // Show loading while checking auth or admin status
  if (authLoading || checking) {
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-red-600 mb-6">
            You don't have administrator privileges to access this area.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and is an admin
  return <Outlet />;
};

export default AdminProtectedRoute;
