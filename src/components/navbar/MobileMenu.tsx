
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import MobileUserMenu from "./MobileUserMenu";

interface MobileMenuProps {
  isActive: (path: string) => boolean;
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const MobileMenu = ({ isActive, isMenuOpen, toggleMenu }: MobileMenuProps) => {
  const { isAuthenticated } = useAuth();

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
