
import { useState } from "react";
import { toast } from "sonner";
import { StarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, RateUserFormData } from "@/types";

interface RateUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RateUserDialog = ({ user, open, onOpenChange }: RateUserDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    const formData: RateUserFormData = {
      rating,
      review
    };
    
    // In a real app, this would be sent to an API
    console.log("Submitting review:", formData);
    
    // Show success message
    toast.success(`Thank you for rating ${user.name}!`);
    
    // Reset form and close dialog
    setRating(0);
    setReview("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate {user.name}</DialogTitle>
          <DialogDescription>
            Share your experience working with {user.name}. Your feedback helps build trust in our community.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium">Your Rating</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none"
                  >
                    <StarIcon
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="review" className="text-sm font-medium">
                Review (Optional)
              </label>
              <Textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder={`Tell us about your experience with ${user.name}...`}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Review</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RateUserDialog;
