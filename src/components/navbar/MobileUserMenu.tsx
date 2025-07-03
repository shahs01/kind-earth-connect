
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAdminCheck } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { 
  User, 
  LogOut, 
  Heart, 
  Settings, 
  Bell, 
  MessageSquare,
  FileText,
  Shield,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface MobileUserMenuProps {
  handleLinkClick: () => void;
}

const MobileUserMenu = ({ handleLinkClick }: MobileUserMenuProps) => {
  const { user, logout } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSignOut = async () => {
    await logout();
    handleLinkClick();
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!user) return null;

  return (
    <div className="space-y-2">
      {/* My Account Header - Clickable to expand/collapse */}
      <Button
        variant="ghost"
        className="w-full justify-between text-gray-700 hover:bg-gray-100 px-3"
        onClick={toggleExpanded}
      >
        <div className="flex items-center">
          <User className="mr-3 h-4 w-4" />
          My Account
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {/* Expanded Menu Items */}
      {isExpanded && (
        <div className="pl-4 space-y-2">
          <Link
            to={`/profile/${user?.id}`}
            className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={handleLinkClick}
          >
            <User className="mr-3 h-4 w-4" />
            Profile
          </Link>
          <Link
            to="/messages"
            className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={handleLinkClick}
          >
            <MessageSquare className="mr-3 h-4 w-4" />
            Messages
          </Link>
          <Link
            to="/favorites"
            className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={handleLinkClick}
          >
            <Heart className="mr-3 h-4 w-4" />
            Favorites
          </Link>
          <Link
            to={`/profile/${user?.id}`}
            state={{ defaultTab: 'posts' }}
            className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={handleLinkClick}
          >
            <FileText className="mr-3 h-4 w-4" />
            My Posts
          </Link>
          <Link
            to="/notifications"
            className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={handleLinkClick}
          >
            <Bell className="mr-3 h-4 w-4" />
            Notifications
          </Link>
          <Link
            to={`/profile/${user?.id}`}
            className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={handleLinkClick}
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Link>
          
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center py-2 px-3 rounded-md text-orange-600 hover:bg-gray-100 transition-colors"
              onClick={handleLinkClick}
            >
              <Shield className="mr-3 h-4 w-4" />
              Admin Panel
            </Link>
          )}

          <Separator className="my-2" />
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
            onClick={handleSignOut}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Log out
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileUserMenu;
