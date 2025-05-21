
import { Link } from "react-router-dom";
import NavbarDropdown from "./NavbarDropdown";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavLinksProps {
  isActive: (path: string) => boolean;
}

const NavLinks = ({ isActive }: NavLinksProps) => {
  return (
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
      
      {/* Create Posting button */}
      <Button asChild variant="outline" className="border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light hover:text-thryvance-green">
        <Link to="/create-posting" className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Create Posting
        </Link>
      </Button>
      
      <Link
        to="/nonprofit-directory"
        className={`transition-colors hover:text-thryvance-green ${
          isActive("/nonprofit-directory") ? "text-thryvance-green font-medium" : "text-gray-700"
        }`}
      >
        Nonprofits
      </Link>
      
      {/* About Us dropdown menu */}
      <NavbarDropdown label="About Us" type="about" />
      
      {/* Partner With Us dropdown */}
      <NavbarDropdown label="Get Involved" type="involved" />
    </nav>
  );
};

export default NavLinks;
