import { useEffect, useState, useCallback } from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useMessages } from "@/hooks/useMessages";
import MessageList from "@/components/MessageList";
import MessageConversation from "@/components/MessageConversation";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Loader2, User as UserIcon, RefreshCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import ProfileDialog from "@/components/ProfileDialog";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { useGlobalMessageNotifications } from "@/hooks/useRealtime";

const NewMessageForm = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      console.log("Searching users with term:", searchTerm);
      // Get current user ID
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error("Authentication error:", authError);
        throw new Error(authError.message);
      }
      
      const currentUserId = authData.session?.user?.id;

      if (!currentUserId) {
        console.warn("No authenticated user found when searching");
        toast({
          title: "Authentication Required",
          description: "Please log in to search for users",
          variant: "destructive"
        });
        return;
      }

      // Search for users
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
        .neq('id', currentUserId || '')
        .limit(10);

      if (error) {
        console.error("Error searching users:", error);
        throw error;
      }

      console.log("Users search results:", data?.length);

      if (data) {
        const formattedUsers: User[] = data.map(user => ({
          id: user.id,
          username: user.username || '',
          email: user.email || '',
          name: user.name || '',
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || '')}`,
          bio: user.bio || '',
          location: user.location || '',
          trustScore: user.trust_score || 0,
          helpOffered: user.help_offered || 0,
          helpReceived: user.help_received || 0,
          volunteerHours: user.volunteer_hours || 0,
          createdAt: new Date(user.created_at || Date.now()),
          verifiedStatus: user.verified_status || false,
          emailVerified: true,
          trustBadges: user.trust_badges || [],
          loginAttempts: 0,
          lastLoginAttempt: null
        }));

        setUsers(formattedUsers);
      }
    } catch (err: any) {
      console.error("Error searching users:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to search users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    console.log("Selected user for new message:", userId);
    navigate(`/messages/${userId}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Input
          placeholder="Search user by name or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
          autoFocus
        />
        {loading && <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />}
      </div>

      {users.length > 0 ? (
        <div className="space-y-3">
          {users.map(user => (
            <div
              key={user.id}
              className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => handleSelectUser(user.id)}
            >
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  <UserIcon className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name}</p>
                {user.username && <p className="text-sm text-gray-500">@{user.username}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : searchTerm.length >= 2 && !loading ? (
        <p className="text-center text-gray-500">No users found</p>
      ) : searchTerm.length === 0 ? (
        <p className="text-center text-gray-500">Type a name or username to search for users</p>
      ) : (
        <p className="text-center text-gray-500">Type at least 2 characters to search</p>
      )}
    </div>
  );
};

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
  
  console.log("Messages component rendering with route:", location.pathname, "userId param:", userId);

  const handleNewMessage = () => {
    console.log("New message received, refreshing conversations");
    fetchConversations();
  };

  const { setupGlobalNotifications, channelRef } = useGlobalMessageNotifications(
    user, 
    handleNewMessage
  );
  
  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is logged in
      if (!user) {
        console.log("User not logged in, redirecting to login");
        navigate('/login');
        return;
      }
      
      // Verify authentication
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        console.error("Auth check failed:", error);
        toast({
          title: "Authentication Error",
          description: "Please log in again to access messages",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }
      
      console.log("Authentication verified, user ID:", data.user.id);
    };
    
    checkAuth();
  }, [navigate, user, toast]);
  
  useEffect(() => {
    if (!user) return;
    
    console.log("Messages component mounted, fetching conversations");
    
    // Fetch conversations when component loads
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
    
    loadConversations();
    
    // Set up real-time subscription for new messages
    setupGlobalNotifications();
    
    return () => {
      console.log("Cleaning up Messages component");
      if (channelRef.current) {
        console.log("Removing channel subscription on component unmount");
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, fetchConversations, setupGlobalNotifications, setConnectionError]);
  
  const handleSelectConversation = (userId: string) => {
    console.log("Selecting conversation with user:", userId);
    navigate(`/messages/${userId}`);
    setIsNewMessageOpen(false);
  };
  
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
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      
      // Reload conversations
      await fetchConversations();
      
      // Set up a new real-time connection
      setupGlobalNotifications();
      
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
          <div className="container mx-auto px-4 text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
            <p className="mb-6">You need to be logged in to view messages</p>
            <Button onClick={() => navigate('/login')}>Log In</Button>
          </div>
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
          <div className="container mx-auto px-4 text-center py-16">
            <div className="text-red-500 mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Connection Error</h3>
            <p className="text-gray-500 mb-4">Unable to load conversations</p>
            <div className="flex justify-center gap-3">
              <Button onClick={handleReconnect} disabled={isReconnecting} className="flex items-center gap-2">
                {isReconnecting ? 
                  <Loader2 className="h-4 w-4 animate-spin" /> : 
                  <RefreshCcw className="h-4 w-4" />
                }
                {isReconnecting ? "Reconnecting..." : "Reconnect"}
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </div>
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
                {/* Conversation List */}
                <div className="md:col-span-1 border-r border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="font-medium text-gray-600">Conversations</h2>
                  </div>
                  
                  {loading && conversations.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-6 w-6 animate-spin text-thryvance-green" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-6 text-center">
                      <MessageSquare className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                      <h3 className="font-medium mb-1">No messages yet</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Start a conversation with someone offering or requesting help
                      </p>
                      <Button onClick={handleOpenNewMessage}>
                        Start a conversation
                      </Button>
                    </div>
                  ) : (
                    <MessageList 
                      conversations={conversations}
                      onSelect={handleSelectConversation}
                      selectedUserId={userId}
                      onViewProfile={handleViewProfile}
                    />
                  )}
                </div>
                
                {/* Message Content Area */}
                <div className="md:col-span-2">
                  <Routes>
                    <Route path=":userId" element={<MessageConversation onViewProfile={handleViewProfile} />} />
                    <Route path="/" element={
                      <div className="h-96 flex flex-col items-center justify-center text-center p-6">
                        <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
                        <p className="text-gray-500">
                          Choose a conversation from the list or start a new one
                        </p>
                      </div>
                    } />
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
