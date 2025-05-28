import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, User, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PostDetailDialogProps {
  post: {
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
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessageClick?: (postUserId: string, userName?: string) => void;
}

const PostDetailDialog = ({ post, open, onOpenChange, onMessageClick }: PostDetailDialogProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!post) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const handleImageModalClose = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    if (post.photos && selectedImageIndex < post.photos.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleContactClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to contact this user",
      });
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    if (user?.id === post.user_id) {
      toast({
        title: "Cannot contact yourself",
        description: "You cannot send messages to yourself",
      });
      return;
    }
    
    if (onMessageClick) {
      onMessageClick(post.user_id, post.user.name);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{post.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Post Type Badge */}
            <Badge 
              className={`${
                post.type === 'offer' 
                  ? 'bg-thryvance-green text-white' 
                  : 'bg-thryvance-blue text-white'
              }`}
            >
              {post.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
            </Badge>

            {/* Images Gallery */}
            {post.photos && post.photos.length > 0 && (
              <div className="space-y-2">
                <div 
                  className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() => handleImageClick(0)}
                >
                  <img 
                    src={post.photos[0]} 
                    alt={post.title}
                    className="w-full h-full object-contain hover:object-cover transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Error+Loading+Image';
                    }}
                  />
                </div>
                
                {/* Thumbnail Gallery */}
                {post.photos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {post.photos.map((photo, index) => (
                      <div 
                        key={index}
                        className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer border-2 border-transparent hover:border-thryvance-blue"
                        onClick={() => handleImageClick(index)}
                      >
                        <img 
                          src={photo} 
                          alt={`${post.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x64?text=Error';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {post.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {post.category && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Category:</span>
                  <Badge variant="outline">{post.category}</Badge>
                </div>
              )}
              
              {post.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{post.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-3">
                <img
                  src={post.user.avatar}
                  alt={post.user.name}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{post.user.name}</p>
                  <p className="text-sm text-gray-500">Posted this {post.type}</p>
                </div>
              </div>
              
              {/* Contact Button - Always show */}
              <Button 
                className="bg-thryvance-green hover:bg-thryvance-green-dark"
                onClick={handleContactClick}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Image Modal */}
      {showImageModal && post.photos && (
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-black/90">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={handleImageModalClose}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Navigation Buttons */}
              {post.photos.length > 1 && (
                <>
                  {selectedImageIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                      onClick={prevImage}
                    >
                      ←
                    </Button>
                  )}
                  
                  {selectedImageIndex < post.photos.length - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                      onClick={nextImage}
                    >
                      →
                    </Button>
                  )}
                </>
              )}

              {/* Full Size Image */}
              <img 
                src={post.photos[selectedImageIndex]} 
                alt={`${post.title} ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Error+Loading+Image';
                }}
              />

              {/* Image Counter */}
              {post.photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {post.photos.length}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PostDetailDialog;
