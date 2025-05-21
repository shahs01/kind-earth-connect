import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, User, Search, ChevronDown, Users, Info, UserPlus,
  Heart, PiggyBank, HandHeart, Box, Mail, MailPlus, Briefcase,
  HelpCircle, LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import Logo from "./Logo";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white py-4 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {/* Offer/Request Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 hover:text-thryvance-green transition-colors outline-none">
              <HandHeart className="h-5 w-5" />
              Offer/Request
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              <DropdownMenuItem asChild>
                <Link to="/offer-help" className="flex items-center gap-2 cursor-pointer">
                  <HandHeart className="h-4 w-4" />
                  Offer Help
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/request-help" className="flex items-center gap-2 cursor-pointer">
                  <HandHeart className="h-4 w-4" />
                  Request Help
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/search-help" className="flex items-center gap-2 cursor-pointer">
                  <Search className="h-4 w-4" />
                  Search Help
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Ways to Give Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 hover:text-thryvance-green transition-colors outline-none">
              <Heart className="h-5 w-5" />
              Ways to Give
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              <DropdownMenuItem asChild>
                <Link to="/donate" className="flex items-center gap-2 cursor-pointer">
                  <Heart className="h-4 w-4" />
                  Online Donations
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/monthly-giving" className="flex items-center gap-2 cursor-pointer">
                  <PiggyBank className="h-4 w-4" />
                  Monthly Giving
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/sponsor-project" className="flex items-center gap-2 cursor-pointer">
                  <HandHeart className="h-4 w-4" />
                  Sponsor a Community Project
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/donate-goods" className="flex items-center gap-2 cursor-pointer">
                  <Box className="h-4 w-4" />
                  Donate Goods or Services
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/volunteer" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Volunteer Your Time
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
              <DropdownMenuItem asChild>
                <Link to="/partner-with-us" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  Partner With Us
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* About Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-gray-700 hover:text-thryvance-green transition-colors outline-none">
              <Info className="h-5 w-5" />
              About
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              <DropdownMenuItem asChild>
                <Link to="/about" className="flex items-center gap-2 cursor-pointer">
                  <Info className="h-4 w-4" />
                  About Us
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/faq" className="flex items-center gap-2 cursor-pointer">
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/careers" className="flex items-center gap-2 cursor-pointer">
                  <Briefcase className="h-4 w-4" />
                  Careers
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/contact" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="h-4 w-4" />
                  Contact Us
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/subscribe" className="flex items-center gap-2 cursor-pointer">
                  <MailPlus className="h-4 w-4" />
                  Stay Updated
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost">
                <Link to="/profile">
                  <User className="h-5 w-5 mr-1" />
                  My Profile
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
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
        <div className="md:hidden bg-white py-4 px-4 absolute top-full left-0 w-full shadow-md max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-4">
            {/* Offer/Request Section */}
            <div className="border-b border-gray-200 pb-2">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <HandHeart className="h-4 w-4 mr-1" />
                Offer/Request
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
              <Link 
                to="/search-help" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-1">
                  <Search className="h-4 w-4" />
                  Search Help
                </div>
              </Link>
            </div>
            
            {/* Ways to Give Section */}
            <div className="border-b border-gray-200 pb-2">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                Ways to Give
              </h3>
              <Link 
                to="/donate" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  Online Donations
                </div>
              </Link>
              <Link 
                to="/monthly-giving" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-1">
                  <PiggyBank className="h-4 w-4" />
                  Monthly Giving
                </div>
              </Link>
              <Link 
                to="/sponsor-project" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-1">
                  <HandHeart className="h-4 w-4" />
                  Sponsor a Community Project
                </div>
              </Link>
              <Link 
                to="/donate-goods" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-1">
                  <Box className="h-4 w-4" />
                  Donate Goods or Services
                </div>
              </Link>
              <Link 
                to="/volunteer" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Volunteer Your Time
                </div>
              </Link>
            </div>
            
            {/* Community Section */}
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
              <Link 
                to="/partner-with-us" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                Partner With Us
              </Link>
            </div>
            
            {/* About Section */}
            <div className="border-b border-gray-200 pb-2">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                About
              </h3>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link 
                to="/faq" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-1">
                  <HelpCircle className="h-4 w-4" />
                  FAQ
                </div>
              </Link>
              <Link 
                to="/careers" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  Careers
                </div>
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Contact Us
                </div>
              </Link>
              <Link 
                to="/subscribe" 
                className="text-gray-700 hover:text-thryvance-green transition-colors py-2 pl-4 block"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-1">
                  <MailPlus className="h-4 w-4" />
                  Stay Updated
                </div>
              </Link>
            </div>
            
            {isAuthenticated ? (
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
                  className="border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
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
