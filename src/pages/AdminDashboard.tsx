
import { useEffect, useState } from "react";
import { Route, Routes, Link, useLocation } from "react-router-dom";
import { useAdmin, AdminStats } from "@/hooks/useAdmin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users, MessageSquare, HelpCircle, Settings, BarChart, Shield, FileText } from "lucide-react";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminPosts from "@/components/admin/AdminPosts";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminStats from "@/components/admin/AdminStats";
import AdminAuditLogs from "@/components/admin/AdminAuditLogs";

const AdminDashboard = () => {
  const { isAdmin, loading, checkIfAdmin, fetchStats } = useAdmin();
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalHelpRequests: 0,
    totalHelpOffers: 0,
    activeUsers: 0,
    activePosts: 0,
    totalMessages: 0,
    usersThisMonth: 0,
    postsThisMonth: 0
  });
  const location = useLocation();
  
  useEffect(() => {
    const init = async () => {
      setChecking(true);
      const isUserAdmin = await checkIfAdmin();
      
      if (isUserAdmin) {
        const adminStats = await fetchStats();
        setStats(adminStats);
      }
      
      setChecking(false);
    };
    
    init();
  }, []);
  
  if (checking) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 bg-red-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <span className="ml-2">Checking admin access...</span>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-red-50">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Admin Header with distinctive styling */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-red-100">
              Administrative controls and platform management
            </p>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-500">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-red-600 mr-3" />
                  <span className="text-3xl font-bold">{stats.totalUsers}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-500">Total Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-orange-600 mr-3" />
                  <span className="text-3xl font-bold">{stats.totalPosts}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-500">Help Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <HelpCircle className="h-8 w-8 text-blue-600 mr-3" />
                  <span className="text-3xl font-bold">{stats.totalHelpRequests}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-500">Help Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <HelpCircle className="h-8 w-8 text-green-600 mr-3" />
                  <span className="text-3xl font-bold">{stats.totalHelpOffers}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Navigation */}
          <Card className="mb-8 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800">Admin Controls</CardTitle>
              <CardDescription>Manage users, content, and platform settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button asChild variant={location.pathname.includes('/users') ? 'default' : 'outline'}>
                  <Link to="/admin/dashboard/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
                <Button asChild variant={location.pathname.includes('/posts') ? 'default' : 'outline'}>
                  <Link to="/admin/dashboard/posts">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Manage Posts
                  </Link>
                </Button>
                <Button asChild variant={location.pathname.includes('/settings') ? 'default' : 'outline'}>
                  <Link to="/admin/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Site Settings
                  </Link>
                </Button>
                <Button asChild variant={location.pathname.includes('/stats') ? 'default' : 'outline'}>
                  <Link to="/admin/dashboard/stats">
                    <BarChart className="mr-2 h-4 w-4" />
                    Analytics
                  </Link>
                </Button>
                <Button asChild variant={location.pathname.includes('/audit') ? 'default' : 'outline'}>
                  <Link to="/admin/dashboard/audit">
                    <FileText className="mr-2 h-4 w-4" />
                    Audit Logs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Route Content */}
          <Routes>
            <Route path="/" element={
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-red-800 mb-2">Welcome to Admin Dashboard</h3>
                <p className="text-gray-600 mb-6">Select an option above to manage your application</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <Users className="h-8 w-8 text-blue-600 mb-2" />
                    <h4 className="font-semibold">User Management</h4>
                    <p className="text-sm text-gray-600">Manage user accounts, roles, and permissions</p>
                  </Card>
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <MessageSquare className="h-8 w-8 text-green-600 mb-2" />
                    <h4 className="font-semibold">Content Moderation</h4>
                    <p className="text-sm text-gray-600">Review and manage user posts and content</p>
                  </Card>
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <Settings className="h-8 w-8 text-purple-600 mb-2" />
                    <h4 className="font-semibold">Platform Settings</h4>
                    <p className="text-sm text-gray-600">Configure global platform settings</p>
                  </Card>
                </div>
              </div>
            } />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/posts" element={<AdminPosts />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/stats" element={<AdminStats />} />
            <Route path="/audit" element={<AdminAuditLogs />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
