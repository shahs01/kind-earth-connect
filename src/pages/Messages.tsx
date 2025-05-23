
import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import MessagesLayout from "@/components/messages/MessagesLayout";
import { useToast } from "@/hooks/use-toast";

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { userId } = useParams(); // Get userId from URL params
  const { toast } = useToast();
  
  useEffect(() => {
    // Update document title
    document.title = "Messages - Thryvance";
    
    // Log page view and location state
    const state = location.state as { action?: string; receiverId?: string; receiverName?: string } | null;
    console.log("Messages page mounted", {
      locationState: state,
      pathName: location.pathname,
      userId: userId
    });
    
    // Show toast for users coming from a post
    if (state?.action === 'newMessage' && state?.receiverId) {
      toast({
        title: "Starting new conversation",
        description: state.receiverName 
          ? `You can now send a message to ${state.receiverName}.`
          : "You can now send a message to this user."
      });
    }
    
    return () => {
      console.log("Messages page unmounted");
    };
  }, [location, toast, userId]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-4 md:py-8">
        <MessagesLayout key={location.key || userId} />
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
