
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, User, Heart, MessageSquare, Share2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
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
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      
      // Check if user exists
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
      
      // Generate a welcome message
      const welcomeMessage = `Hello! I'm interested in your post: "${post.title}"`;
      
      // Check if a conversation already exists
      const { data: existingMessages } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${post.user_id}),and(sender_id.eq.${post.user_id},receiver_id.eq.${user?.id})`)
        .limit(1);
      
      // If no conversation exists, create one
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
      
      // Close dialog and navigate
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{post.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Post images */}
          {post.photos && post.photos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {post.photos.map((photo, index) => (
                <div key={index} className="aspect-video rounded-lg overflow-hidden">
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
          )}

          {/* Post type badge */}
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

          {/* Description */}
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">
              {post.description || "No description provided"}
            </p>
          </div>

          {/* Post details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* User info and actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={post.user?.avatar} alt={post.user?.name} />
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{post.user?.name || "Unknown User"}</h4>
                <p className="text-sm text-gray-500">
                  Posted {format(new Date(post.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-1"
              >
                <Heart className="h-4 w-4" />
                Favorite
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
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailDialog;
