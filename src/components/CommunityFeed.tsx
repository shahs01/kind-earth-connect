
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Heart, MessageSquare, Share2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PostDetailDialog from "@/components/PostDetailDialog";

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
  photos?: string[] | null;
  user_id: string;
  user: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  created_at: string;
  likes: number;
  comments: number;
}

interface CommunityFeedProps {
  searchQuery?: string;
  locationFilter?: string;
  postTypeFilter?: string;
  sortBy?: string;
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Unknown date";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Unknown date";
    }
    return date.toLocaleString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown date";
  }
};

const CommunityFeed = ({
  searchQuery = "",
  locationFilter = "",
  postTypeFilter = "all",
  sortBy = "newest"
}: CommunityFeedProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log("Fetching community feed with filters:", { searchQuery, locationFilter, postTypeFilter, sortBy });
        
        let query = supabase
          .from('posts')
          .select('*')
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
          query = query.order('created_at', { ascending: false });
        }

        const { data: postsData, error: postsError } = await query;
        
        if (postsError) throw postsError;
        
        if (postsData && postsData.length > 0) {
          const postsWithProfiles = await Promise.all(postsData.map(async (post) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', post.user_id)
              .single();
              
            return {
              id: post.id,
              type: post.type,
              title: post.title,
              description: post.description,
              location: post.location,
              category: post.category,
              photos: post.photos,
              user_id: post.user_id,
              user: {
                name: profileData?.name || profileData?.username || "Unknown User",
                avatar: profileData?.avatar || "https://ui-avatars.com/api/?name=User"
              },
              createdAt: formatDate(post.created_at),
              created_at: post.created_at,
              likes: 0,
              comments: 0
            };
          }));
          
          setPosts(postsWithProfiles);
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

  const handlePostClick = (post: Post) => {
    console.log("Post clicked:", post);
    setSelectedPost(post);
    setPostDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
          <span className="ml-2 text-gray-600">Loading posts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
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
    <>
      <div className="max-w-7xl mx-auto p-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {posts.map((post) => (
              <Card 
                key={post.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden border rounded-lg"
                onClick={() => handlePostClick(post)}
              >
                {/* Post Image */}
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  {post.photos && post.photos.length > 0 ? (
                    <img 
                      src={post.photos[0]} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-gray-400 text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-sm">No Image</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Post Type Badge */}
                  <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full ${
                    post.type === 'offer' 
                      ? 'bg-thryvance-green text-white' 
                      : 'bg-thryvance-blue text-white'
                  }`}>
                    {post.type === 'offer' ? 'Offer' : 'Request'}
                  </div>
                  
                  {/* Multiple Photos Indicator */}
                  {post.photos && post.photos.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      +{post.photos.length - 1}
                    </div>
                  )}
                </div>

                <CardContent className="p-3">
                  {/* Price/Title */}
                  <h3 className="font-semibold text-base mb-1 line-clamp-2 text-gray-900">
                    {post.title}
                  </h3>
                  
                  {/* Location */}
                  {post.location && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                      {post.location}
                    </p>
                  )}
                  
                  {/* Category */}
                  {post.category && (
                    <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                      {post.category}
                    </p>
                  )}
                  
                  {/* User Info */}
                  <div className="flex items-center gap-2 mt-2">
                    <img
                      src={post.user.avatar}
                      alt={post.user.name}
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="text-xs text-gray-600 truncate">
                      {post.user.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedPost && (
        <PostDetailDialog
          post={{
            id: selectedPost.id,
            title: selectedPost.title,
            description: selectedPost.description,
            type: selectedPost.type as "offer" | "request",
            category: selectedPost.category,
            location: selectedPost.location,
            created_at: selectedPost.created_at,
            user_id: selectedPost.user_id,
            photos: selectedPost.photos,
            user: selectedPost.user
          }}
          open={postDialogOpen}
          onOpenChange={setPostDialogOpen}
        />
      )}
    </>
  );
};

export default CommunityFeed;
