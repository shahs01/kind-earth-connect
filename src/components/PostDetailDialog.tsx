
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2, MapPin, Calendar, ChevronLeft, ChevronRight, User as UserIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import ProfileDialog from "@/components/ProfileDialog";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { useFavorites } from "@/hooks/useFavorites";

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
  user: {
    name: string;
    avatar: string;
  };
}

interface PostDetailDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PostDetailDialog = ({ post, open, onOpenChange }: PostDetailDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchUserProfile } = useAuthProfile();
  const { isFavorited, addFavorite, removeFavorite, getFavoriteId } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isFullScreenProfile, setIsFullScreenProfile] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [postIsFavorited, setPostIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [favoritingInProgress, setFavoritingInProgress] = useState(false);

  // Check if post is favorited when dialog opens
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && open) {
        const favorited = await isFavorited(post.id);
        setPostIsFavorited(favorited);
        if (favorited) {
          const id = await getFavoriteId(post.id);
          setFavoriteId(id);
        }
      }
    };
    
    checkFavoriteStatus();
  }, [user, open, post.id, isFavorited, getFavoriteId]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Authentication Required", 
        description: "Please log in to favorite posts"
      });
      navigate('/login');
      return;
    }
    
    setFavoritingInProgress(true);
    
    try {
      if (postIsFavorited && favoriteId) {
        // Remove from favorites
        const success = await removeFavorite(favoriteId);
        if (success) {
          setPostIsFavorited(false);
          setFavoriteId(null);
          toast({ title: "Removed from favorites" });
        }
      } else {
        // Add to favorites
        const success = await addFavorite(post.id);
        if (success) {
          setPostIsFavorited(true);
          const id = await getFavoriteId(post.id);
          setFavoriteId(id);
          toast({ title: "Added to favorites" });
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast({ 
        title: "Error", 
        description: "Failed to update favorites", 
        variant: "destructive" 
      });
    } finally {
      setFavoritingInProgress(false);
    }
  };

  const handleUserClick = async () => {
    if (post.user_id === user?.id) {
      // If it's the current user's post, navigate to their own profile
      navigate(`/profile/${user.id}`);
      onOpenChange(false);
      return;
    }

    if (profileLoading) return; // Prevent multiple clicks while loading

    try {
      setProfileLoading(true);
      const userData = await fetchUserProfile(post.user_id);
      setProfileUser(userData);
      setIsFullScreenProfile(false);
      setIsProfileDialogOpen(true);
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

  const handleViewFullProfile = () => {
    setIsFullScreenProfile(true);
  };

  const handleMessageUser = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to send messages",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    navigate(`/messages/${post.user_id}`);
    onOpenChange(false);
    
    toast({
      title: "Conversation opened",
      description: `You can now message ${post.user.name}`
    });
  };

  const handleShare = () => {
    navigator.share?.({
      title: post.title,
      text: post.description || "",
      url: window.location.href
    }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard"
      });
    });
  };

  const nextImage = () => {
    if (post.photos && post.photos.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % post.photos.length);
    }
  };

  const prevImage = () => {
    if (post.photos && post.photos.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + post.photos.length) % post.photos.length);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP 'at' p");
    } catch {
      return "Unknown date";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left">Post Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* User Info - Clickable */}
            <button 
              className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left ${
                profileLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              onClick={handleUserClick}
              disabled={profileLoading}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.user.avatar} alt={post.user.name} />
                <AvatarFallback>
                  <UserIcon className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg hover:text-thryvance-blue transition-colors">
                  {post.user.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(post.created_at)}
                </p>
              </div>
              {profileLoading && (
                <div className="ml-auto">
                  <div className="animate-spin h-4 w-4 border-2 border-thryvance-green border-t-transparent rounded-full"></div>
                </div>
              )}
            </button>

            {/* Post Type Badge */}
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${
                  post.type === 'offer' 
                    ? 'bg-thryvance-green text-white border-thryvance-green' 
                    : 'bg-thryvance-blue text-white border-thryvance-blue'
                }`}
              >
                {post.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
              </Badge>
              {post.category && (
                <Badge variant="secondary">{post.category}</Badge>
              )}
            </div>

            {/* Title and Description */}
            <div>
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              {post.description && (
                <p className="text-gray-700 leading-relaxed">{post.description}</p>
              )}
            </div>

            {/* Location */}
            {post.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{post.location}</span>
              </div>
            )}

            {/* Images */}
            {post.photos && post.photos.length > 0 && (
              <div className="relative">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={post.photos[currentImageIndex]} 
                    alt={`${post.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                    }}
                  />
                </div>
                
                {post.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {post.photos.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex gap-4">
                <button 
                  onClick={handleToggleFavorite}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                  disabled={favoritingInProgress}
                >
                  {favoritingInProgress ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart className={`h-5 w-5 ${postIsFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  )}
                  <span className="text-sm">{postIsFavorited ? 'Liked' : 'Like'}</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 text-gray-600 hover:text-thryvance-blue transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
              
              {post.user_id !== user?.id && (
                <Button 
                  onClick={handleMessageUser}
                  className="bg-thryvance-green hover:bg-thryvance-green-dark"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message {post.user.name.split(" ")[0]}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      {profileUser && (
        <ProfileDialog
          user={profileUser}
          open={isProfileDialogOpen}
          onOpenChange={setIsProfileDialogOpen}
          onViewFullProfile={handleViewFullProfile}
          isFullScreen={isFullScreenProfile}
        />
      )}
    </>
  );
};

export default PostDetailDialog;
