
import { Link } from "react-router-dom";
import NavbarDropdown from "./NavbarDropdown";

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
      
      {/* About Us dropdown menu */}
      <NavbarDropdown label="About Us" type="about" />
      
      {/* Partner With Us dropdown */}
      <NavbarDropdown label="Get Involved" type="involved" />
    </nav>
  );
};

export default NavLinks;
