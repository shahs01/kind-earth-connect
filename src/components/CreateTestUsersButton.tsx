
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
    try {
      const createdUsers = await createTestUsers();
      toast({
        title: "Test users created!",
        description: `Successfully created ${createdUsers.length} test user accounts.`,
      });
    } catch (error) {
      toast({
        title: "Error creating test users",
        description: "There was an error creating the test user accounts.",
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
      Create 100 Test Users
    </Button>
  );
};

export default CreateTestUsersButton;
