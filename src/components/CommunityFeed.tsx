import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, ChevronRight } from "lucide-react";
import { Post, User } from "@/types";

const mockPosts: Post[] = [
  {
    id: "1",
    title: "Offering free tutoring for math and science",
    description: "I can tutor middle school and high school students in mathematics and science subjects. Available on weekends.",
    type: "offer",
    category: "Education",
    location: "Boston, MA",
    userId: "user-1",
    user: {
      id: "user-1",
      username: "mathtutor",
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: "https://ui-avatars.com/api/?name=Alex+Johnson",
      bio: "Math teacher with 10+ years of experience",
      location: "Boston, MA",
      createdAt: new Date("2023-01-15"),
      trustScore: 4.8,
      helpOffered: 12,
      helpReceived: 3,
      verifiedStatus: true,
      emailVerified: true,
      loginAttempts: 0,
      lastLoginAttempt: null,
      trustBadges: ["Verified Helper", "Education Expert"]
    },
    createdAt: new Date("2023-05-10"),
    status: "active",
  },
  {
    id: "2",
    title: "Offering transportation for elderly to medical appointments",
    description: "I can drive seniors to and from doctor appointments. I have a comfortable sedan with easy access.",
    type: "offer",
    category: "Transportation",
    location: "Portland, OR",
    userId: "user-2",
    user: {
      id: "user-2",
      username: "helper123",
      name: "Maria Garcia",
      email: "maria@example.com",
      avatar: "https://ui-avatars.com/api/?name=Maria+Garcia",
      bio: "Retired nurse wanting to help the community",
      location: "Portland, OR",
      createdAt: new Date("2023-02-20"),
      trustScore: 5.0,
      helpOffered: 8,
      helpReceived: 1,
      verifiedStatus: true,
      emailVerified: true,
      loginAttempts: 0,
      lastLoginAttempt: null,
      trustBadges: ["Verified Helper", "Healthcare Expert"]
    },
    createdAt: new Date("2023-05-12"),
    status: "active",
  },
  {
    id: "3",
    title: "Need help moving furniture this weekend",
    description: "Looking for help moving some heavy furniture from my apartment to a new place about 2 miles away. Can provide refreshments!",
    type: "request",
    category: "Moving",
    location: "Chicago, IL",
    userId: "user-3",
    user: {
      id: "user-3",
      username: "movingout",
      name: "James Wilson",
      email: "james@example.com",
      avatar: "https://ui-avatars.com/api/?name=James+Wilson",
      bio: "Graduate student at UChicago",
      location: "Chicago, IL",
      createdAt: new Date("2023-03-05"),
      trustScore: 4.2,
      helpOffered: 2,
      helpReceived: 3,
      verifiedStatus: false,
      emailVerified: true,
      loginAttempts: 0,
      lastLoginAttempt: null,
      trustBadges: []
    },
    createdAt: new Date("2023-05-15"),
    status: "active",
  },
  {
    id: "4",
    title: "Offering free lawn mowing service for seniors",
    description: "I have a lawn mower and can help seniors or disabled individuals with their lawn. Available on weekday evenings.",
    type: "offer",
    category: "Home & Garden",
    location: "Austin, TX",
    userId: "user-4",
    user: {
      id: "user-4",
      username: "greengarden",
      name: "Robert Taylor",
      email: "robert@example.com",
      avatar: "https://ui-avatars.com/api/?name=Robert+Taylor",
      bio: "Landscaper who loves helping the community",
      location: "Austin, TX",
      createdAt: new Date("2023-01-10"),
      trustScore: 4.9,
      helpOffered: 15,
      helpReceived: 0,
      verifiedStatus: true,
      emailVerified: true,
      loginAttempts: 0,
      lastLoginAttempt: null,
      trustBadges: ["Verified Helper", "Community Champion"]
    },
    createdAt: new Date("2023-05-18"),
    status: "active",
  },
];

interface CommunityFeedProps {
  searchQuery?: string;
  locationFilter?: string;
  postTypeFilter?: string;
  categoryFilter?: string;
}

const CommunityFeed = ({
  searchQuery = "",
  locationFilter = "",
  postTypeFilter = "all",
  categoryFilter = "All"
}: CommunityFeedProps) => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [activeCategory, setActiveCategory] = useState("All");
  
  const categories = ["All", "Education", "Transportation", "Moving", "Home & Garden"];

  const filteredPosts = posts.filter((post) => {
    // Search term filter
    const searchMatch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Location filter
    const locationMatch = !locationFilter || 
      post.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    // Post type filter (offer/request/all)
    const typeMatch = 
      postTypeFilter === "all" || 
      post.type === postTypeFilter;
    
    // Category filter
    const categoryMatch =
      activeCategory === "All" || post.category === activeCategory;

    return searchMatch && locationMatch && typeMatch && categoryMatch;
  });

  return (
    <div className="w-full">
      <Tabs defaultValue="All" value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
        <TabsList className="bg-thryvance-neutral-light rounded-md">
          {categories.map((category) => (
            <TabsTrigger value={category} key={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700">No results found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-center mb-4">
                  <Avatar className="w-8 h-8 mr-3">
                    <AvatarImage src={post.user?.avatar} alt={post.user?.name} />
                    <AvatarFallback>{post.user?.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{post.user?.name}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {post.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-700 mb-3">{post.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-800">{post.category}</Badge>
                  <Badge className={post.type === "offer" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                    {post.type === "offer" ? "Offering Help" : "Requesting Help"}
                  </Badge>
                  {post.location && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {post.location}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="px-4 py-2 bg-gray-50 border-t">
                <Button variant="ghost" className="w-full justify-start">
                  Learn More <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
