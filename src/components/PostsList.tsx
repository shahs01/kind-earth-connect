
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, MessageSquare, Heart, Share2, MapPin, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PostActionMenu from "@/components/PostActionMenu";

interface Post {
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
  user?: {
    name: string;
    avatar: string;
    username?: string;
  }
  isFavorited?: boolean;
  favoriteId?: string | null;
}

interface PostsListProps {
  searchQuery?: string;
  categoryFilter?: string;
  locationFilter?: string;
  typeFilter?: "offer" | "request" | null;
  userId?: string;
  sortBy?: string;
  limit?: number;
}

const PostsList = ({
  searchQuery = "",
  categoryFilter = "",
  locationFilter = "",
  typeFilter = null,
  userId,
  sortBy = "newest",
  limit
}: PostsListProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoritingPost, setFavoritingPost] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Function to check if a post is favorited by the current user
  const checkFavoriteStatus = useCallback(async (post: Post, currentUserId: string) => {
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

        let query = supabase
          .from('posts')
          .select('*')
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
          // Default to newest first
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
        
        // Fetch user information separately for each post
        if (postsData && postsData.length > 0) {
          const formattedPostsPromises = postsData.map(async (post) => {
            // Get user data
            const { data: userData } = await supabase
              .from('profiles')
              .select('name, avatar, username')
              .eq('id', post.user_id)
              .maybeSingle();
            
            const typedPost: Post = {
              ...post,
              type: post.type as "offer" | "request",
              user: userData ? {
                name: userData.name || "Unknown User",
                avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}`,
                username: userData.username
              } : {
                name: "Unknown User",
                avatar: "https://ui-avatars.com/api/?name=Unknown"
              }
            };
            
            // Check if user is logged in to get favorite status
            if (user) {
              return await checkFavoriteStatus(typedPost, user.id);
            }
            
            return typedPost;
          });
          
          const formattedPosts = await Promise.all(formattedPostsPromises);
          console.log("Formatted posts with favorite info:", formattedPosts.length);
          setPosts(formattedPosts);
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

  const handleMessageClick = (postUserId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send messages",
      });
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // Navigate directly to the conversation with the post creator
    navigate(`/messages/${postUserId}`, { 
      state: { 
        action: 'newMessage',
        receiverId: postUserId
      } 
    });
  };
  
  const handleToggleFavorite = async (post: Post) => {
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
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden shadow-md">
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={post.user?.avatar} alt={post.user?.name} />
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-900">{post.user?.name}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(post.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={post.type === 'offer' ? 'outline' : 'default'}
                  className={post.type === 'offer' 
                    ? 'border-thryvance-green text-thryvance-green' 
                    : 'bg-thryvance-blue text-white'
                  }
                >
                  {post.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
                </Badge>
                {user && post.user_id === user.id && (
                  <PostActionMenu 
                    postId={post.id} 
                    onDeleted={() => {
                      setPosts(posts.filter(p => p.id !== post.id));
                    }} 
                  />
                )}
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-700 mb-4 whitespace-pre-line">{post.description}</p>

            {post.photos && post.photos.length > 0 && (
              <div className="mb-4">
                <div className="flex overflow-x-auto space-x-2 py-2">
                  {post.photos.map((photo, index) => (
                    <div key={index} className="flex-shrink-0 w-48 h-32 rounded overflow-hidden">
                      <img 
                        src={photo} 
                        alt={`Photo ${index + 1} for ${post.title}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4 mb-4">
              {post.category && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                  {post.category}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              {post.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {post.location}
                </div>
              )}
              {post.timeframe && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {post.timeframe}
                </div>
              )}
              {post.availability && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {post.availability}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center ${post.isFavorited ? 'text-rose-500' : 'text-gray-500'}`}
                  onClick={() => handleToggleFavorite(post)}
                  disabled={favoritingPost === post.id}
                >
                  {favoritingPost === post.id ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className={`mr-1 h-4 w-4 ${post.isFavorited ? 'fill-current' : ''}`} />
                  )}
                  <span>{post.isFavorited ? 'Favorited' : 'Favorite'}</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center text-gray-500"
                  onClick={() => user?.id !== post.user_id && handleMessageClick(post.user_id)}
                  disabled={user?.id === post.user_id}
                >
                  <MessageSquare className="mr-1 h-4 w-4" />
                  <span>Message</span>
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center text-gray-500"
              >
                <Share2 className="mr-1 h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PostsList;
