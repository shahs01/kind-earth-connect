
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import NavbarDropdown from "./navbar/NavbarDropdown";

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

        {/* Desktop navigation with help dropdown */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className={`text-sm font-medium ${isActive('/') ? 'text-thryvance-green' : 'text-gray-700 hover:text-thryvance-green'}`}>
            Home
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`text-sm font-medium ${
                isActive('/offer-help') || isActive('/request-help') || isActive('/search-help') 
                ? 'text-thryvance-green' 
                : 'text-gray-700 hover:text-thryvance-green'
              }`}>
                Help Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48 bg-white">
              <DropdownMenuItem className="cursor-pointer">
                <Link to="/offer-help" className="w-full">Offer Help</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Link to="/request-help" className="w-full">Request Help</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Link to="/search-help" className="w-full">Search Help</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link to="/community" className={`text-sm font-medium ${isActive('/community') ? 'text-thryvance-green' : 'text-gray-700 hover:text-thryvance-green'}`}>
            Community
          </Link>
          
          <Link to="/volunteer" className={`text-sm font-medium ${isActive('/volunteer') ? 'text-thryvance-green' : 'text-gray-700 hover:text-thryvance-green'}`}>
            Volunteer
          </Link>
          
          <Link to="/nonprofit-directory" className={`text-sm font-medium ${isActive('/nonprofit-directory') ? 'text-thryvance-green' : 'text-gray-700 hover:text-thryvance-green'}`}>
            Nonprofits
          </Link>
          
          {/* About Us dropdown */}
          <NavbarDropdown label="About Us" type="about" />
          
          {/* Get Involved dropdown */}
          <NavbarDropdown label="Get Involved" type="involved" />
        </div>

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
