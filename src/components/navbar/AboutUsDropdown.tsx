
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const AboutUsDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center text-sm text-gray-700 hover:text-thryvance-green focus:outline-none">
        About Us <ChevronDown className="ml-1 h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white shadow-lg border z-50">
        <DropdownMenuItem asChild>
          <Link to="/about" className="w-full">About Thryvance</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/our-impact" className="w-full">Our Impact</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/values" className="w-full">Our Values</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/contact" className="w-full">Contact Us</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AboutUsDropdown;
