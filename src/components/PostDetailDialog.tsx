
import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2, MapPin, Calendar, User, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  user?: {
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePreviousImage = () => {
    if (post.photos && post.photos.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? post.photos!.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (post.photos && post.photos.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === post.photos!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to favorite posts",
      });
      navigate('/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user?.id);

        if (error) throw error;
        setIsFavorited(false);
        toast({ title: "Removed from favorites" });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            post_id: post.id,
            user_id: user?.id
          });

        if (error) throw error;
        setIsFavorited(true);
        toast({ title: "Added to favorites" });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send messages",
      });
      navigate('/login');
      return;
    }

    if (user?.id === post.user_id) {
      toast({
        title: "Cannot message yourself",
        description: "You cannot send messages to yourself",
      });
      return;
    }

    setMessageLoading(true);
    try {
      // Check if user exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', post.user_id)
        .single();

      if (profileError || !profileData) {
        toast({
          title: "User not found",
          description: "This user no longer exists",
          variant: "destructive"
        });
        return;
      }

      // Navigate to conversation
      navigate(`/messages/${post.user_id}`, {
        state: {
          action: 'newMessage',
          receiverId: post.user_id,
          receiverName: post.user?.name || profileData.name || "User"
        }
      });

      toast({
        title: "Opening conversation",
        description: `Starting conversation with ${post.user?.name || "this user"}`,
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    } finally {
      setMessageLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description || "",
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col md:flex-row h-full">
          {/* Image Section */}
          <div className="md:w-1/2 relative bg-black">
            {post.photos && post.photos.length > 0 ? (
              <>
                <div className="aspect-square relative">
                  <img
                    src={post.photos[currentImageIndex]}
                    alt={`${post.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Image+Not+Available';
                    }}
                  />
                  
                  {/* Navigation arrows */}
                  {post.photos.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={handlePreviousImage}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={handleNextImage}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Image indicators */}
                {post.photos.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {post.photos.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square flex items-center justify-center bg-gray-100">
                <div className="text-gray-400 text-center">
                  <User className="h-16 w-16 mx-auto mb-4" />
                  <span>No Image Available</span>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="md:w-1/2 flex flex-col">
            <DialogHeader className="p-6 border-b">
              <div className="flex items-center justify-between">
                <Badge
                  variant={post.type === 'offer' ? 'outline' : 'default'}
                  className={post.type === 'offer' 
                    ? 'border-thryvance-green text-thryvance-green' 
                    : 'bg-thryvance-blue text-white'
                  }
                >
                  {post.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
                </Badge>
                <DialogTitle className="text-xl font-semibold flex-1 text-center">
                  {post.title}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={post.user?.avatar} alt={post.user?.name} />
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{post.user?.name || "Unknown User"}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(post.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {post.description || "No description provided"}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-6">
                {post.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{post.location}</span>
                  </div>
                )}
                
                {post.category && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t p-6">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                >
                  {favoriteLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className={`mr-2 h-4 w-4 ${isFavorited ? 'fill-current text-rose-500' : ''}`} />
                  )}
                  {isFavorited ? 'Favorited' : 'Favorite'}
                </Button>
                
                {user?.id !== post.user_id && (
                  <Button
                    size="sm"
                    className="flex-1 bg-thryvance-blue hover:bg-thryvance-blue-dark"
                    onClick={handleMessage}
                    disabled={messageLoading}
                  >
                    {messageLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <MessageSquare className="mr-2 h-4 w-4" />
                    )}
                    Message
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailDialog;
