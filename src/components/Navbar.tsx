import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import UserMenu from "./navbar/UserMenu";
import AboutUsDropdown from "./navbar/AboutUsDropdown";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white py-4 shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-thryvance-green">
          Thryvance
        </Link>
        
        <div className="flex items-center space-x-6">
          <AboutUsDropdown />
          <Link to="/community" className="text-sm text-gray-700 hover:text-thryvance-green">
            Community
          </Link>
          <Link to="/search" className="text-sm text-gray-700 hover:text-thryvance-green">
            Search
          </Link>
          
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex space-x-2">
              <Button asChild variant="outline">
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
