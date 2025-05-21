
import { useState } from "react";
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

// Sample reviews data
const sampleReviews: Review[] = [
  {
    id: "review1",
    fromUserId: "user456",
    fromUserName: "Emily Chen",
    fromUserAvatar: "https://i.pravatar.cc/150?img=29",
    rating: 5,
    text: "Alex was incredibly helpful with the garden consultation. Their advice on sustainable practices made a huge difference in my garden. Highly recommend!",
    createdAt: new Date(2023, 5, 20)
  },
  {
    id: "review2",
    fromUserId: "user789",
    fromUserName: "Michael Johnson",
    fromUserAvatar: "https://i.pravatar.cc/150?img=68",
    rating: 4,
    text: "Very knowledgeable and patient. Helped me install some fixtures around the house. Would definitely ask for help again!",
    createdAt: new Date(2023, 6, 15)
  },
  {
    id: "review3",
    fromUserId: "user101",
    fromUserName: "Sarah Williams",
    fromUserAvatar: "https://i.pravatar.cc/150?img=47",
    rating: 5,
    text: "Alex went above and beyond when helping with my community project. Their dedication and expertise were truly impressive.",
    createdAt: new Date(2023, 7, 5)
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

interface ReviewsProps {
  user: User;
}

const Reviews = ({ user }: ReviewsProps) => {
  const [reviews] = useState<Review[]>(sampleReviews);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Reviews</CardTitle>
        <CardDescription>
          See what others have said about working with {user.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            No reviews yet. When others leave reviews for {user.name}, they'll appear here.
          </p>
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
