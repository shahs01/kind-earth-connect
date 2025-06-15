
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

interface MobileCommunityFeedProps {
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

const MobileCommunityFeed = ({
  searchQuery = "",
  locationFilter = "",
  postTypeFilter = "all",
  sortBy = "newest"
}: MobileCommunityFeedProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [messageLoading, setMessageLoading] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleMessageClick = useCallback(async (postUserId: string, userName?: string) => {
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
  }, [isAuthenticated, user, toast, navigate]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
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
          const typeValue = postTypeFilter === 'offers' ? 'offer' : 'request';
          query = query.eq('type', typeValue);
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
      <div className="p-4">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
          <span className="ml-2 text-gray-600">Loading posts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
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
      <div className="p-2">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-lg font-semibold text-gray-900">Community Posts</h2>
          {isAuthenticated ? (
            <div className="flex gap-1">
              <Button asChild size="sm" className="bg-thryvance-green hover:bg-thryvance-green-dark text-xs">
                <Link to="/offer-help">Offer</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="border-thryvance-blue text-thryvance-blue text-xs">
                <Link to="/request-help">Request</Link>
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" variant="outline" className="border-thryvance-blue text-thryvance-blue text-xs">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>

        {posts.length === 0 ? (
          <Card className="text-center py-8 mx-2">
            <CardContent>
              <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-700">No posts yet</h3>
              <p className="text-gray-500 mt-1 text-sm">
                {searchQuery || locationFilter || (postTypeFilter !== "all")
                  ? "Try adjusting your filters"
                  : "Be the first to create a post!"}
              </p>
              {isAuthenticated && (
                <div className="mt-4 flex gap-2 justify-center">
                  <Button asChild size="sm" className="bg-thryvance-green hover:bg-thryvance-green-dark">
                    <Link to="/offer-help">Offer Help</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="border-thryvance-blue text-thryvance-blue">
                    <Link to="/request-help">Request Help</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {posts.map((post) => (
              <Card 
                key={post.id} 
                className={`${post.type === 'offer' 
                      ? 'border-l-2 border-thryvance-green' 
                      : 'border-l-2 border-thryvance-blue'} hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => handlePostClick(post)}
              >
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.user.avatar}
                      alt={post.user.name}
                      className="h-6 w-6 rounded-full flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-xs truncate">{post.user.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{post.createdAt}</p>
                    </div>
                  </div>
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full self-start ${
                    post.type === 'offer' 
                      ? 'bg-thryvance-green-light text-thryvance-green' 
                      : 'bg-thryvance-blue-light text-thryvance-blue'
                  }`}>
                    {post.type === 'offer' ? 'Offering' : 'Requesting'}
                  </span>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <h4 className="text-sm font-medium mb-1 line-clamp-2">{post.title}</h4>
                  <p className="text-xs text-gray-700 mb-2 line-clamp-2">{post.description}</p>
                  
                  {/* Display only the first photo if available */}
                  {post.photos && post.photos.length > 0 && (
                    <div className="mb-2">
                      <div className="aspect-[4/3] rounded overflow-hidden bg-gray-100">
                        <img 
                          src={post.photos[0]} 
                          alt="Post preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=Error';
                          }}
                        />
                      </div>
                      {post.photos.length > 1 && (
                        <p className="text-xs text-gray-500 mt-1">+{post.photos.length - 1} more photos</p>
                      )}
                    </div>
                  )}
                  
                  {post.location && (
                    <div className="text-xs text-gray-500 mb-2 truncate">📍 {post.location}</div>
                  )}
                  {post.category && (
                    <div className="mb-2">
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 rounded truncate">
                        {post.category}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 text-xs text-gray-600">
                        <Heart className="h-3 w-3" /> {post.likes}
                      </button>
                      <button className="flex items-center gap-1 text-xs text-gray-600">
                        <MessageSquare className="h-3 w-3" /> {post.comments}
                      </button>
                      <button className="flex items-center gap-1 text-xs text-gray-600">
                        <Share2 className="h-3 w-3" />
                      </button>
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
                          "Contact"
                        )}
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
    </>
  );
};

export default MobileCommunityFeed;
