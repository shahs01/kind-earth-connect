
import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

interface MobileMenuProps {
  isActive: (path: string) => boolean;
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const MobileMenu = ({ isActive, isMenuOpen, toggleMenu }: MobileMenuProps) => {
  const { user, isAuthenticated, emailVerified, logout } = useAuth();

  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden p-4 bg-white">
      <div className="flex flex-col space-y-4">
        <Link
          to="/"
          className={`transition-colors hover:text-thryvance-green ${
            isActive("/") ? "text-thryvance-green font-medium" : "text-gray-700"
          }`}
          onClick={toggleMenu}
        >
          Home
        </Link>
        <Link
          to="/community"
          className={`transition-colors hover:text-thryvance-green ${
            isActive("/community") ? "text-thryvance-green font-medium" : "text-gray-700"
          }`}
          onClick={toggleMenu}
        >
          Community
        </Link>
        <Link
          to="/offer-help"
          className={`transition-colors hover:text-thryvance-green ${
            isActive("/offer-help") || isActive("/request-help") ? "text-thryvance-green font-medium" : "text-gray-700"
          }`}
          onClick={toggleMenu}
        >
          Offer/Request
        </Link>
        <Link
          to="/nonprofit-directory"
          className={`transition-colors hover:text-thryvance-green ${
            isActive("/nonprofit-directory") ? "text-thryvance-green font-medium" : "text-gray-700"
          }`}
          onClick={toggleMenu}
        >
          Nonprofits
        </Link>
        
        {/* Mobile About Us section */}
        <div className="pt-2 pb-1 border-t border-gray-100">
          <p className="text-gray-500 text-sm mb-2">About Us</p>
          <div className="flex flex-col space-y-2 pl-2">
            <Link
              to="/about"
              className="transition-colors hover:text-thryvance-green text-gray-700"
              onClick={toggleMenu}
            >
              About Us
            </Link>
            <Link
              to="/values"
              className="transition-colors hover:text-thryvance-green text-gray-700"
              onClick={toggleMenu}
            >
              Our Values
            </Link>
            <Link
              to="/faq"
              className="transition-colors hover:text-thryvance-green text-gray-700"
              onClick={toggleMenu}
            >
              FAQ
            </Link>
            <Link
              to="/subscribe"
              className="transition-colors hover:text-thryvance-green text-gray-700"
              onClick={toggleMenu}
            >
              Stay Updated
            </Link>
          </div>
        </div>
        
        {/* Mobile Get Involved section */}
        <div className="pt-1 pb-2 border-b border-gray-100">
          <p className="text-gray-500 text-sm mb-2">Get Involved</p>
          <div className="flex flex-col space-y-2 pl-2">
            <Link
              to="/partner-with-us"
              className="transition-colors hover:text-thryvance-green text-gray-700"
              onClick={toggleMenu}
            >
              Partner With Us
            </Link>
            <Link
              to="/volunteer"
              className="transition-colors hover:text-thryvance-green text-gray-700"
              onClick={toggleMenu}
            >
              Volunteer
            </Link>
            <Link
              to="/sponsor-project"
              className="transition-colors hover:text-thryvance-green text-gray-700"
              onClick={toggleMenu}
            >
              Sponsor a Project
            </Link>
            <Link
              to="/donate"
              className="transition-colors hover:text-thryvance-green text-gray-700"
              onClick={toggleMenu}
            >
              Donate
            </Link>
          </div>
        </div>
        
        {isAuthenticated ? (
          <>
            <div className="pt-2 pb-2">
              <div className="flex items-center gap-2 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-xs text-gray-500">{user?.email}</span>
                </div>
              </div>
              
              {!emailVerified && (
                <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-800 border-amber-200 mb-2">
                  <Mail className="h-3 w-3" />
                  Email not verified - <Link to="/verify-email" className="underline">Verify now</Link>
                </Badge>
              )}
            </div>
            
            <Link
              to="/profile"
              className="transition-colors hover:text-thryvance-green text-gray-700"
              onClick={toggleMenu}
            >
              My Profile
            </Link>
            <div className="flex flex-col space-y-2">
              <Button className="w-full" size="sm" asChild onClick={toggleMenu}>
                <Link to="/request-help">Request Help</Link>
              </Button>
              <Button 
                variant="outline" 
                className="w-full bg-thryvance-green-light text-thryvance-green hover:bg-thryvance-green hover:text-white"
                size="sm"
                asChild
                onClick={toggleMenu}
              >
                <Link to="/offer-help">Offer Help</Link>
              </Button>
              <Button 
                variant="destructive" 
                className="w-full" 
                size="sm"
                onClick={() => {
                  logout();
                  toggleMenu();
                }}
              >
                Log Out
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col space-y-2">
            <Button className="w-full" size="sm" asChild onClick={toggleMenu}>
              <Link to="/signup">Sign Up</Link>
            </Button>
            <Button variant="outline" className="w-full" size="sm" asChild onClick={toggleMenu}>
              <Link to="/login">Log In</Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full bg-thryvance-green-light text-thryvance-green hover:bg-thryvance-green hover:text-white" 
              size="sm" 
              asChild
              onClick={toggleMenu}
            >
              <Link to="/donate">Donate</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
