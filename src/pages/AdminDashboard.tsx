
import { useEffect, useState } from "react";
import { Route, Routes, Link } from "react-router-dom";
import { useAdmin, AdminStats } from "@/hooks/useAdmin";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, MessageSquare, HelpCircle, Settings, BarChart } from "lucide-react";
import NotFound from "@/pages/NotFound";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminPosts from "@/components/admin/AdminPosts";

const AdminDashboard = () => {
  const { isAdmin, loading, checkIfAdmin, fetchStats } = useAdmin();
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalHelpRequests: 0,
    totalHelpOffers: 0
  });
  
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
        <main className="flex-grow py-8 bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
          <span className="ml-2">Checking admin access...</span>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!isAdmin) {
    return <NotFound />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-500">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-thryvance-blue mr-3" />
                  <span className="text-3xl font-bold">{stats.totalUsers}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-500">Total Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-thryvance-green mr-3" />
                  <span className="text-3xl font-bold">{stats.totalPosts}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-500">Help Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <HelpCircle className="h-8 w-8 text-orange-500 mr-3" />
                  <span className="text-3xl font-bold">{stats.totalHelpRequests}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-500">Help Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <HelpCircle className="h-8 w-8 text-purple-500 mr-3" />
                  <span className="text-3xl font-bold">{stats.totalHelpOffers}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Admin Navigation</CardTitle>
              <CardDescription>Manage users, posts, and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <Link to="/admin-dashboard/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/admin-dashboard/posts">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Manage Posts
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/admin-dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    System Settings
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/admin-dashboard/stats">
                    <BarChart className="mr-2 h-4 w-4" />
                    Advanced Analytics
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Routes>
            <Route path="/" element={
              <div className="text-center py-8 text-gray-500">
                <h3 className="text-xl mb-2">Welcome to the Admin Dashboard</h3>
                <p>Select an option above to manage your application</p>
              </div>
            } />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/posts" element={<AdminPosts />} />
            <Route path="/settings" element={
              <div className="text-center py-8 text-gray-500">
                <p>System Settings (Coming soon)</p>
              </div>
            } />
            <Route path="/stats" element={
              <div className="text-center py-8 text-gray-500">
                <p>Advanced Analytics (Coming soon)</p>
              </div>
            } />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
