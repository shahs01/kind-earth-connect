
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Heart, MessageSquare, Share2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  name?: string | null;
  avatar?: string | null;
  username?: string | null;
}

interface Post {
  id: string;
  type: string;
  title: string;
  description: string | null;
  location: string | null;
  category: string | null;
  user: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
}

interface CommunityFeedProps {
  searchQuery?: string;
  locationFilter?: string;
  postTypeFilter?: string;
  sortBy?: string;
}

const CommunityFeed = ({
  searchQuery = "",
  locationFilter = "",
  postTypeFilter = "all",
  sortBy = "newest"
}: CommunityFeedProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log("Fetching community feed with filters:", { searchQuery, locationFilter, postTypeFilter, sortBy });
        
        // Build the query
        let query = supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id(name, avatar, username)
          `)
          .eq('status', 'active');
          
        // Apply filters
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }
        
        if (locationFilter) {
          query = query.ilike('location', `%${locationFilter}%`);
        }
        
        if (postTypeFilter && postTypeFilter !== "all") {
          query = query.eq('type', postTypeFilter);
        }

        // Apply sorting
        if (sortBy === "oldest") {
          query = query.order('created_at', { ascending: true });
        } else {
          // Default to newest first
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        
        console.log("Community feed results:", { data, error });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Format posts for display
          const formattedPosts = data.map(post => {
            const profileData = post.profiles as ProfileData || {} as ProfileData;
            
            return {
              id: post.id,
              type: post.type,
              title: post.title,
              description: post.description,
              location: post.location,
              category: post.category,
              user: {
                name: profileData.name || profileData.username || "Unknown User",
                avatar: profileData.avatar || "https://ui-avatars.com/api/?name=User"
              },
              createdAt: new Date(post.created_at).toLocaleString(),
              likes: 0, // These would be actual counts from a likes table
              comments: 0 // These would be actual counts from a comments table
            };
          });
          
          setPosts(formattedPosts);
        } else {
          setPosts([]);
        }
      } catch (err: any) {
        console.error("Error fetching community feed:", err);
        setError(err.message || "Failed to load community feed");
        toast({
          title: "Error fetching posts",
          description: "Could not load community feed. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [searchQuery, locationFilter, postTypeFilter, sortBy, toast]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
          <span className="ml-2 text-gray-600">Loading posts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <Card className="text-center py-6">
          <CardContent>
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-medium text-red-600">Error Loading Posts</h3>
            <p className="text-gray-600 mt-2 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Community Posts</h2>
        {isAuthenticated ? (
          <div className="flex gap-2">
            <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark">
              <Link to="/offer-help">Offer Help</Link>
            </Button>
            <Button asChild variant="outline" className="border-thryvance-blue text-thryvance-blue hover:bg-thryvance-blue-light">
              <Link to="/request-help">Request Help</Link>
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button asChild variant="outline" className="border-thryvance-blue text-thryvance-blue hover:bg-thryvance-blue-light">
              <Link to="/login">Login to Post</Link>
            </Button>
          </div>
        )}
      </div>

      {posts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">No posts yet</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery || locationFilter || (postTypeFilter !== "all")
                ? "Try adjusting your search filters to find posts"
                : "Be the first to create a post in our community!"}
            </p>
            {isAuthenticated ? (
              <div className="mt-6 flex gap-4 justify-center">
                <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark">
                  <Link to="/offer-help">Offer Help</Link>
                </Button>
                <Button asChild variant="outline" className="border-thryvance-blue text-thryvance-blue hover:bg-thryvance-blue-light">
                  <Link to="/request-help">Request Help</Link>
                </Button>
              </div>
            ) : (
              <Button asChild className="mt-6 bg-thryvance-green hover:bg-thryvance-green-dark">
                <Link to="/login">Login to Create Post</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className={post.type === 'offer' 
                  ? 'border-l-4 border-thryvance-green' 
                  : 'border-l-4 border-thryvance-blue'}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{post.user.name}</h3>
                    <p className="text-xs text-gray-500">{post.createdAt}</p>
                  </div>
                  <span className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${
                    post.type === 'offer' 
                      ? 'bg-thryvance-green-light text-thryvance-green' 
                      : 'bg-thryvance-blue-light text-thryvance-blue'
                  }`}>
                    {post.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="text-lg font-medium mb-2">{post.title}</h4>
                <p className="text-gray-700 mb-2">{post.description}</p>
                {post.location && (
                  <div className="text-sm text-gray-500">📍 {post.location}</div>
                )}
                {post.category && (
                  <div className="mt-2">
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {post.category}
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-gray-100 pt-4">
                <div className="flex justify-between w-full">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Heart className="h-4 w-4" /> {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" /> {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
