
import { Link } from "react-router-dom";
import NavbarDropdown from "./NavbarDropdown";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";

interface NavLinksProps {
  isActive: (path: string) => boolean;
}

const NavLinks = ({ isActive }: NavLinksProps) => {
  const location = useLocation();
  
  // Check if current path is a child of About Us
  const isAboutUsActive = () => {
    const aboutPaths = ['/about', '/our-impact', '/values', '/faq', '/safety-tips', '/privacy-policy', '/terms-of-service', '/subscribe', '/contact'];
    return aboutPaths.some(path => location.pathname === path);
  };
  
  // Check if current path is a child of Get Involved
  const isGetInvolvedActive = () => {
    const involvedPaths = ['/partner-with-us', '/volunteer', '/donate'];
    return involvedPaths.some(path => location.pathname === path);
  };

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
        Community & Help
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
      <NavbarDropdown label="About Us" type="about" isActive={isAboutUsActive()} />
      
      {/* Partner With Us dropdown */}
      <NavbarDropdown label="Get Involved" type="involved" isActive={isGetInvolvedActive()} />
    </nav>
  );
};

export default NavLinks;
