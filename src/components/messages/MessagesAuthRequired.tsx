
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const MessagesAuthRequired = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 text-center py-16">
      <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
      <p className="mb-6">You need to be logged in to view messages</p>
      <Button onClick={() => navigate('/login')}>Log In</Button>
    </div>
  );
};

export default MessagesAuthRequired;
