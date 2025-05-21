
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, Mail, Settings, Heart, HelpCircle, Info, ChevronDown, Handshake, Bell } from "lucide-react";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, emailVerified, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Check if the link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-thryvance-green">
            <Logo />
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link
            to="/"
            className={`transition-colors hover:text-thryvance-green ${
              isActive("/") ? "text-thryvance-green font-medium" : "text-gray-700"
            }`}
          >
            Home
          </Link>
          <Link
            to="/community"
            className={`transition-colors hover:text-thryvance-green ${
              isActive("/community") ? "text-thryvance-green font-medium" : "text-gray-700"
            }`}
          >
            Community
          </Link>
          <Link
            to="/offer-help"
            className={`transition-colors hover:text-thryvance-green ${
              isActive("/offer-help") || isActive("/request-help") ? "text-thryvance-green font-medium" : "text-gray-700"
            }`}
          >
            Offer/Request
          </Link>
          <Link
            to="/nonprofit-directory"
            className={`transition-colors hover:text-thryvance-green ${
              isActive("/nonprofit-directory") ? "text-thryvance-green font-medium" : "text-gray-700"
            }`}
          >
            Nonprofits
          </Link>
          
          {/* About dropdown menu */}
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center transition-colors hover:text-thryvance-green text-gray-700 focus:outline-none">
                <span>About Us</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/about" className="flex items-center cursor-pointer w-full">
                    <Info className="mr-2 h-4 w-4" />
                    <span>About Us</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/values" className="flex items-center cursor-pointer w-full">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Our Values</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/faq" className="flex items-center cursor-pointer w-full">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>FAQ</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/subscribe" className="flex items-center cursor-pointer w-full">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Stay Updated</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Partner With Us dropdown */}
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center transition-colors hover:text-thryvance-green text-gray-700 focus:outline-none">
                <span>Get Involved</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/partner-with-us" className="flex items-center cursor-pointer w-full">
                    <Handshake className="mr-2 h-4 w-4" />
                    <span>Partner With Us</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/volunteer" className="flex items-center cursor-pointer w-full">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Volunteer</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/sponsor-project" className="flex items-center cursor-pointer w-full">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Sponsor a Project</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/donate" className="flex items-center cursor-pointer w-full">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Donate</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Show different buttons based on authentication status */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="bg-thryvance-green-light text-thryvance-green hover:bg-thryvance-green hover:text-white"
                  asChild
                >
                  <Link to="/offer-help">Offer Help</Link>
                </Button>
                <Button asChild>
                  <Link to="/request-help">Request Help</Link>
                </Button>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    {!emailVerified && (
                      <span className="absolute top-0 right-0 h-2 w-2 bg-amber-500 rounded-full" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.name}</span>
                      <span className="text-xs text-gray-500 truncate">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  
                  {!emailVerified && (
                    <div className="px-2 py-1.5">
                      <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-800 border-amber-200">
                        <Mail className="h-3 w-3" />
                        Email not verified
                      </Badge>
                    </div>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {!emailVerified && (
                    <DropdownMenuItem asChild>
                      <Link to="/verify-email" className="cursor-pointer w-full">
                        <Mail className="mr-2 h-4 w-4" />
                        <span>Verify Email</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Account Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={logout}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
              <Button variant="outline" className="bg-thryvance-green-light text-thryvance-green hover:bg-thryvance-green hover:text-white" asChild>
                <Link to="/donate">Donate</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Menu">
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
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
      )}
    </header>
  );
};

export default Navbar;
