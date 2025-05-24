import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, MapPin, Calendar, User, Heart } from "lucide-react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PostDetailDialog from "@/components/PostDetailDialog";

interface PostsGridPost {
  id: string;
  title: string;
  description: string | null;
  type: "offer" | "request";
  category: string | null;
  location: string | null;
  created_at: string;
  user_id: string;
  photos?: string[] | null;
  status?: string | null;
  timeframe?: string | null;
  availability?: string | null;
  user: {
    name: string;
    avatar: string;
    username?: string;
  };
  isFavorited?: boolean;
  favoriteId?: string | null;
}

interface PostDetailDialogPost {
  id: string;
  title: string;
  description: string | null;
  type: "offer" | "request";
  category: string | null;
  location: string | null;
  created_at: string;
  user_id: string;
  photos?: string[] | null;
  user: {
    name: string;
    avatar: string;
  };
}

interface PostsGridProps {
  searchQuery?: string;
  categoryFilter?: string;
  locationFilter?: string;
  typeFilter?: "offer" | "request" | null;
  userId?: string;
  sortBy?: string;
  limit?: number;
}

const PostsGrid = ({
  searchQuery = "",
  categoryFilter = "",
  locationFilter = "",
  typeFilter = null,
  userId,
  sortBy = "newest",
  limit
}: PostsGridProps) => {
  const [posts, setPosts] = useState<PostsGridPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostDetailDialogPost | null>(null);
  const [favoritingPost, setFavoritingPost] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Function to check if a post is favorited by the current user
  const checkFavoriteStatus = useCallback(async (post: PostsGridPost, currentUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking favorite status:", error);
        return { ...post, isFavorited: false, favoriteId: null };
      }
      
      return { 
        ...post, 
        isFavorited: !!data, 
        favoriteId: data?.id || null 
      };
    } catch (err) {
      console.error("Error in checkFavoriteStatus:", err);
      return { ...post, isFavorited: false, favoriteId: null };
    }
  }, []);
  
  // Function to add a post to favorites
  const addToFavorites = useCallback(async (postId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          post_id: postId,
          user_id: userId
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      return data.id;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      throw error;
    }
  }, []);
  
  // Function to remove a post from favorites
  const removeFromFavorites = useCallback(async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      throw error;
    }
  }, []);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log("Fetching posts with filters:", { searchQuery, categoryFilter, locationFilter, typeFilter, userId, sortBy, limit });

        // Optimized query - fetch posts with profiles in a single query using joins
        let query = supabase
          .from('posts')
          .select(`
            *,
            profiles!posts_user_id_fkey (
              name,
              avatar,
              username
            )
          `)
          .eq('status', 'active');

        // Apply filters
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }
        
        if (categoryFilter) {
          query = query.eq('category', categoryFilter);
        }
        
        if (locationFilter) {
          query = query.ilike('location', `%${locationFilter}%`);
        }
        
        if (typeFilter) {
          query = query.eq('type', typeFilter);
        }

        if (userId) {
          query = query.eq('user_id', userId);
        }

        // Apply sorting
        if (sortBy === "oldest") {
          query = query.order('created_at', { ascending: true });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        // Apply limit if provided
        if (limit) {
          query = query.limit(limit);
        }

        const { data: postsData, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        console.log("Posts fetched:", postsData?.length);
        
        if (postsData && postsData.length > 0) {
          const formattedPosts: PostsGridPost[] = postsData.map((post) => ({
            ...post,
            type: post.type as "offer" | "request",
            user: {
              name: post.profiles?.name || "Unknown User",
              avatar: post.profiles?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.profiles?.name || 'User')}`,
              username: post.profiles?.username
            }
          }));
          
          // Check favorite status for authenticated users
          if (user) {
            const postsWithFavorites = await Promise.all(
              formattedPosts.map(post => checkFavoriteStatus(post, user.id))
            );
            setPosts(postsWithFavorites);
          } else {
            setPosts(formattedPosts);
          }
        } else {
          setPosts([]);
        }
      } catch (err: any) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts");
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchQuery, categoryFilter, locationFilter, typeFilter, userId, sortBy, limit, toast, user, checkFavoriteStatus]);

  const handleToggleFavorite = async (post: PostsGridPost, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the detail dialog
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required", 
        description: "Please log in to favorite posts"
      });
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    setFavoritingPost(post.id);
    
    try {
      if (post.isFavorited && post.favoriteId) {
        // Remove from favorites
        await removeFromFavorites(post.favoriteId);
        
        // Update local state
        setPosts(prevPosts => prevPosts.map(p => 
          p.id === post.id ? { ...p, isFavorited: false, favoriteId: null } : p
        ));
        
        toast({ title: "Removed from favorites" });
      } else {
        if (!user) {
          throw new Error("User not authenticated");
        }
        
        // Add to favorites
        const favoriteId = await addToFavorites(post.id, user.id);
        
        // Update local state
        setPosts(prevPosts => prevPosts.map(p => 
          p.id === post.id ? { ...p, isFavorited: true, favoriteId } : p
        ));
        
        toast({ title: "Added to favorites" });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast({ 
        title: "Error", 
        description: "Failed to update favorites", 
        variant: "destructive" 
      });
    } finally {
      setFavoritingPost(null);
    }
  };

  const handlePostClick = (post: PostsGridPost) => {
    // Convert PostsGridPost to PostDetailDialogPost format
    const detailPost: PostDetailDialogPost = {
      id: post.id,
      title: post.title,
      description: post.description,
      type: post.type,
      category: post.category,
      location: post.location,
      created_at: post.created_at,
      user_id: post.user_id,
      photos: post.photos,
      user: {
        name: post.user.name,
        avatar: post.user.avatar
      }
    };
    setSelectedPost(detailPost);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
        <span className="ml-2">Loading posts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md my-4 flex items-center">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 inline-block p-5 rounded-full mb-4">
          <AlertCircle className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No posts found</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {searchQuery || categoryFilter || locationFilter || typeFilter ? 
            "Try adjusting your search filters to find more posts." : 
            "There are no posts available right now. Be the first to create one!"}
        </p>
        {isAuthenticated && (
          <div className="flex justify-center gap-3">
            <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark">
              <Link to="/offer-help">Offer Help</Link>
            </Button>
            <Button asChild className="bg-thryvance-blue hover:bg-thryvance-blue-dark">
              <Link to="/request-help">Request Help</Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {posts.map((post) => (
          <Card 
            key={post.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            onClick={() => handlePostClick(post)}
          >
            <div className="relative">
              {/* Post image or placeholder */}
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                {post.photos && post.photos.length > 0 ? (
                  <img 
                    src={post.photos[0]} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
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
                
                {/* Type badge */}
                <Badge 
                  className={`absolute top-2 left-2 ${
                    post.type === 'offer' 
                      ? 'bg-thryvance-green text-white' 
                      : 'bg-thryvance-blue text-white'
                  }`}
                >
                  {post.type === 'offer' ? 'Offer' : 'Request'}
                </Badge>
                
                {/* Favorite button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  onClick={(e) => handleToggleFavorite(post, e)}
                  disabled={favoritingPost === post.id}
                >
                  {favoritingPost === post.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className={`h-4 w-4 ${post.isFavorited ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
                  )}
                </Button>
              </div>
            </div>

            <CardContent className="p-4">
              {/* Title */}
              <h3 className="font-semibold text-base mb-2 line-clamp-2">{post.title}</h3>
              
              {/* Description preview */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {post.description || "No description provided"}
              </p>
              
              {/* Location and category */}
              <div className="space-y-1 mb-3">
                {post.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{post.location}</span>
                  </div>
                )}
                {post.category && (
                  <div className="text-xs">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* User info and date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={post.user?.avatar} alt={post.user?.name} />
                    <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600 truncate max-w-20">
                    {post.user?.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(post.created_at), 'MMM d')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post Detail Dialog */}
      {selectedPost && (
        <PostDetailDialog 
          post={selectedPost} 
          open={!!selectedPost} 
          onOpenChange={() => setSelectedPost(null)}
        />
      )}
    </>
  );
};

export default PostsGrid;
