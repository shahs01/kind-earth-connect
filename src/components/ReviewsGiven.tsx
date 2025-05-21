
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
import { useState } from "react";

// Sample reviews given data
const sampleReviewsGiven: Review[] = [
  {
    id: "reviewGiven1",
    fromUserId: "user123", // Current user's ID
    fromUserName: "Alex Johnson", // Current user's name
    fromUserAvatar: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80",
    rating: 5,
    text: "James was extremely helpful with his gardening advice. He really knows his plants!",
    createdAt: new Date(2023, 4, 5)
  },
  {
    id: "reviewGiven2",
    fromUserId: "user123", // Current user's ID
    fromUserName: "Alex Johnson", // Current user's name
    fromUserAvatar: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80",
    rating: 4,
    text: "Sarah was great with helping me move furniture. Very punctual and strong!",
    createdAt: new Date(2023, 5, 12)
  },
  {
    id: "reviewGiven3",
    fromUserId: "user123", // Current user's ID
    fromUserName: "Alex Johnson", // Current user's name
    fromUserAvatar: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&q=80",
    rating: 5,
    text: "Maria's tutoring helped my son improve his grades significantly. Highly recommended!",
    createdAt: new Date(2023, 6, 20)
  }
];

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
  const [reviewsGiven] = useState<Review[]>(user.reviewsGiven || sampleReviewsGiven);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Reviews Given</CardTitle>
        <CardDescription>
          Reviews you've left for other users
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reviewsGiven.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            You haven't reviewed anyone yet. When you leave reviews for others, they'll appear here.
          </p>
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
