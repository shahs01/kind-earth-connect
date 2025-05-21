
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Search } from "lucide-react";
import Logo from "./Logo";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would come from auth context in a real app

  return (
    <nav className="bg-white py-4 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/community" className="text-gray-700 hover:text-thryvance-green transition-colors">
            Community Feed
          </Link>
          <Link to="/nonprofits" className="text-gray-700 hover:text-thryvance-green transition-colors">
            Find Nonprofits
          </Link>
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost">
                <Link to="/profile">
                  <User className="h-5 w-5 mr-1" />
                  Profile
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
              <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark">
                <Link to="/signup">Sign Up</Link>
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
            <Link 
              to="/community" 
              className="text-gray-700 hover:text-thryvance-green transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Community Feed
            </Link>
            <Link 
              to="/nonprofits" 
              className="text-gray-700 hover:text-thryvance-green transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Nonprofits
            </Link>
            {isLoggedIn ? (
              <>
                <Link 
                  to="/profile" 
                  className="text-gray-700 hover:text-thryvance-green transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
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
                  className="bg-thryvance-green hover:bg-thryvance-green-dark"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/signup">Sign Up</Link>
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
