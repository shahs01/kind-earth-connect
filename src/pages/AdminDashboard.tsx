
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
  const { user, isAuthenticated } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading } = useAdminCheck();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login");
    } else if (!isAdminLoading && !isAdmin) {
      navigate("/login");
    }
  }, [user, isAuthenticated, isAdmin, isAdminLoading, navigate]);

  if (!isAuthenticated || !user || isAdminLoading) {
    return null;
  }

  if (!isAdmin) {
    return null;
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
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-11">
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
