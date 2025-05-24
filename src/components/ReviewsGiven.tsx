
import { useState, useEffect } from "react";
import { Review, User } from "@/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EditReviewDialog from "@/components/EditReviewDialog";

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

interface ReviewsGivenProps {
  user: User;
  refreshTrigger?: number;
}

const ReviewsGiven = ({ user, refreshTrigger }: ReviewsGivenProps) => {
  const [reviewsGiven, setReviewsGiven] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchReviewsGiven = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('from_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedReviews: Review[] = (data || []).map(review => ({
        id: review.id,
        fromUserId: review.from_user_id,
        fromUserName: review.from_user_name,
        fromUserAvatar: review.from_user_avatar || user.avatar,
        toUserId: review.to_user_id,
        rating: review.rating,
        text: review.text || '',
        createdAt: new Date(review.created_at || Date.now())
      }));

      setReviewsGiven(mappedReviews);
    } catch (error) {
      console.error("Error loading reviews given:", error);
      setReviewsGiven([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsGiven();
  }, [user.id, refreshTrigger]);

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditDialogOpen(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully."
      });

      // Refresh the list
      fetchReviewsGiven();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReviewUpdated = () => {
    fetchReviewsGiven();
    setEditDialogOpen(false);
    setEditingReview(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Reviews Given</CardTitle>
          <CardDescription>
            Reviews you've left for other users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Loading reviews...</p>
            </div>
          ) : reviewsGiven.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="text-gray-500">
                You haven't reviewed anyone yet. When you leave reviews for others, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviewsGiven.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 justify-between">
                        <div>
                          <h4 className="font-medium">You reviewed</h4>
                          <span className="text-sm text-gray-500">
                            {review.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditReview(review)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <StarRating rating={review.rating} />
                      </div>
                      {review.text && <p className="mt-2 text-gray-600">{review.text}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingReview && (
        <EditReviewDialog
          review={editingReview}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onReviewUpdated={handleReviewUpdated}
        />
      )}
    </>
  );
};

export default ReviewsGiven;
