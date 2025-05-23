
import { useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import MessagesLayout from "@/components/messages/MessagesLayout";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { userId } = useParams(); // Get userId from URL params
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Update document title
    document.title = "Messages - Thryvance";
    
    // Log page view and location state
    const state = location.state as { action?: string; receiverId?: string; receiverName?: string } | null;
    console.log("Messages page mounted", {
      locationState: state,
      pathName: location.pathname,
      userId: userId,
      hasUser: !!user
    });
    
    // Show toast for users coming from a post
    if (state?.action === 'newMessage' && state?.receiverId) {
      console.log("New message action detected with receiver:", state.receiverId);
      
      toast({
        title: "Starting new conversation",
        description: state.receiverName 
          ? `You can now send a message to ${state.receiverName}.`
          : "You can now send a message to this user."
      });
      
      // If we have a receiverId but no userId in the URL, redirect
      if (!userId && state.receiverId) {
        console.log("Redirecting to correct conversation URL");
        navigate(`/messages/${state.receiverId}`, { replace: true });
      }
    }
    
    // If not authenticated, redirect to login
    if (!user) {
      console.log("User not authenticated, will show auth required state");
    }
    
    return () => {
      console.log("Messages page unmounted");
    };
  }, [location, toast, userId, user, navigate]);
  
  // If no user is logged in, show login prompt
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-50 py-4 md:py-8 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-medium mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access your messages.</p>
            <button 
              onClick={() => navigate('/login', { state: { from: location.pathname } })}
              className="bg-thryvance-green text-white px-6 py-2 rounded-md hover:bg-thryvance-green/90"
            >
              Log In
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-4 md:py-8">
        <MessagesLayout key={location.key || userId || 'default'} />
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
