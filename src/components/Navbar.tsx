
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Search, ChevronDown, HelpCircle, Users, Info, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "./Logo";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Set to true for demo purposes

  return (
    <nav className="bg-white py-4 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {/* Help Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 hover:text-thryvance-green transition-colors outline-none">
              <HelpCircle className="h-5 w-5" />
              Help
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              <DropdownMenuItem asChild>
                <Link to="/offer-help" className="flex items-center gap-2 cursor-pointer">
                  <HelpCircle className="h-4 w-4" />
                  Offer Help
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/request-help" className="flex items-center gap-2 cursor-pointer">
                  <HelpCircle className="h-4 w-4" />
                  Request Help
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Community Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 hover:text-thryvance-green transition-colors outline-none">
              <Users className="h-5 w-5" />
              Community
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              <DropdownMenuItem asChild>
                <Link to="/community" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  Community Feed
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/nonprofits" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  Find Nonprofits
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* About Link */}
          <Link to="/about" className="flex items-center gap-1 text-gray-700 hover:text-thryvance-green transition-colors">
            <Info className="h-5 w-5" />
            About Us
          </Link>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost">
                <Link to="/profile">
                  <User className="h-5 w-5 mr-1" />
                  My Profile
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light"
              >
                Log Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost">
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark flex items-center gap-1">
                <Link to="/signup">
                  <UserPlus className="h-4 w-4" />
                  Join the Community
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 absolute top-full left-0 w-full shadow-md">
          <div className="flex flex-col gap-4">
            <div className="border-b border-gray-200 pb-2">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <HelpCircle className="h-4 w-4 mr-1" />
                Help
              </h3>
              <Link 
                to="/offer-help" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                Offer Help
              </Link>
              <Link 
                to="/request-help" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                Request Help
              </Link>
            </div>
            
            <div className="border-b border-gray-200 pb-2">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Community
              </h3>
              <Link 
                to="/community" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                Community Feed
              </Link>
              <Link 
                to="/nonprofits" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Nonprofits
              </Link>
            </div>
            
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-thryvance-green transition-colors py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Info className="h-4 w-4 mr-1" />
              About Us
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 text-gray-700 hover:text-thryvance-green transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  My Profile
                </Link>
                <Button 
                  variant="outline" 
                  className="border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light"
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  asChild 
                  variant="ghost" 
                  className="justify-start px-0"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/login">Log In</Link>
                </Button>
                <Button 
                  asChild 
                  className="bg-thryvance-green hover:bg-thryvance-green-dark flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/signup">
                    <UserPlus className="h-4 w-4" />
                    Join the Community
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
