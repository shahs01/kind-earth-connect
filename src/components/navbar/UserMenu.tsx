
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  User, 
  LogOut, 
  Heart, 
  Settings, 
  Bell, 
  ChevronDown,
  MessageSquare,
  FileText,
  Shield
} from "lucide-react";
import NotificationIndicator from "../NotificationIndicator";
import { useAdminCheck } from "@/hooks/useAdmin";

const UserMenu = () => {
  const { user, logout } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();

  console.log("UserMenu: Admin check result", { isAdmin, adminLoading, userId: user?.id });

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  const goToProfile = () => {
    navigate(`/profile/${user?.id}`);
  };

  const goToFavorites = () => {
    navigate("/favorites");
  };

  const goToMessages = () => {
    navigate("/messages");
  };

  const goToNotifications = () => {
    navigate("/notifications");
  };

  const goToUserPosts = () => {
    navigate(`/profile/${user?.id}`, { state: { defaultTab: 'posts' } });
  };

  const goToAdminDashboard = () => {
    console.log("UserMenu: Navigating to admin dashboard");
    navigate("/admin");
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 px-2 flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || ""} />
            <AvatarFallback className="bg-thryvance-blue text-white">
              {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-block text-sm font-medium">
            {user.name || user.email?.split("@")[0] || "User"}
            {isAdmin && !adminLoading && (
              <span className="text-xs text-orange-600 ml-1">(Admin)</span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
          <NotificationIndicator />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          My Account
          {isAdmin && !adminLoading && (
            <span className="text-xs text-orange-600 block">Administrator</span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={goToProfile}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={goToMessages}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Messages</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={goToFavorites}>
            <Heart className="mr-2 h-4 w-4" />
            <span>Favorites</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={goToUserPosts}>
            <FileText className="mr-2 h-4 w-4" />
            <span>My Posts</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={goToNotifications}>
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={goToProfile}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        {isAdmin && !adminLoading && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={goToAdminDashboard} className="text-orange-600">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;

