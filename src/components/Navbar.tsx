
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import NavLinks from "./navbar/NavLinks";
import UserMenu from "./navbar/UserMenu";
import GuestActions from "./navbar/GuestActions";
import MobileMenu from "./navbar/MobileMenu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Check if the link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
      <div className="container mx-auto flex justify-between items-center p-4 max-w-full">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-thryvance-green">
            <Logo />
          </Link>
        </div>

        {/* Desktop navigation */}
        <NavLinks isActive={isActive} />

        {/* Show different buttons based on authentication status */}
        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <GuestActions />
        )}

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Menu">
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      <MobileMenu 
        isActive={isActive} 
        isMenuOpen={isMenuOpen} 
        toggleMenu={toggleMenu}
      />
    </header>
  );
};

export default Navbar;
