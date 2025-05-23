
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import MessagesLayout from "@/components/messages/MessagesLayout";

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  console.log("Messages component rendering with route:", location.pathname);
  
  useEffect(() => {
    // Update document title
    document.title = "Messages - Thryvance";
    
    // Log page view
    console.log("Messages page mounted");
    
    return () => {
      console.log("Messages page unmounted");
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 bg-gray-50">
        <MessagesLayout />
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
