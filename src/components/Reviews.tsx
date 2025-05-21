
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from "lucide-react";
import { User, Review } from "@/types";

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

interface ReviewsProps {
  user: User;
}

const Reviews = ({ user }: ReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = () => {
      // In a real app, this would be an API call
      // For now, we'll check localStorage
      try {
        const reviewsStr = localStorage.getItem('reviews');
        const allReviews = reviewsStr ? JSON.parse(reviewsStr) : [];
        
        // Filter reviews for this user and parse dates
        const userReviews = allReviews
          .filter((review: any) => review.toUserId === user.id)
          .map((review: any) => ({
            ...review,
            createdAt: new Date(review.createdAt)
          }));
        
        setReviews(userReviews);
      } catch (error) {
        console.error("Error loading reviews:", error);
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Reviews</CardTitle>
        <CardDescription>
          See what others have said about working with {user.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 px-6">
            <p className="text-gray-500">
              No reviews yet. When others leave reviews for {user.name}, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-start gap-3 mb-2">
                  <Avatar>
                    <AvatarImage src={review.fromUserAvatar} alt={review.fromUserName} />
                    <AvatarFallback>{review.fromUserName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h4 className="font-medium">{review.fromUserName}</h4>
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

export default Reviews;
