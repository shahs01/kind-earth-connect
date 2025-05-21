
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
import { StarIcon } from "lucide-react";

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
}

const ReviewsGiven = ({ user }: ReviewsGivenProps) => {
  const [reviewsGiven, setReviewsGiven] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviewsGiven = () => {
      // In a real app, this would be an API call
      // For now, we'll check localStorage
      try {
        const reviewsStr = localStorage.getItem('reviews');
        const allReviews = reviewsStr ? JSON.parse(reviewsStr) : [];
        
        // Filter reviews given by this user and parse dates
        const userReviewsGiven = allReviews
          .filter((review: any) => review.fromUserId === user.id)
          .map((review: any) => ({
            ...review,
            createdAt: new Date(review.createdAt)
          }));
        
        setReviewsGiven(userReviewsGiven);
      } catch (error) {
        console.error("Error loading reviews given:", error);
        setReviewsGiven([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviewsGiven();
  }, [user]);

  return (
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
                    <div className="flex items-baseline gap-2">
                      <h4 className="font-medium">You reviewed</h4>
                      <span className="text-sm text-gray-500">
                        {review.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-1">
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="mt-2 text-gray-600">{review.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewsGiven;
