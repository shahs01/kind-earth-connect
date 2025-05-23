
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import MessagesLayout from "@/components/messages/MessagesLayout";

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Update document title
    document.title = "Messages - Thryvance";
    
    // Log page view and location state
    const state = location.state as { action?: string; receiverId?: string } | null;
    console.log("Messages page mounted", {
      locationState: state,
      pathName: location.pathname
    });
    
    return () => {
      console.log("Messages page unmounted");
    };
  }, [location]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-4 md:py-8">
        <MessagesLayout key={location.key} />
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
