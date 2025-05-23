
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
import MessageConversation from "@/components/messages/MessageConversation";
import ProfileDialog from "@/components/ProfileDialog";
import MessagesContainer from "@/components/messages/MessagesContainer";
import MessagesAuthRequired from "@/components/messages/MessagesAuthRequired";
import MessagesConnectionError from "@/components/messages/MessagesConnectionError";
import MessagesDialogs from "@/components/messages/MessagesDialogs";
import { Loader2 } from "lucide-react";

const MessagesLayout = () => {
  const { loading, conversations, fetchConversations, connectionError, setConnectionError, loadConversation, clearLocalMessages } = useMessages();
  const navigate = useNavigate();
  const params = useParams();
  const userId = params.userId;
  const location = useLocation();
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { fetchUserProfile } = useAuthProfile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const globalChannelRef = useRef<RealtimeChannel | null>(null);
  const [showLoader, setShowLoader] = useState(true);
  const timerRef = useRef<number | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const previousPathRef = useRef<string>(location.pathname);
  
  // Use a timer to prevent the loading spinner from showing indefinitely
  useEffect(() => {
    if (loading) {
      // Clear any existing timer
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      
      setShowLoader(true);
      
      // Set a maximum timeout for the loading state
      timerRef.current = window.setTimeout(() => {
        setShowLoader(false);
        setInitialLoadComplete(true);
      }, 3000); // 3 seconds maximum loading time
    } else {
      setShowLoader(false);
      setInitialLoadComplete(true);
      
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loading]);
  
  // Detect path changes to reset state when switching conversations
  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      console.log("Path changed from", previousPathRef.current, "to", location.pathname);
      // Clear local messages when path changes
      clearLocalMessages();
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname, clearLocalMessages]);
  
  // Check if we're coming from a post with the direct message intent
  useEffect(() => {
    const state = location.state as { action?: string; receiverId?: string } | null;
    
    if (state?.action === 'newMessage' && state?.receiverId) {
      console.log("Direct message intent detected for user:", state.receiverId);
      
      // Ensure we have a conversation loaded for this user
      if (user) {
        loadConversation(state.receiverId)
          .then(() => {
            console.log("Conversation loaded successfully");
            // Navigate to the messages/{userId} route if not already there
            if (!params.userId) {
              navigate(`/messages/${state.receiverId}`, { replace: true });
            }
          })
          .catch(err => {
            console.error("Error loading conversation:", err);
            toast({
              title: "Error",
              description: "Failed to load conversation. Please try refreshing the page.",
              variant: "destructive"
            });
          });
      }
    }
  }, [location, navigate, user, loadConversation, params, toast]);
  
  const handleNewMessage = useCallback(() => {
    console.log("New message received, refreshing conversations");
    fetchConversations();
  }, [fetchConversations]);

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
  
  // Initial setup when component mounts
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
    
    // Load conversations immediately
    loadConversations();
    
    // Set up real-time subscription for new messages
    const globalChannel = setupGlobalNotifications();
    if (globalChannel) {
      globalChannelRef.current = globalChannel;
    }
    
    return () => {
      console.log("Cleaning up Messages component");
      if (globalChannelRef.current) {
        console.log("Removing channel subscription on component unmount");
        supabase.removeChannel(globalChannelRef.current);
        globalChannelRef.current = null;
      }
    };
  }, [user, fetchConversations, setupGlobalNotifications, setConnectionError]);
  
  // Load specific conversation if userId is provided
  useEffect(() => {
    if (userId && user) {
      console.log("Loading specific conversation for:", userId);
      loadConversation(userId)
        .then(() => {
          console.log("Specific conversation loaded for:", userId);
        })
        .catch(err => {
          console.error("Error loading specific conversation:", err);
        });
    }
  }, [userId, user, loadConversation]);
  
  const handleSelectConversation = useCallback((userId: string) => {
    console.log("Selecting conversation with user:", userId);
    navigate(`/messages/${userId}`);
    setIsNewMessageOpen(false);
  }, [navigate]);
  
  const handleOpenNewMessage = useCallback(() => {
    setIsNewMessageOpen(true);
  }, []);
  
  const handleViewProfile = useCallback(async (userId: string) => {
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
  }, [fetchUserProfile, toast]);

  const handleReconnect = useCallback(async () => {
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
  }, [fetchConversations, setupGlobalNotifications, setConnectionError, toast]);

  // Show authentication error or connection error
  if (!user) {
    return <MessagesAuthRequired />;
  }

  if (connectionError) {
    return <MessagesConnectionError onReconnect={handleReconnect} isReconnecting={isReconnecting} />;
  }
  
  return (
    <>
      <MessagesContainer />
      
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
