
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/context/AuthContext";
import { 
  Info, 
  Heart, 
  HelpCircle, 
  Bell, 
  Handshake, 
  Shield, 
  FileText, 
  File,
  ChevronDown,
  Search,
  Plus,
  User,
  MessageSquare,
  Settings,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MobileMenuProps {
  isActive: (path: string) => boolean;
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const MobileMenu = ({ isActive, isMenuOpen, toggleMenu }: MobileMenuProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  
  if (!isMenuOpen) return null;

  const aboutItems = [
    { label: "About Us", path: "/about", icon: <Info className="h-4 w-4" /> },
    { label: "Our Values", path: "/values", icon: <Heart className="h-4 w-4" /> },
    { label: "FAQ", path: "/faq", icon: <HelpCircle className="h-4 w-4" /> },
    { label: "Safety Tips", path: "/safety-tips", icon: <Shield className="h-4 w-4" /> },
    { label: "Privacy Policy", path: "/privacy-policy", icon: <FileText className="h-4 w-4" /> },
    { label: "Terms of Service", path: "/terms-of-service", icon: <File className="h-4 w-4" /> },
    { label: "Stay Updated", path: "/subscribe", icon: <Bell className="h-4 w-4" /> },
    { label: "Contact Us", path: "/contact", icon: <Info className="h-4 w-4" /> },
  ];
  
  const involvedItems = [
    { label: "Partner With Us", path: "/partner-with-us", icon: <Handshake className="h-4 w-4" /> },
    { label: "Volunteer", path: "/volunteer", icon: <HelpCircle className="h-4 w-4" /> },
    { label: "Sponsor a Project", path: "/sponsor-project", icon: <Heart className="h-4 w-4" /> },
    { label: "Donate", path: "/donate", icon: <Heart className="h-4 w-4" /> },
  ];

  const handleSignOut = async () => {
    await logout();
    toggleMenu();
  };

  return (
    <div className="md:hidden bg-white border-t border-gray-100 p-4">
      <nav className="flex flex-col space-y-3">
        {/* User Account Section - Only show if authenticated */}
        {isAuthenticated && user && (
          <div className="border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || ""} />
                <AvatarFallback className="bg-thryvance-blue text-white">
                  {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{user.name || user.email?.split("@")[0] || "User"}</p>
                <p className="text-xs text-gray-500">My Account</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Link
                to={`/profile/${user.id}`}
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
              <Link
                to="/messages"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </Link>
              <Link
                to="/favorites"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                <Heart className="mr-2 h-4 w-4" />
                Favorites
              </Link>
              <Link
                to="/notifications"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        <Link
          to="/"
          className={`px-3 py-2 rounded-md ${
            isActive("/") ? "bg-thryvance-green-light text-thryvance-green" : "text-gray-700"
          }`}
          onClick={toggleMenu}
        >
          Home
        </Link>
        
        {/* Create Posting Button */}
        <Button 
          asChild 
          className="bg-thryvance-green hover:bg-thryvance-green-dark text-white w-full justify-start"
        >
          <Link
            to="/create-posting"
            onClick={toggleMenu}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Posting
          </Link>
        </Button>
        
        <Accordion type="single" collapsible className="border-none shadow-none w-full">
          {/* About Us dropdown */}
          <AccordionItem value="about-us" className="border-none">
            <AccordionTrigger className="px-3 rounded-md text-gray-700">
              About Us
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col space-y-2 pl-4 mt-2">
                {aboutItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md flex items-center ${
                      isActive(item.path) ? "bg-thryvance-green-light text-thryvance-green" : "text-gray-700"
                    }`}
                    onClick={toggleMenu}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Get Involved dropdown */}
          <AccordionItem value="get-involved" className="border-none">
            <AccordionTrigger className="px-3 rounded-md text-gray-700">
              Get Involved
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col space-y-2 pl-4 mt-2">
                {involvedItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-md flex items-center ${
                      isActive(item.path) ? "bg-thryvance-green-light text-thryvance-green" : "text-gray-700"
                    }`}
                    onClick={toggleMenu}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Link
          to="/community"
          className={`px-3 py-2 rounded-md ${
            isActive("/community") ? "bg-thryvance-green-light text-thryvance-green" : "text-gray-700"
          }`}
          onClick={toggleMenu}
        >
          Community
        </Link>
        <Link
          to="/nonprofit-directory"
          className={`px-3 py-2 rounded-md ${
            isActive("/nonprofit-directory") ? "bg-thryvance-green-light text-thryvance-green" : "text-gray-700"
          }`}
          onClick={toggleMenu}
        >
          Nonprofits
        </Link>
        
        {!isAuthenticated && (
          <>
            <div className="border-t my-2 border-gray-100"></div>
            <Link
              to="/login"
              className="px-3 py-2 rounded-md text-thryvance-blue"
              onClick={toggleMenu}
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-3 py-2 rounded-md bg-thryvance-green text-white"
              onClick={toggleMenu}
            >
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </div>
  );
};

export default MobileMenu;
