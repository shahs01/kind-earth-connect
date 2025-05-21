
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MapPin, Calendar, Tag, Heart, Flag } from "lucide-react";
import { Post } from "@/types";

// Sample data for the feed
const samplePosts: Post[] = [
  {
    id: "1",
    title: "Help with grocery shopping for elderly neighbor",
    description: "Looking for someone who can help my elderly neighbor with weekly grocery shopping on Saturdays.",
    type: "request",
    category: "Errands",
    location: "Downtown Portland",
    userId: "user1",
    user: {
      id: "user1",
      name: "Jane Smith",
      email: "jane@example.com",
      createdAt: new Date(2023, 1, 15),
      trustScore: 4.8,
      helpOffered: 12,
      helpReceived: 3,
      verifiedStatus: true
    },
    createdAt: new Date(2023, 5, 20),
    status: "active"
  },
  {
    id: "2",
    title: "Offering free math tutoring for high school students",
    description: "I'm a retired math teacher willing to tutor high school students in algebra, geometry, and calculus.",
    type: "offer",
    category: "Education",
    location: "North Portland",
    userId: "user2",
    user: {
      id: "user2",
      name: "Robert Chen",
      email: "robert@example.com",
      createdAt: new Date(2022, 11, 5),
      trustScore: 4.9,
      helpOffered: 24,
      helpReceived: 5,
      verifiedStatus: true
    },
    createdAt: new Date(2023, 5, 18),
    status: "active"
  },
  {
    id: "3",
    title: "Can help with basic home repairs this weekend",
    description: "I'm handy with tools and have this weekend free. Can help with minor home repairs, installing fixtures, etc.",
    type: "offer",
    category: "Home Repair",
    location: "Southeast Portland",
    userId: "user3",
    user: {
      id: "user3",
      name: "Miguel Fernandez",
      email: "miguel@example.com",
      createdAt: new Date(2023, 2, 10),
      trustScore: 4.7,
      helpOffered: 8,
      helpReceived: 2,
      verifiedStatus: false
    },
    createdAt: new Date(2023, 5, 16),
    status: "active"
  },
  {
    id: "4",
    title: "Need help moving furniture - will provide lunch!",
    description: "Moving to a new apartment and need help with some heavy furniture. It's a second-floor walk-up. Will provide lunch and drinks!",
    type: "request",
    category: "Moving",
    location: "West Portland",
    userId: "user4",
    user: {
      id: "user4",
      name: "Aisha Johnson",
      email: "aisha@example.com",
      createdAt: new Date(2023, 3, 25),
      trustScore: 4.5,
      helpOffered: 6,
      helpReceived: 4,
      verifiedStatus: true
    },
    createdAt: new Date(2023, 5, 15),
    status: "active"
  }
];

const CommunityFeed = () => {
  const [activeTab, setActiveTab] = useState<"all" | "offers" | "requests">("all");
  
  const filteredPosts = samplePosts.filter(post => {
    if (activeTab === "all") return true;
    if (activeTab === "offers") return post.type === "offer";
    if (activeTab === "requests") return post.type === "request";
    return true;
  });
  
  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Community Feed</h2>
            <p className="text-gray-600 mt-1">See who's offering help and who needs support</p>
          </div>
          
          <div className="flex gap-4">
            <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark">
              <a href="/offer-help">Offer Help</a>
            </Button>
            <Button asChild variant="outline" className="border-thryvance-blue text-thryvance-blue hover:bg-thryvance-blue-light">
              <a href="/request-help">Request Help</a>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveTab(value as "all" | "offers" | "requests")}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="offers" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="requests" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

const PostCard = ({ post }: { post: Post }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className={`text-sm font-medium inline-flex items-center px-3 py-1 rounded-full ${
          post.type === 'offer' 
            ? 'bg-thryvance-green-light text-thryvance-green-dark' 
            : 'bg-thryvance-blue-light text-thryvance-blue-dark'
        }`}>
          {post.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
        </div>
        <h3 className="text-xl font-semibold mt-3 line-clamp-2">{post.title}</h3>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-gray-600 mb-4 line-clamp-3">{post.description}</p>
        
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <span>{post.category}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{post.location}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{post.createdAt.toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between items-center border-t bg-thryvance-neutral-light/50">
        <div className="flex items-center gap-2 py-3">
          <div className="h-8 w-8 rounded-full bg-thryvance-neutral flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{post.user?.name}</p>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-thryvance-green" />
              <span className="text-xs text-gray-600">{post.user?.trustScore} Trust Score</span>
            </div>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" className="text-thryvance-blue-dark">
          <Flag className="h-4 w-4 mr-1" />
          <span>Connect</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CommunityFeed;
