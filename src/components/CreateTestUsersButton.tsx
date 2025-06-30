
import { Button } from "@/components/ui/button";
import { createTestUsers } from "@/utils/createTestUsers";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreateTestUsersButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateUsers = async () => {
    setIsLoading(true);
    
    // Show initial toast
    toast({
      title: "Creating test users...",
      description: "This may take a few minutes due to rate limiting. Check the console for progress.",
    });
    
    try {
      console.log("Starting test user creation process...");
      const createdUsers = await createTestUsers();
      
      if (createdUsers.length > 0) {
        toast({
          title: "Test users created!",
          description: `Successfully created ${createdUsers.length} test user accounts. Check console for details.`,
        });
      } else {
        toast({
          title: "No users created",
          description: "User creation was blocked by rate limiting. Try again later or check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in user creation process:", error);
      toast({
        title: "Error creating test users",
        description: "There was an error creating the test user accounts. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateUsers} 
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? "Creating Users..." : "Create 100 Test Users"}
    </Button>
  );
};

export default CreateTestUsersButton;
