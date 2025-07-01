
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAdminCheck } from "@/hooks/useAdmin";
import { Loader2, Shield, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminStats from "@/components/admin/AdminStats";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminPosts from "@/components/admin/AdminPosts";
import AdminNonprofits from "@/components/admin/AdminNonprofits";
import AdminTeamMembers from "@/components/admin/AdminTeamMembers";
import AdminSiteContent from "@/components/admin/AdminSiteContent";
import AdminAboutImages from "@/components/admin/AdminAboutImages";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminAuditLogs from "@/components/admin/AdminAuditLogs";
import AdminImpact from "@/components/admin/AdminImpact";

const AdminDashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading, error: adminError } = useAdminCheck();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  console.log("AdminDashboard: Complete auth state", {
    isAuthenticated,
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    authLoading,
    isAdminLoading,
    isAdmin,
    adminError: adminError?.message || adminError,
    currentPath: window.location.pathname
  });

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!authLoading && (!isAuthenticated || !user)) {
      console.log("AdminDashboard: Not authenticated, redirecting to login");
      navigate("/login");
    }
  }, [user, isAuthenticated, authLoading, navigate]);

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

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  // If authenticated but not admin, show access denied with debug info
  if (!isAdmin) {
    console.log("AdminDashboard: User is not admin, showing access denied");
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-red-600 mb-6">
            You don't have administrator privileges to access this area.
          </p>
          
          {/* Debug info */}
          <div className="bg-white p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Debug Information
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Is Admin:</strong> {String(isAdmin)}</p>
              <p><strong>Admin Loading:</strong> {String(isAdminLoading)}</p>
              {adminError && <p><strong>Error:</strong> {String(adminError)}</p>}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              To make this user an admin, add a record to the user_roles table in Supabase:
              <br />
              user_id: {user.id}, role: 'admin'
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-red-500">
              If you believe this is an error, please contact support.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log("AdminDashboard: Access granted for admin user");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminStats />;
      case "users":
        return <AdminUsers />;
      case "posts":
        return <AdminPosts />;
      case "nonprofits":
        return <AdminNonprofits />;
      case "team":
        return <AdminTeamMembers />;
      case "impact":
        return <AdminImpact />;
      case "content":
        return <AdminSiteContent />;
      case "about-images":
        return <AdminAboutImages />;
      case "settings":
        return <AdminSettings />;
      case "audit":
        return <AdminAuditLogs />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage and monitor the Thryvance platform</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-10">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="nonprofits">Nonprofits</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="impact">Impact</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="about-images">About Images</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <div className="bg-white rounded-lg shadow p-6">
              {renderTabContent()}
            </div>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
