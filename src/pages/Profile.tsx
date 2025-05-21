import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Post, User } from "@/types";
import AccountSettings from "@/components/AccountSettings";
import PostActionMenu from "@/components/PostActionMenu";
import Reviews from "@/components/Reviews";
import ReviewsGiven from "@/components/ReviewsGiven";
import RateUserDialog from "@/components/RateUserDialog";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import UserPosts from "@/components/UserPosts";

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-12 px-6">
    <p className="text-gray-500">{message}</p>
  </div>
);

const Profile = () => {
  const { user, emailVerified } = useAuth();
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("activity");
  
  // Ensure we have a user before proceeding
  // (this should be guaranteed by ProtectedRoute, but just to be safe)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
      </div>
    );
  }

  useEffect(() => {
    const loadUserPosts = () => {
      // In a real app, this would be an API call to get user's posts
      // For now, we'll check localStorage for posts that belong to the current user
      try {
        const allPostsStr = localStorage.getItem('posts');
        const allPosts = allPostsStr ? JSON.parse(allPostsStr) : [];
        
        if (user) {
          // Filter posts for current user and parse dates
          const userPosts = allPosts
            .filter((post: any) => post.userId === user.id)
            .map((post: any) => ({
              ...post,
              createdAt: new Date(post.createdAt)
            }));
          
          setPosts(userPosts);
        }
      } catch (error) {
        console.error("Error loading user posts:", error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPosts();
  }, [user]);

  const handlePostStatusChange = (post: Post, newStatus: string) => {
    setPosts(prevPosts => 
      prevPosts.map(p => 
        p.id === post.id ? { ...p, status: newStatus as any } : p
      )
    );
    
    // In a real app, this would update the post status in the backend
    // For now, update in localStorage
    try {
      const allPostsStr = localStorage.getItem('posts');
      const allPosts = allPostsStr ? JSON.parse(allPostsStr) : [];
      
      const updatedPosts = allPosts.map((p: any) => 
        p.id === post.id ? { ...p, status: newStatus } : p
      );
      
      localStorage.setItem('posts', JSON.stringify(updatedPosts));
    } catch (error) {
      console.error("Error updating post status:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return null;
    }
  };

  const activePosts = posts.filter(post => post.status !== "deleted");
  const offerPosts = posts.filter(post => post.type === "offer" && post.status !== "deleted");
  const requestPosts = posts.filter(post => post.type === "request" && post.status !== "deleted");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-thryvance-neutral-light py-10">
        {!emailVerified && (
          <div className="container mx-auto px-4 mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Email verification required</h3>
                  <p className="mt-1 text-sm">
                    Your email address is not verified. Some features may be limited. Please check your inbox or{" "}
                    <a href="/verify-email" className="underline font-medium">verify your email now</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <ProfileCard user={user} isOwnProfile={true} />
            </div>
            
            <div className="md:col-span-2">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="offers">My Offers</TabsTrigger>
                  <TabsTrigger value="requests">My Requests</TabsTrigger>
                  <TabsTrigger value="reviews">My Reviews</TabsTrigger>
                  <TabsTrigger value="reviewsgiven">Reviews Given</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="activity" className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                      
                      {isLoading ? (
                        <div className="py-8 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-thryvance-green" />
                          <p className="text-gray-500">Loading activity...</p>
                        </div>
                      ) : activePosts.length > 0 ? (
                        <div className="space-y-4">
                          {activePosts.map((post) => (
                            <div key={post.id} className="border-b pb-4 last:border-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 mb-1 text-sm text-gray-500">
                                  <span>
                                    {post.type === "offer" ? "Offered help" : "Requested help"}
                                  </span>
                                  <span>•</span>
                                  <span>{post.createdAt.toLocaleDateString()}</span>
                                  {getStatusBadge(post.status)}
                                </div>
                                
                                <PostActionMenu 
                                  post={post} 
                                  onStatusChange={handlePostStatusChange} 
                                />
                              </div>
                              <h4 className="font-medium">{post.title}</h4>
                              <p className="text-gray-600 text-sm mt-1">{post.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="You don't have any activity yet. Start by offering or requesting help!" />
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">Impact</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-thryvance-green-light/50 p-6 rounded-lg text-center">
                          <p className="text-3xl font-bold text-thryvance-green-dark">{user.helpOffered}</p>
                          <p className="text-sm text-gray-600">People helped</p>
                        </div>
                        
                        <div className="bg-thryvance-blue-light/50 p-6 rounded-lg text-center">
                          <p className="text-3xl font-bold text-thryvance-blue-dark">
                            {user.volunteerHours || 0}
                          </p>
                          <p className="text-sm text-gray-600">Volunteer hours</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="offers">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">My Offers</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      {isLoading ? (
                        <div className="py-8 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-thryvance-green" />
                          <p className="text-gray-500">Loading offers...</p>
                        </div>
                      ) : offerPosts.length > 0 ? (
                        <div className="space-y-4">
                          {offerPosts.map((post) => (
                            <div key={post.id} className="border-b pb-4 last:border-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{post.title}</h4>
                                  <p className="text-gray-600 text-sm mt-1">{post.description}</p>
                                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                    <span>{post.category}</span>
                                    <span>•</span>
                                    <span>{post.createdAt.toLocaleDateString()}</span>
                                    <span>•</span>
                                    {getStatusBadge(post.status)}
                                  </div>
                                </div>
                                
                                <PostActionMenu 
                                  post={post} 
                                  onStatusChange={handlePostStatusChange} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="You haven't offered any help yet. Share your skills and time with others who need it!" />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="requests">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">My Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      {isLoading ? (
                        <div className="py-8 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-thryvance-green" />
                          <p className="text-gray-500">Loading requests...</p>
                        </div>
                      ) : requestPosts.length > 0 ? (
                        <div className="space-y-4">
                          {requestPosts.map((post) => (
                            <div key={post.id} className="border-b pb-4 last:border-0">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{post.title}</h4>
                                  <p className="text-gray-600 text-sm mt-1">{post.description}</p>
                                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                    <span>{post.category}</span>
                                    <span>•</span>
                                    <span>{post.createdAt.toLocaleDateString()}</span>
                                    <span>•</span>
                                    {getStatusBadge(post.status)}
                                  </div>
                                </div>
                                
                                <PostActionMenu 
                                  post={post} 
                                  onStatusChange={handlePostStatusChange} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="You haven't requested any help yet. Don't hesitate to ask the community when you need assistance!" />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <Reviews user={user} />
                </TabsContent>
                
                <TabsContent value="reviewsgiven">
                  <ReviewsGiven user={user} />
                </TabsContent>
                
                <TabsContent value="settings">
                  <AccountSettings />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Rating Dialog */}
      <RateUserDialog 
        user={user} 
        open={isRateDialogOpen} 
        onOpenChange={setIsRateDialogOpen} 
      />
    </div>
  );
};

export default Profile;
