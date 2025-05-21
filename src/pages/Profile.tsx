import Navbar from "@/components/Navbar";
import ProfileCard from "@/components/ProfileCard";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Post, User } from "@/types";
import { SettingsForm } from "@/components/SettingsForm";

// Sample user data
const sampleUser: User = {
  id: "user123",
  name: "Alex Johnson",
  email: "alex@example.com",
  avatar: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80",
  bio: "I'm passionate about community building and helping others. Expert gardener, amateur carpenter, and always willing to lend a hand.",
  location: "Portland, OR",
  createdAt: new Date(2022, 5, 15),
  trustScore: 4.9,
  helpOffered: 18,
  helpReceived: 7,
  verifiedStatus: true
};

// Sample posts by this user
const userPosts: Post[] = [
  {
    id: "post1",
    title: "Offering garden consultation and plant care advice",
    description: "I'm an experienced gardener willing to share advice on plant care, garden design, and sustainable practices.",
    type: "offer",
    category: "Home & Garden",
    location: "Portland, OR",
    userId: "user123",
    createdAt: new Date(2023, 4, 10),
    status: "active"
  },
  {
    id: "post2",
    title: "Can help with basic home repairs this weekend",
    description: "I'm handy with tools and have this weekend free. Can help with minor home repairs, installing fixtures, etc.",
    type: "offer",
    category: "Home Repair",
    location: "Portland, OR",
    userId: "user123",
    createdAt: new Date(2023, 5, 16),
    status: "active"
  },
  {
    id: "post3",
    title: "Need help transporting donations to shelter",
    description: "I've collected donations for our local shelter but need help transporting them. Looking for someone with a truck or large vehicle.",
    type: "request",
    category: "Transportation",
    location: "Portland, OR",
    userId: "user123",
    createdAt: new Date(2023, 3, 20),
    status: "completed"
  }
];

const Profile = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-thryvance-neutral-light py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <ProfileCard user={sampleUser} isOwnProfile={true} />
            </div>
            
            <div className="md:col-span-2">
              <Tabs defaultValue="activity">
                <TabsList className="mb-6">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="offers">My Offers</TabsTrigger>
                  <TabsTrigger value="requests">My Requests</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="activity" className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                      
                      <div className="space-y-4">
                        {userPosts.map((post) => (
                          <div key={post.id} className="border-b pb-4 last:border-0">
                            <div className="flex items-center gap-2 mb-1 text-sm text-gray-500">
                              <span>
                                {post.type === "offer" ? "Offered help" : "Requested help"}
                              </span>
                              <span>•</span>
                              <span>{post.createdAt.toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-medium">{post.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{post.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">Impact</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-thryvance-green-light/50 p-6 rounded-lg text-center">
                          <p className="text-3xl font-bold text-thryvance-green-dark">18</p>
                          <p className="text-sm text-gray-600">People helped</p>
                        </div>
                        
                        <div className="bg-thryvance-blue-light/50 p-6 rounded-lg text-center">
                          <p className="text-3xl font-bold text-thryvance-blue-dark">24</p>
                          <p className="text-sm text-gray-600">Volunteer hours</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="offers">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">My Offers</h3>
                      
                      <div className="space-y-4">
                        {userPosts
                          .filter(post => post.type === "offer")
                          .map((post) => (
                            <div key={post.id} className="border-b pb-4 last:border-0">
                              <h4 className="font-medium">{post.title}</h4>
                              <p className="text-gray-600 text-sm mt-1">{post.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                <span>{post.category}</span>
                                <span>•</span>
                                <span>{post.createdAt.toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="capitalize">{post.status}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="requests">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">My Requests</h3>
                      
                      <div className="space-y-4">
                        {userPosts
                          .filter(post => post.type === "request")
                          .map((post) => (
                            <div key={post.id} className="border-b pb-4 last:border-0">
                              <h4 className="font-medium">{post.title}</h4>
                              <p className="text-gray-600 text-sm mt-1">{post.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                <span>{post.category}</span>
                                <span>•</span>
                                <span>{post.createdAt.toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="capitalize">{post.status}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="settings">
                  <SettingsForm user={sampleUser} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
