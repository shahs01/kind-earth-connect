
import { Button } from "@/components/ui/button";
import { seedPosts } from "@/utils/seedPosts";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SeedPostsButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedPosts = async () => {
    setIsLoading(true);
    try {
      await seedPosts();
      toast({
        title: "Posts seeded successfully!",
        description: "Added realistic placeholder posts to the community section.",
      });
    } catch (error) {
      toast({
        title: "Error seeding posts",
        description: "There was an error adding the placeholder posts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSeedPosts} 
      disabled={isLoading}
      className="bg-thryvance-green hover:bg-thryvance-green-dark text-white"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Seed Community Posts
    </Button>
  );
};

export default SeedPostsButton;
