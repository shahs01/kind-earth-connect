
import { useEffect, useState, useCallback, useRef } from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useMessages } from "@/hooks/useMessages";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { useGlobalMessageNotifications } from "@/hooks/useRealtime";

// Import components
import MessageConversation from "@/components/MessageConversation";
import ProfileDialog from "@/components/ProfileDialog";
import MessagesContainer from "@/components/messages/MessagesContainer";
import MessagesAuthRequired from "@/components/messages/MessagesAuthRequired";
import MessagesConnectionError from "@/components/messages/MessagesConnectionError";
import MessagesDialogs from "@/components/messages/MessagesDialogs";

const MessagesLayout = () => {
  const { loading, conversations, fetchConversations, connectionError, setConnectionError } = useMessages();
  const navigate = useNavigate();
  const params = useParams();
  const userId = params.userId;
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { fetchUserProfile } = useAuthProfile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const globalChannelRef = useRef<RealtimeChannel | null>(null);
  
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
    return <MessagesAuthRequired />;
  }

  if (connectionError) {
    return <MessagesConnectionError onReconnect={handleReconnect} isReconnecting={isReconnecting} />;
  }
  
  return (
    <>
      <MessagesContainer 
        loading={loading}
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        onOpenNewMessage={handleOpenNewMessage}
        onViewProfile={handleViewProfile}
        selectedUserId={userId}
      />
      
      <MessagesDialogs 
        isNewMessageOpen={isNewMessageOpen}
        setIsNewMessageOpen={setIsNewMessageOpen}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        selectedProfile={selectedProfile}
      />
    </>
  );
};

export default MessagesLayout;
