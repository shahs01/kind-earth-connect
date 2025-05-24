
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";
import { X, Flag, MapPin, Calendar, Star, Check, MessageSquare, StarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import RateUserDialog from "@/components/RateUserDialog";

interface Review {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  rating: number;
  text: string;
  createdAt: Date;
}

interface ProfileDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewFullProfile?: () => void;
}

const ProfileDialog = ({ user, open, onOpenChange, onViewFullProfile }: ProfileDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch reviews for the user
  useEffect(() => {
    const fetchReviews = async () => {
      if (!user || !open) return;
      
      setLoadingReviews(true);
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('to_user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedReviews: Review[] = (data || []).map(review => ({
          id: review.id,
          fromUserId: review.from_user_id,
          fromUserName: review.from_user_name,
          fromUserAvatar: review.from_user_avatar || 'https://ui-avatars.com/api/?name=User',
          rating: review.rating,
          text: review.text || '',
          createdAt: new Date(review.created_at || Date.now())
        }));

        setReviews(mappedReviews);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [user, open, refreshTrigger]);

  const handleConnectClick = () => {
    if (user) {
      navigate(`/messages/${user.id}`);
      onOpenChange(false);
      
      toast({
        title: "Conversation opened",
        description: `You can now message ${user.name || user.username}`
      });
    }
  };

  const handleViewFullProfile = () => {
    if (onViewFullProfile) {
      onViewFullProfile();
    } else if (user) {
      navigate(`/profile/${user.id}`);
      onOpenChange(false);
    }
  };

  const handleReportUser = () => {
    if (user) {
      toast({
        title: "Report submitted",
        description: `We've received your report about ${user.name || user.username}. Our team will review it shortly.`
      });
      onOpenChange(false);
    }
  };

  const handleRateUser = () => {
    setShowRateDialog(true);
  };

  const formatMemberSince = (createdAt: any) => {
    try {
      if (!createdAt) return 'Unknown';
      
      let date;
      
      if (createdAt.value?.iso) {
        date = new Date(createdAt.value.iso);
      } else if (createdAt.iso) {
        date = new Date(createdAt.iso);
      } else if (typeof createdAt === 'string') {
        date = new Date(createdAt);
      } else if (createdAt instanceof Date) {
        date = createdAt;
      } else if (createdAt._type === 'Date' && createdAt.value?.iso) {
        date = new Date(createdAt.value.iso);
      } else {
        console.log('Unhandled date format:', createdAt);
        return 'Unknown';
      }
      
      if (isNaN(date.getTime())) {
        console.log('Invalid date created from:', createdAt);
        return 'Unknown';
      }
      
      return format(date, 'MMM yyyy');
    } catch (error) {
      console.error('Error formatting date:', error, createdAt);
      return 'Unknown';
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Profile Preview</DialogTitle>
            <DialogClose className="absolute right-4 top-4">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Avatar and Basic Info */}
                <div className="space-y-3">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-lg">
                      {user.name?.charAt(0) || user.username?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="text-xl font-semibold">{user.name || user.username}</h3>
                    {user.username && (
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    )}
                    {user.location && (
                      <div className="flex items-center justify-center gap-1 mt-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-1 mt-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {formatMemberSince(user.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-gray-600 text-sm text-center px-2">{user.bio}</p>
                )}

                {/* Trust Score and Status */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {user.verifiedStatus && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-thryvance-green/10 text-thryvance-green-dark border-thryvance-green/20">
                      <Check className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  
                  {user.trustScore !== 5.0 && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-thryvance-blue/10 text-thryvance-blue-dark border-thryvance-blue/20">
                      <Star className="h-3 w-3" />
                      {user.trustScore} Trust Score
                    </Badge>
                  )}
                </div>

                {/* Help Stats */}
                {(user.helpOffered > 0 || user.helpReceived > 0) && (
                  <>
                    <Separator />
                    <div className="w-full grid grid-cols-2 gap-3">
                      <div className="bg-thryvance-green-light/50 p-3 rounded-lg text-center">
                        <p className="text-lg font-bold text-thryvance-green-dark">{user.helpOffered}</p>
                        <p className="text-xs text-gray-600">Help Offered</p>
                      </div>
                      
                      <div className="bg-thryvance-blue-light/50 p-3 rounded-lg text-center">
                        <p className="text-lg font-bold text-thryvance-blue-dark">{user.helpReceived}</p>
                        <p className="text-xs text-gray-600">Help Received</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Reviews Section */}
                <Separator />
                <div className="w-full">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Reviews</h4>
                    {reviews.length > 0 && (
                      <div className="flex items-center gap-1">
                        <StarRating rating={Math.round(parseFloat(calculateAverageRating()))} />
                        <span className="text-sm text-gray-600">({reviews.length})</span>
                      </div>
                    )}
                  </div>
                  
                  {loadingReviews ? (
                    <p className="text-sm text-gray-500">Loading reviews...</p>
                  ) : reviews.length === 0 ? (
                    <p className="text-sm text-gray-500">No reviews yet</p>
                  ) : (
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="text-left p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={review.fromUserAvatar} alt={review.fromUserName} />
                              <AvatarFallback className="text-xs">{review.fromUserName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{review.fromUserName}</span>
                            <StarRating rating={review.rating} />
                          </div>
                          {review.text && (
                            <p className="text-xs text-gray-600 line-clamp-2">{review.text}</p>
                          )}
                        </div>
                      ))}
                      {reviews.length > 3 && (
                        <p className="text-xs text-center text-gray-500">
                          +{reviews.length - 3} more reviews
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="w-full space-y-3">
                  <Button 
                    className="w-full bg-thryvance-green hover:bg-thryvance-green-dark"
                    onClick={handleConnectClick}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message {user.name?.split(" ")[0] || user.username}
                  </Button>
                  
                  {currentUser && currentUser.id !== user.id && (
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={handleRateUser}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Rate & Review
                    </Button>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleViewFullProfile}
                    >
                      View Full Profile
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleReportUser}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* Rate User Dialog */}
      {user && showRateDialog && (
        <RateUserDialog
          user={user}
          open={showRateDialog}
          onOpenChange={setShowRateDialog}
          onReviewSubmitted={() => {
            setRefreshTrigger(prev => prev + 1);
            toast({
              title: "Review submitted",
              description: `Thank you for rating ${user.name || user.username}!`
            });
          }}
        />
      )}
    </>
  );
};

export default ProfileDialog;
