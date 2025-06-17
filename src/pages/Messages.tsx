
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import MessagesLayout from "@/components/messages/MessagesLayout";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Messages = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Update document title
    document.title = "Messages - Thryvance";
    
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

  // Show loading state while authentication is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-gray-50 py-2 md:py-8 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
            <span className="text-gray-600">Loading...</span>
          </div>
        </main>
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-2 md:py-8">
        <MessagesLayout />
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default Messages;
