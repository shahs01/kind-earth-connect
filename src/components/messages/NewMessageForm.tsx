
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default NewMessageForm;
