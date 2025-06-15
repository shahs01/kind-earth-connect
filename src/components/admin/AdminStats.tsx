
import { useAdminStats, AdminStats as StatsType } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, MessageSquare, HelpCircle, TrendingUp, Activity, Calendar } from "lucide-react";

const AdminStats = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Users", 
      value: stats?.activeUsers || 0,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Total Posts",
      value: stats?.totalPosts || 0,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Active Posts",
      value: stats?.activePosts || 0,
      icon: MessageSquare,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Help Requests",
      value: stats?.totalHelpRequests || 0,
      icon: HelpCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Help Offers",
      value: stats?.totalHelpOffers || 0,
      icon: HelpCircle,
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    },
    {
      title: "Total Messages",
      value: stats?.totalMessages || 0,
      icon: MessageSquare,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    },
    {
      title: "New Users This Month",
      value: stats?.usersThisMonth || 0,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "New Posts This Month",
      value: stats?.postsThisMonth || 0,
      icon: Calendar,
      color: "text-violet-600",
      bgColor: "bg-violet-50"
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Platform Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">User Engagement</h4>
              <p className="text-blue-700 text-sm">
                {stats && stats.totalUsers > 0 ? 
                  `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of users are active` :
                  'No user activity data available'
                }
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Content Health</h4>
              <p className="text-green-700 text-sm">
                {stats && stats.totalPosts > 0 ?
                  `${Math.round((stats.activePosts / stats.totalPosts) * 100)}% of posts are active` :
                  'No post activity data available'
                }
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Help Ratio</h4>
              <p className="text-purple-700 text-sm">
                {stats && stats.totalHelpOffers > 0 && stats.totalHelpRequests > 0 ?
                  `${(stats.totalHelpOffers / stats.totalHelpRequests).toFixed(1)} offers per request` :
                  'Calculating help ratio...'
                }
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Growth This Month</h4>
              <p className="text-orange-700 text-sm">
                {stats?.usersThisMonth || 0} new users, {stats?.postsThisMonth || 0} new posts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
