
import { useEffect, useState, useCallback, useRef } from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import { RealtimeChannel } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useMessages } from "@/hooks/useMessages";
import MessageConversation from "@/components/MessageConversation";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import ProfileDialog from "@/components/ProfileDialog";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { useGlobalMessageNotifications } from "@/hooks/useRealtime";

// Import refactored components
import NewMessageForm from "@/components/messages/NewMessageForm";
import MessagesConnectionError from "@/components/messages/MessagesConnectionError";
import MessagesAuthRequired from "@/components/messages/MessagesAuthRequired";
import EmptyConversation from "@/components/messages/EmptyConversation";
import ConversationSidebar from "@/components/messages/ConversationSidebar";

const Messages = () => {
  const { loading, conversations, fetchConversations, connectionError, setConnectionError } = useMessages();
  const navigate = useNavigate();
  const params = useParams();
  const userId = params.userId;
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const { fetchUserProfile } = useAuthProfile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const globalChannelRef = useRef<RealtimeChannel | null>(null);
  
  console.log("Messages component rendering with route:", location.pathname, "userId param:", userId);

  const handleNewMessage = () => {
    console.log("New message received, refreshing conversations");
    fetchConversations();
  };

  const { setupGlobalNotifications, isConnecting, channel } = useGlobalMessageNotifications(
    user, 
    handleNewMessage
  );
  
  // Update the ref when channel changes
  useEffect(() => {
    if (channel) {
      globalChannelRef.current = channel;
    }
  }, [channel]);
  
  useEffect(() => {
    if (!user) return;
    
    // Optimize by using a lazy loading strategy
    const loadConversations = async () => {
      try {
        console.log("Fetching conversations for user:", user.id);
        await fetchConversations();
        console.log("Conversations fetched successfully");
        setConnectionError(false);
      } catch (err) {
        console.error("Error loading conversations:", err);
        setConnectionError(true);
      }
    };
    
    // Add a small timeout to prevent UI from freezing during navigation
    const timer = setTimeout(() => {
      loadConversations();
    }, 100);
    
    // Set up real-time subscription for new messages
    const globalChannel = setupGlobalNotifications();
    if (globalChannel) {
      globalChannelRef.current = globalChannel;
    }
    
    return () => {
      clearTimeout(timer);
      console.log("Cleaning up Messages component");
      if (globalChannelRef.current) {
        console.log("Removing channel subscription on component unmount");
        supabase.removeChannel(globalChannelRef.current);
        globalChannelRef.current = null;
      }
    };
  }, [user, fetchConversations, setupGlobalNotifications, setConnectionError]);
  
  const handleSelectConversation = useCallback((userId: string) => {
    console.log("Selecting conversation with user:", userId);
    navigate(`/messages/${userId}`);
    setIsNewMessageOpen(false);
  }, [navigate]);
  
  const handleOpenNewMessage = () => {
    setIsNewMessageOpen(true);
  };
  
  const handleViewProfile = async (userId: string) => {
    try {
      console.log("Viewing profile of user:", userId);
      const profileData = await fetchUserProfile(userId);
      setSelectedProfile(profileData);
      setIsProfileOpen(true);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    }
  };

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      // Remove existing channel
      if (globalChannelRef.current) {
        supabase.removeChannel(globalChannelRef.current);
        globalChannelRef.current = null;
      }
      
      // Reload conversations
      await fetchConversations();
      
      // Set up a new real-time connection
      const newChannel = setupGlobalNotifications();
      if (newChannel) {
        globalChannelRef.current = newChannel;
      }
      
      toast({
        title: "Reconnected",
        description: "Successfully reconnected to the messaging service",
      });
      
      setConnectionError(false);
    } catch (err) {
      console.error("Error reconnecting:", err);
      toast({
        title: "Reconnection failed",
        description: "Please try again or reload the page",
        variant: "destructive"
      });
    } finally {
      setIsReconnecting(false);
    }
  };

  // Show authentication error or connection error
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 bg-gray-50">
          <MessagesAuthRequired />
        </main>
        <Footer />
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8 bg-gray-50">
          <MessagesConnectionError 
            onReconnect={handleReconnect}
            isReconnecting={isReconnecting}
          />
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Messages</h1>
              <Button onClick={handleOpenNewMessage}>
                <Plus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Conversation Sidebar */}
                <ConversationSidebar 
                  conversations={conversations}
                  loading={loading}
                  onSelect={handleSelectConversation}
                  selectedUserId={userId}
                  onViewProfile={handleViewProfile}
                  onOpenNewMessage={handleOpenNewMessage}
                />
                
                {/* Message Content Area */}
                <div className="md:col-span-2">
                  <Routes>
                    <Route path=":userId" element={<MessageConversation onViewProfile={handleViewProfile} />} />
                    <Route path="/" element={<EmptyConversation />} />
                  </Routes>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* New Message Dialog */}
      <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <NewMessageForm />
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      {selectedProfile && (
        <ProfileDialog 
          user={selectedProfile}
          open={isProfileOpen}
          onOpenChange={setIsProfileOpen}
        />
      )}
    </div>
  );
};

export default Messages;
