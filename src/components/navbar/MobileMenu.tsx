
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAdminCheck } from "@/hooks/useAdmin";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import MobileUserMenu from "./MobileUserMenu";
import { 
  ChevronDown, 
  ChevronUp, 
  Plus,
  Info, 
  Heart, 
  HelpCircle, 
  Bell, 
  Handshake, 
  Shield, 
  FileText, 
  File, 
  Search,
  TrendingUp
} from "lucide-react";

interface MobileMenuProps {
  isActive: (path: string) => boolean;
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const MobileMenu = ({ isActive, isMenuOpen, toggleMenu }: MobileMenuProps) => {
  const { isAuthenticated, user } = useAuth();
  const { data: isAdmin } = useAdminCheck();
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLinkClick = () => {
    toggleMenu();
  };

  const toggleDropdown = (dropdownName: string) => {
    setExpandedDropdown(expandedDropdown === dropdownName ? null : dropdownName);
  };

  if (!isMenuOpen) return null;

  const aboutItems = [
    { label: "About Us", path: "/about", icon: <Info className="mr-2 h-4 w-4" /> },
    { label: "Our Impact", path: "/our-impact", icon: <TrendingUp className="mr-2 h-4 w-4" /> },
    { label: "Our Values", path: "/values", icon: <Heart className="mr-2 h-4 w-4" /> },
    { label: "FAQ", path: "/faq", icon: <HelpCircle className="mr-2 h-4 w-4" /> },
    { label: "Safety Tips", path: "/safety-tips", icon: <Shield className="mr-2 h-4 w-4" /> },
    { label: "Privacy Policy", path: "/privacy-policy", icon: <FileText className="mr-2 h-4 w-4" /> },
    { label: "Terms of Service", path: "/terms-of-service", icon: <File className="mr-2 h-4 w-4" /> },
    { label: "Stay Updated", path: "/subscribe", icon: <Bell className="mr-2 h-4 w-4" /> },
    { label: "Contact Us", path: "/contact", icon: <Info className="mr-2 h-4 w-4" /> },
  ];

  const involvedItems = [
    { label: "Partner With Us", path: "/partner-with-us", icon: <Handshake className="mr-2 h-4 w-4" /> },
    { label: "Volunteer", path: "/volunteer", icon: <HelpCircle className="mr-2 h-4 w-4" /> },
    { label: "Donate", path: "/donate", icon: <Heart className="mr-2 h-4 w-4" /> },
  ];

  return (
    <div className="md:hidden bg-white border-t border-gray-200 fixed left-0 right-0 top-[73px] bottom-0 z-40 overflow-y-auto">
      <div className="container mx-auto px-4 py-4 h-full">
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
          
          {/* Create Posting Button */}
          <Link
            to="/create-posting"
            className="block w-full"
            onClick={handleLinkClick}
          >
            <Button 
              variant="outline" 
              className="w-full justify-start border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light hover:text-thryvance-green"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Posting
            </Button>
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
            to="/nonprofits"
            className={`block py-2 px-3 rounded-md transition-colors ${
              isActive("/nonprofits")
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

          {/* About Us Dropdown */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between text-gray-700 hover:bg-gray-100 px-3"
              onClick={() => toggleDropdown('about')}
            >
              About Us
              {expandedDropdown === 'about' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {expandedDropdown === 'about' && (
              <div className="pl-4 space-y-1">
                {aboutItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center py-2 px-3 rounded-md text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                    onClick={handleLinkClick}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Get Involved Dropdown */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between text-gray-700 hover:bg-gray-100 px-3"
              onClick={() => toggleDropdown('involved')}
            >
              Get Involved
              {expandedDropdown === 'involved' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {expandedDropdown === 'involved' && (
              <div className="pl-4 space-y-1">
                {involvedItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center py-2 px-3 rounded-md text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                    onClick={handleLinkClick}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>

        <Separator className="my-4" />

        {/* User Actions */}
        {isAuthenticated ? (
          <MobileUserMenu handleLinkClick={handleLinkClick} />
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
