import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, MapPin, Clock, User, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ProfileDialog from "@/components/ProfileDialog";
import { User as UserType } from "@/types";

interface ProfileData {
  name?: string | null;
  avatar?: string | null;
}

interface Post {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  created_at: string;
  location: string | null;
  status: string | null;
  user_id: string;
  profile?: ProfileData | null;
}

interface PostsListProps {
  searchQuery?: string;
  categoryFilter?: string;
  typeFilter?: string | null;
  locationFilter?: string;
  sortBy?: string;
}

const PostsList = ({ 
  searchQuery = "", 
  categoryFilter = "",
  typeFilter = null,
  locationFilter = "",
  sortBy = "newest"
}: PostsListProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log("Fetching posts with filters:", { searchQuery, categoryFilter, typeFilter, locationFilter, sortBy });
        
        // Start building the query
        let query = supabase
          .from('posts')
          .select('*')
          .eq('status', 'active');

        // Apply filters
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }
        
        if (categoryFilter && categoryFilter !== "All Categories") {
          query = query.eq('category', categoryFilter);
        }
        
        if (typeFilter && typeFilter !== "all") {
          query = query.eq('type', typeFilter);
        }
        
        if (locationFilter) {
          query = query.ilike('location', `%${locationFilter}%`);
        }

        // Apply sorting
        if (sortBy === "oldest") {
          query = query.order('created_at', { ascending: true });
        } else {
          // Default to newest first
          query = query.order('created_at', { ascending: false });
        }

        const { data: postsData, error: postsError } = await query;
        
        console.log("Posts query result:", { postsData, postsError });

        if (postsError) throw postsError;
        
        if (!postsData || postsData.length === 0) {
          setPosts([]);
          return;
        }
        
        // Get profile data for each post
        const postsWithProfiles = await Promise.all(postsData.map(async (post) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, avatar')
            .eq('id', post.user_id)
            .single();
          
          return {
            ...post,
            profile: profileData || null
          };
        }));
        
        setPosts(postsWithProfiles);
        
        if (postsWithProfiles.length === 0) {
          toast({
            title: "No posts found",
            description: "Try adjusting your search filters to find more posts",
            variant: "default"
          });
        }
      } catch (err: any) {
        console.error("Error fetching posts:", err);
        setError(err.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchQuery, categoryFilter, typeFilter, locationFilter, sortBy, toast]);

  const handleContact = async (userId: string) => {
    try {
      // Check if user is authenticated
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "Authentication required",
          description: "Please log in to contact other users",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      // If authenticated, navigate to the messages page with the user ID
      navigate(`/messages/${userId}`);
    } catch (err) {
      console.error("Error getting user data:", err);
      toast({
        title: "Error",
        description: "Could not contact this user. Please try again.",
        variant: "destructive"
      });
    }
  }

  const handleViewProfile = async (userId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (userData) {
        const user: UserType = {
          id: userData.id,
          username: userData.username || '',
          email: userData.email || '',
          name: userData.name || '',
          avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || '')}`,
          bio: userData.bio || '',
          location: userData.location || '',
          trustScore: userData.trust_score || 0,
          helpOffered: userData.help_offered || 0,
          helpReceived: userData.help_received || 0,
          volunteerHours: userData.volunteer_hours || 0,
          createdAt: new Date(userData.created_at || Date.now()),
          verifiedStatus: userData.verified_status || false,
          emailVerified: true,
          trustBadges: userData.trust_badges || [],
          loginAttempts: 0,
          lastLoginAttempt: null
        };

        setSelectedUser(user);
        setIsProfileOpen(true);
      }
    } catch (err) {
      console.error("Error getting user data:", err);
      toast({
        title: "Error",
        description: "Could not view this user's profile. Please try again.",
        variant: "destructive"
      });
    }
  }

  if (loading) {
    return (
      <div className="my-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-gray-100"></CardHeader>
              <CardContent className="h-32 mt-4 space-y-3">
                <div className="h-4 bg-gray-100 rounded"></div>
                <div className="h-4 bg-gray-100 rounded w-4/5"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="my-8 border-red-200">
        <CardContent className="text-center py-6">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-500 font-medium mb-2">Error Loading Posts</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="my-8 border-gray-200">
        <CardContent className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Posts Found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || categoryFilter || typeFilter || locationFilter
              ? "Try adjusting your search filters"
              : "Be the first to create a post in our community!"}
          </p>
          <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark">
            <Link to="/create-posting">Create a Post</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className={
              post.type === 'offer' 
                ? 'border-b-2 border-thryvance-green-light bg-thryvance-green-light/20 pb-3' 
                : 'border-b-2 border-thryvance-blue-light bg-thryvance-blue-light/20 pb-3'
            }>
              <div className="flex justify-between">
                <Badge variant={post.type === 'offer' ? 'outline' : 'default'} className={
                  post.type === 'offer' 
                    ? 'bg-thryvance-green-light text-thryvance-green border-thryvance-green' 
                    : 'bg-thryvance-blue-light text-thryvance-blue'
                }>
                  {post.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
                </Badge>
                
                {post.category && (
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-4">
              <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
              
              <p className="text-gray-700 mb-4 line-clamp-3">{post.description}</p>
              
              <div className="flex flex-wrap gap-y-2 text-sm text-gray-500">
                {post.location && (
                  <div className="flex items-center gap-1 w-full">
                    <MapPin className="h-3.5 w-3.5" /> 
                    <span className="truncate">{post.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 w-full">
                  <Clock className="h-3.5 w-3.5" /> 
                  <span>Posted {new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t pt-3 flex justify-between items-center bg-gray-50">
              <div 
                className="flex items-center gap-2 cursor-pointer" 
                onClick={() => handleViewProfile(post.user_id)}
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.profile?.avatar || undefined} />
                  <AvatarFallback className="bg-thryvance-neutral-light text-thryvance-neutral-dark">
                    <User className="h-3.5 w-3.5" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate max-w-[100px]">
                  {post.profile?.name || "User"}
                </span>
              </div>
              
              <Button 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => handleContact(post.user_id)}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Contact</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <ProfileDialog 
        user={selectedUser} 
        open={isProfileOpen} 
        onOpenChange={setIsProfileOpen} 
      />
    </>
  );
};

export default PostsList;
