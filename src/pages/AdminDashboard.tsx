
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAdminCheck } from "@/hooks/useAdmin";
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
import SeedPosts from "@/pages/SeedPosts";

const AdminDashboard = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading, error: adminError } = useAdminCheck();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  console.log("AdminDashboard: Auth state", { 
    isAuthenticated, 
    hasUser: !!user, 
    isAdmin, 
    authLoading, 
    isAdminLoading,
    adminError 
  });

  useEffect(() => {
    // Only redirect if we're sure about the auth state
    if (!authLoading && !isAuthenticated) {
      console.log("AdminDashboard: Not authenticated, redirecting to login");
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Show loading while checking authentication or admin status
  if (authLoading || isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thryvance-green mx-auto mb-2"></div>
          <p className="text-gray-600">
            {authLoading ? "Loading..." : "Verifying admin access..."}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, this will be handled by the useEffect above
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thryvance-green mx-auto mb-2"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If there's an error checking admin status, show it
  if (adminError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-600 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Error</h1>
          <p className="text-red-600 mb-6">
            Failed to verify admin status. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // If authenticated but not admin, show access denied
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-600 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-red-600 mb-6">
            You don't have administrator privileges to access this area.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

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
      case "seed-posts":
        return <SeedPosts />;
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
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:grid-cols-11 min-w-max">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="nonprofits">Nonprofits</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="impact">Impact</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="about-images">About Images</TabsTrigger>
                <TabsTrigger value="seed-posts">Seed Data</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="audit">Audit</TabsTrigger>
              </TabsList>
            </div>

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
