import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, Calendar, User, Heart, MessageSquare, Share2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import ProfileDialog from "@/components/ProfileDialog";

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

interface PostDetailDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PostDetailDialog = ({ post, open, onOpenChange }: PostDetailDialogProps) => {
  const [messageLoading, setMessageLoading] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(post.isFavorited || false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addFavorite, removeFavorite, getFavoriteId } = useFavorites();

  const handleUserNameClick = async () => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', post.user_id)
        .single();

      if (error || !profileData) {
        toast({
          title: "Error",
          description: "Could not load user profile",
          variant: "destructive"
        });
        return;
      }

      setProfileUser({
        id: profileData.id,
        name: profileData.name,
        username: profileData.username,
        email: profileData.email,
        avatar: profileData.avatar,
        bio: profileData.bio,
        location: profileData.location,
        trustScore: profileData.trust_score,
        helpOffered: profileData.help_offered,
        helpReceived: profileData.help_received,
        volunteerHours: profileData.volunteer_hours,
        verifiedStatus: profileData.verified_status,
        trustBadges: profileData.trust_badges,
        createdAt: profileData.created_at
      });
      setProfileDialogOpen(true);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      toast({
        title: "Error",
        description: "Could not load user profile",
        variant: "destructive"
      });
    }
  };

  const handleViewFullProfile = () => {
    onOpenChange(false);
    setProfileDialogOpen(false);
    navigate(`/profile/${post.user_id}`);
  };

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add favorites",
      });
      navigate('/login');
      return;
    }

    setFavoriteLoading(true);
    
    try {
      if (isFavorited) {
        // Remove from favorites
        const favoriteId = await getFavoriteId(post.id);
        if (favoriteId) {
          const success = await removeFavorite(favoriteId);
          if (success) {
            setIsFavorited(false);
          }
        }
      } else {
        // Add to favorites
        const success = await addFavorite(post.id);
        if (success) {
          setIsFavorited(true);
        }
      }
    } catch (error) {
      console.error("Error handling favorite:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleMessageClick = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send messages",
      });
      navigate('/login', { state: { from: window.location.pathname } });
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
      toast({
        title: "Opening conversation",
        description: "Preparing your conversation...",
      });
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', post.user_id)
        .maybeSingle();
      
      if (profileError || !profileData) {
        toast({
          title: "User not found",
          description: "This user no longer exists",
          variant: "destructive"
        });
        return;
      }
      
      const welcomeMessage = `Hello! I'm interested in your post: "${post.title}"`;
      
      const { data: existingMessages } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${post.user_id}),and(sender_id.eq.${post.user_id},receiver_id.eq.${user?.id})`)
        .limit(1);
      
      if (!existingMessages || existingMessages.length === 0) {
        const { error: insertError } = await supabase
          .from('messages')
          .insert([{
            receiver_id: post.user_id,
            sender_id: user?.id,
            content: welcomeMessage,
            read: false
          }]);
          
        if (insertError) {
          throw new Error("Failed to start conversation");
        }
      }
      
      onOpenChange(false);
      navigate(`/messages/${post.user_id}`, { 
        state: { 
          action: 'newMessage',
          receiverId: post.user_id,
          receiverName: post.user?.name || "User"
        },
        replace: true
      });
      
      toast({
        title: "Conversation ready",
        description: `You can now chat with ${post.user?.name || "this user"}`,
      });
    } catch (err) {
      console.error("Error initializing conversation:", err);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setMessageLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{post.title}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column - Images */}
            <div className="space-y-4">
              {post.photos && post.photos.length > 0 ? (
                <div className="relative">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {post.photos.map((photo, index) => (
                        <CarouselItem key={index}>
                          <div className="aspect-video rounded-lg overflow-hidden">
                            <img 
                              src={photo} 
                              alt={`Photo ${index + 1} for ${post.title}`} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+Not+Available';
                              }}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {post.photos.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                      </>
                    )}
                  </Carousel>
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">No images available</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Badge 
                  variant={post.type === 'offer' ? 'outline' : 'default'}
                  className={post.type === 'offer' 
                    ? 'border-thryvance-green text-thryvance-green bg-thryvance-green-light' 
                    : 'bg-thryvance-blue text-white'
                  }
                >
                  {post.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
                </Badge>
                {post.category && (
                  <Badge variant="secondary">{post.category}</Badge>
                )}
              </div>
            </div>

            {/* Right column - Details and Description */}
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {post.description || "No description provided"}
                </p>
              </div>

              <div className="space-y-3">
                {post.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{post.location}</span>
                  </div>
                )}
                {post.timeframe && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Timeframe: {post.timeframe}</span>
                  </div>
                )}
                {post.availability && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Available: {post.availability}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Posted: {format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.user?.avatar} alt={post.user?.name} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div>
                    <button 
                      onClick={handleUserNameClick}
                      className="font-medium hover:text-thryvance-blue cursor-pointer"
                    >
                      {post.user?.name || "Unknown User"}
                    </button>
                    <p className="text-sm text-gray-500">
                      Posted {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`flex items-center gap-1 ${isFavorited ? 'text-red-500' : ''}`}
                    onClick={handleFavoriteClick}
                    disabled={favoriteLoading}
                  >
                    {favoriteLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                    )}
                    {isFavorited ? 'Favorited' : 'Favorite'}
                  </Button>
                  
                  {user?.id !== post.user_id && (
                    <Button 
                      size="sm" 
                      className="bg-thryvance-blue hover:bg-thryvance-blue-dark"
                      onClick={handleMessageClick}
                      disabled={messageLoading}
                    >
                      {messageLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Opening...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ProfileDialog 
        user={profileUser}
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        onViewFullProfile={handleViewFullProfile}
      />
    </>
  );
};

export default PostDetailDialog;
