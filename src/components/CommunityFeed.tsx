import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Heart, MessageSquare, Share2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PostDetailDialog from "@/components/PostDetailDialog";
import ProfileDialog from "@/components/ProfileDialog";
import { useAuthProfile } from "@/hooks/useAuthProfile";

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
  isFavorited?: boolean;
  favoriteId?: string | null;
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
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [favoritingPost, setFavoritingPost] = useState<string | null>(null);
  const [messageLoading, setMessageLoading] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { fetchUserProfile } = useAuthProfile();

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
        console.log("Fetching community feed with filters:", { searchQuery, locationFilter, postTypeFilter, sortBy });
        
        let query = supabase
          .from('posts')
          .select('*')
          .eq('status', 'active')
          .not('description', 'like', '%Schedule:%'); // Exclude volunteer opportunities
          
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
              
            const formattedPost: Post = {
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

            // Check if user is logged in to get favorite status
            if (user) {
              return await checkFavoriteStatus(formattedPost, user.id);
            }
            
            return formattedPost;
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
  }, [searchQuery, locationFilter, postTypeFilter, sortBy, toast, user, checkFavoriteStatus]);

  const handleMessageClick = async (postUserId: string, userName?: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send messages",
      });
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    if (user?.id === postUserId) {
      toast({
        title: "Cannot message yourself",
        description: "You cannot send messages to yourself",
      });
      return;
    }
    
    // Set loading state for this specific post
    setMessageLoading(postUserId);
    
    try {
      // Show loading toast
      toast({
        title: "Opening conversation",
        description: "Preparing your conversation...",
      });
      
      // First check if user exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', postUserId)
        .maybeSingle();
      
      if (profileError) {
        console.error("Error checking user profile:", profileError);
        throw new Error("Failed to verify user profile");
      }
      
      if (!profileData) {
        toast({
          title: "User not found",
          description: "This user no longer exists",
          variant: "destructive"
        });
        setMessageLoading(null);
        return;
      }
      
      // Generate a welcome message
      const welcomeMessage = `Hello! I'm interested in connecting about your post.`;
      
      // Check if a conversation already exists by looking for any messages
      const { data: existingMessages, error: checkError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${postUserId}),and(sender_id.eq.${postUserId},receiver_id.eq.${user?.id})`)
        .limit(1);
      
      if (checkError) {
        console.error("Error checking for existing conversation:", checkError);
      }
      
      // If no conversation exists, create one with a real welcome message
      if (!existingMessages || existingMessages.length === 0) {
        // Create a real initial message
        const { data: messageData, error: insertError } = await supabase
          .from('messages')
          .insert([{
            receiver_id: postUserId,
            sender_id: user?.id,
            content: welcomeMessage,
            read: false
          }])
          .select();
          
        if (insertError) {
          console.error("Error creating initial message:", insertError);
          throw new Error("Failed to start conversation");
        }
        
        console.log("Created new conversation with message:", messageData);
      } else {
        console.log("Existing conversation found:", existingMessages);
      }
      
      // Give Supabase a moment to process the new message
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to the conversation with the correct state
      navigate(`/messages/${postUserId}`, { 
        state: { 
          action: 'newMessage',
          receiverId: postUserId,
          receiverName: profileData.name || userName || "User"
        },
        replace: true
      });
      
      toast({
        title: "Conversation ready",
        description: `You can now chat with ${profileData.name || userName || "this user"}`,
      });
    } catch (err) {
      console.error("Error initializing conversation:", err);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setMessageLoading(null);
    }
  };

  const handleToggleFavorite = async (post: Post, e: React.MouseEvent) => {
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

  const handlePostClick = (post: Post) => {
    console.log("Post clicked:", post);
    setSelectedPost(post);
    setPostDialogOpen(true);
  };

  const handleUserClick = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening post dialog
    
    if (userId === user?.id) {
      // If it's the current user, navigate to their profile
      navigate(`/profile/${user.id}`);
      return;
    }

    try {
      setProfileLoading(true);
      const userData = await fetchUserProfile(userId);
      setSelectedProfileUser(userData);
      setProfileDialogOpen(true);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Error",
        description: "Could not load user profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProfileLoading(false);
    }
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
                  
                  {/* Favorite Button */}
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
                  
                  {/* Multiple Photos Indicator */}
                  {post.photos && post.photos.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                      +{post.photos.length - 1}
                    </div>
                  )}
                </div>

                <CardContent className="p-3">
                  {/* Title */}
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
                  
                  {/* User Info - Clickable */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.user.avatar}
                        alt={post.user.name}
                        className="h-6 w-6 rounded-full cursor-pointer hover:ring-2 hover:ring-thryvance-blue transition-all"
                        onClick={(e) => handleUserClick(post.user_id, e)}
                      />
                      <span 
                        className="text-xs text-gray-600 truncate cursor-pointer hover:text-thryvance-blue transition-colors"
                        onClick={(e) => handleUserClick(post.user_id, e)}
                      >
                        {post.user.name}
                      </span>
                      {profileLoading && (
                        <div className="animate-spin h-3 w-3 border-2 border-thryvance-green border-t-transparent rounded-full"></div>
                      )}
                    </div>
                    
                    {/* Contact Button */}
                    {isAuthenticated && user?.id !== post.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-thryvance-blue hover:bg-thryvance-blue-light"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMessageClick(post.user_id, post.user.name);
                        }}
                        disabled={messageLoading === post.user_id}
                      >
                        {messageLoading === post.user_id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <MessageSquare className="h-3 w-3 mr-1" />
                        )}
                        {messageLoading === post.user_id ? 'Opening...' : 'Contact'}
                      </Button>
                    )}
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
          onMessageClick={handleMessageClick}
        />
      )}

      {/* Profile Dialog */}
      {selectedProfileUser && (
        <ProfileDialog
          user={selectedProfileUser}
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
          onViewFullProfile={() => {
            navigate(`/profile/${selectedProfileUser.id}`);
            setProfileDialogOpen(false);
          }}
        />
      )}
    </>
  );
};

export default CommunityFeed;
