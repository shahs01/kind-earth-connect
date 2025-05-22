
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useMessages, Conversation } from "@/hooks/useMessages";
import MessageList from "@/components/MessageList";
import MessageConversation from "@/components/MessageConversation";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Loader2, User as UserIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      // Get current user ID
      const { data: authData } = await supabase.auth.getSession();
      const currentUserId = authData.session?.user?.id;

      // Search for users
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
        .neq('id', currentUserId || '')
        .limit(10);

      if (error) throw error;

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
    } catch (err) {
      console.error("Error searching users:", err);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
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
  const { loading, conversations, fetchConversations } = useMessages();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  
  useEffect(() => {
    fetchConversations();
  }, []);
  
  const handleSelectConversation = (userId: string) => {
    navigate(`/messages/${userId}`);
    setIsNewMessageOpen(false);
  };
  
  const handleNewMessage = () => {
    setIsNewMessageOpen(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Messages</h1>
              <Button onClick={handleNewMessage}>
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
                      <Button onClick={handleNewMessage}>
                        Start a conversation
                      </Button>
                    </div>
                  ) : (
                    <MessageList 
                      conversations={conversations}
                      onSelect={handleSelectConversation}
                      selectedUserId={userId}
                    />
                  )}
                </div>
                
                {/* Message Content Area */}
                <div className="md:col-span-2">
                  <Routes>
                    <Route path="/:userId" element={<MessageConversation />} />
                    <Route path="/new" element={
                      <div className="h-96 flex flex-col items-center justify-center text-center p-6">
                        <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium mb-2">Start a new conversation</h3>
                        <p className="text-gray-500 mb-4">
                          Search for a user to start messaging with
                        </p>
                        <Button onClick={handleNewMessage}>
                          Find someone to message
                        </Button>
                      </div>
                    } />
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

      <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
            <DialogDescription>
              Search for a user to start a conversation
            </DialogDescription>
          </DialogHeader>
          <NewMessageForm />
          <DialogClose className="absolute top-4 right-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;
