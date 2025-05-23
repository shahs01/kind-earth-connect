
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import MessagesContainer from "@/components/messages/MessagesContainer";
import MessagesAuthRequired from "@/components/messages/MessagesAuthRequired";

const MessagesLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if we're coming from another page with a "new message" action
    const state = location.state as { action?: string; receiverId?: string; receiverName?: string } | null;
    
    if (state?.action === 'newMessage' && state?.receiverId) {
      console.log("New message action detected with receiver:", state.receiverId);
      
      toast({
        title: "Starting new conversation",
        description: state.receiverName 
          ? `You can now send a message to ${state.receiverName}.`
          : "You can now send a message to this user."
      });
      
      // Navigate to the conversation with the receiver
      navigate(`/messages/${state.receiverId}`, { replace: true });
    }
  }, [location, toast, navigate]);
  
  // Show authentication error
  if (!user) {
    return <MessagesAuthRequired />;
  }
  
  return <MessagesContainer />;
};

export default MessagesLayout;
