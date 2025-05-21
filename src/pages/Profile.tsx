
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import AccountSettings from "@/components/AccountSettings";
import Reviews from "@/components/Reviews";
import ReviewsGiven from "@/components/ReviewsGiven";
import RateUserDialog from "@/components/RateUserDialog";
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
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("activity");
  
  // Ensure we have a user before proceeding
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
      </div>
    );
  }

  console.log("Current user in Profile:", user);

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
                  <TabsTrigger value="posts">My Posts</TabsTrigger>
                  <TabsTrigger value="reviews">My Reviews</TabsTrigger>
                  <TabsTrigger value="reviewsgiven">Reviews Given</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="activity" className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                      
                      <div className="space-y-4">
                        <EmptyState message="Your recent activity will appear here." />
                      </div>
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
                
                <TabsContent value="posts">
                  <UserPosts />
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
