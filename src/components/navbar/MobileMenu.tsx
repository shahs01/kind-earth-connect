
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/context/AuthContext";

interface MobileMenuProps {
  isActive: (path: string) => boolean;
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

const MobileMenu = ({ isActive, isMenuOpen, toggleMenu }: MobileMenuProps) => {
  const { isAuthenticated } = useAuth();
  
  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden bg-white border-t border-gray-100 p-4">
      <nav className="flex flex-col space-y-3">
        <Link
          to="/"
          className={`px-3 py-2 rounded-md ${
            isActive("/") ? "bg-thryvance-green-light text-thryvance-green" : "text-gray-700"
          }`}
          onClick={toggleMenu}
        >
          Home
        </Link>
        
        <Accordion type="single" collapsible className="border-none shadow-none w-full">
          <AccordionItem value="help-options" className="border-none">
            <AccordionTrigger className={`px-3 rounded-md ${
              isActive("/offer-help") || isActive("/request-help") || isActive("/search-help")
                ? "bg-thryvance-green-light text-thryvance-green"
                : "text-gray-700"
            }`}>
              Help Options
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col space-y-2 pl-4 mt-2">
                <Link
                  to="/offer-help"
                  className={`px-3 py-2 rounded-md ${
                    isActive("/offer-help") ? "bg-thryvance-green-light text-thryvance-green" : "text-gray-700"
                  }`}
                  onClick={toggleMenu}
                >
                  Offer Help
                </Link>
                <Link
                  to="/request-help"
                  className={`px-3 py-2 rounded-md ${
                    isActive("/request-help") ? "bg-thryvance-green-light text-thryvance-green" : "text-gray-700"
                  }`}
                  onClick={toggleMenu}
                >
                  Request Help
                </Link>
                <Link
                  to="/search-help"
                  className={`px-3 py-2 rounded-md ${
                    isActive("/search-help") ? "bg-thryvance-green-light text-thryvance-green" : "text-gray-700"
                  }`}
                  onClick={toggleMenu}
                >
                  Search Help
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Link
          to="/community"
          className={`px-3 py-2 rounded-md ${
            isActive("/community") ? "bg-thryvance-green-light text-thryvance-green" : "text-gray-700"
          }`}
          onClick={toggleMenu}
        >
          Community
        </Link>
        <Link
          to="/volunteer"
          className={`px-3 py-2 rounded-md ${
            isActive("/volunteer") ? "bg-thryvance-green-light text-thryvance-green" : "text-gray-700"
          }`}
          onClick={toggleMenu}
        >
          Volunteer
        </Link>
        <Link
          to="/nonprofit-directory"
          className={`px-3 py-2 rounded-md ${
            isActive("/nonprofit-directory") ? "bg-thryvance-green-light text-thryvance-green" : "text-gray-700"
          }`}
          onClick={toggleMenu}
        >
          Nonprofits
        </Link>
        
        {!isAuthenticated && (
          <>
            <div className="border-t my-2 border-gray-100"></div>
            <Link
              to="/login"
              className="px-3 py-2 rounded-md text-thryvance-blue"
              onClick={toggleMenu}
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-3 py-2 rounded-md bg-thryvance-green text-white"
              onClick={toggleMenu}
            >
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </div>
  );
};

export default MobileMenu;
