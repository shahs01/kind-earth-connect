
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import UserMenu from "./navbar/UserMenu";
import GuestActions from "./navbar/GuestActions";
import NavLinks from "./navbar/NavLinks";
import MobileMenu from "./navbar/MobileMenu";

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white py-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-thryvance-green mr-10">
              Thryvance
            </Link>
            
            {/* Desktop navigation links */}
            <NavLinks isActive={isActive} />
          </div>
          
          <div className="hidden md:flex">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <GuestActions />
            )}
          </div>
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={toggleMenu}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <MobileMenu isActive={isActive} isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
    </header>
  );
};

export default Navbar;
