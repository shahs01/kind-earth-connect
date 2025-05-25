
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { 
  User, 
  LogOut, 
  Heart, 
  Settings, 
  Bell, 
  MessageSquare,
  FileText,
  Shield
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface MobileMenuProps {
  isActive: (path: string) => boolean;
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const MobileMenu = ({ isActive, isMenuOpen, toggleMenu }: MobileMenuProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { checkIfAdmin } = useAdmin();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await checkIfAdmin();
        setIsAdmin(adminStatus);
      }
    };
    
    checkAdminStatus();
  }, [user, checkIfAdmin]);

  const handleSignOut = async () => {
    await logout();
    toggleMenu();
  };

  const handleLinkClick = () => {
    toggleMenu();
  };

  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-4">
        {/* Navigation Links */}
        <div className="space-y-2 mb-4">
          <Link
            to="/community"
            className={`block py-2 px-3 rounded-md transition-colors ${
              isActive("/community")
                ? "bg-thryvance-green text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={handleLinkClick}
          >
            Community
          </Link>
          <Link
            to="/volunteer"
            className={`block py-2 px-3 rounded-md transition-colors ${
              isActive("/volunteer")
                ? "bg-thryvance-green text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={handleLinkClick}
          >
            Volunteer
          </Link>
          <Link
            to="/nonprofit-directory"
            className={`block py-2 px-3 rounded-md transition-colors ${
              isActive("/nonprofit-directory")
                ? "bg-thryvance-green text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={handleLinkClick}
          >
            Nonprofits
          </Link>
          <Link
            to="/donate"
            className={`block py-2 px-3 rounded-md transition-colors ${
              isActive("/donate")
                ? "bg-thryvance-green text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={handleLinkClick}
          >
            Donate
          </Link>
        </div>

        <Separator className="my-4" />

        {/* User Actions */}
        {isAuthenticated ? (
          <div className="space-y-2">
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
              <>
                <Separator className="my-2" />
                <Link
                  to="/admin/dashboard"
                  className="flex items-center py-2 px-3 rounded-md text-orange-600 hover:bg-orange-50 transition-colors"
                  onClick={handleLinkClick}
                >
                  <Shield className="mr-3 h-4 w-4" />
                  Admin Panel
                </Link>
              </>
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
        ) : (
          <div className="space-y-2">
            <Link
              to="/login"
              className="block w-full py-2 px-3 text-center rounded-md border border-thryvance-green text-thryvance-green hover:bg-thryvance-green hover:text-white transition-colors"
              onClick={handleLinkClick}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="block w-full py-2 px-3 text-center rounded-md bg-thryvance-green text-white hover:bg-thryvance-green-dark transition-colors"
              onClick={handleLinkClick}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
