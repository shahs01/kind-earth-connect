
import { Button } from "@/components/ui/button";
import { createTestUsers } from "@/utils/createTestUsers";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreateTestUsersButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const { toast } = useToast();

  const handleCreateUsers = async () => {
    setIsLoading(true);
    setProgress("Starting user creation...");
    
    // Show initial toast
    toast({
      title: "Creating test users...",
      description: "This will take several minutes due to rate limiting. Check the console for detailed progress.",
    });
    
    // Set up interval to update progress from console logs
    const progressInterval = setInterval(() => {
      // This will show some visual feedback that something is happening
      setProgress(prev => prev === "Creating users..." ? "Creating users." : 
                   prev === "Creating users." ? "Creating users.." : "Creating users...");
    }, 1000);
    
    try {
      console.log("Starting test user creation process...");
      const createdUsers = await createTestUsers();
      
      clearInterval(progressInterval);
      
      if (createdUsers.length > 0) {
        toast({
          title: "Test users created!",
          description: `Successfully created ${createdUsers.length} test user accounts. You can now seed posts.`,
        });
        setProgress(`✓ Created ${createdUsers.length} users successfully!`);
      } else {
        toast({
          title: "No users created",
          description: "User creation was blocked by rate limiting. Please try again later or check console for details.",
          variant: "destructive",
        });
        setProgress("❌ No users were created due to rate limiting");
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Error in user creation process:", error);
      toast({
        title: "Error creating test users",
        description: "There was an error creating the test user accounts. Check console for details.",
        variant: "destructive",
      });
      setProgress("❌ Error occurred during user creation");
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(""), 5000);
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleCreateUsers} 
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? "Creating Users..." : "Create 100 Test Users"}
      </Button>
      {progress && (
        <p className="text-sm text-gray-600">{progress}</p>
      )}
    </div>
  );
};

export default CreateTestUsersButton;
