
import { ChevronDown, Info, Heart, HelpCircle, Bell, Handshake, Shield, FileText, File, Search, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarDropdownProps {
  label: string;
  type: "about" | "involved" | "support";
  isActive?: boolean;
}

const NavbarDropdown = ({ label, type, isActive = false }: NavbarDropdownProps) => {
  const aboutItems = [
    { label: "About Us", path: "/about", icon: <Info className="mr-2 h-4 w-4" /> },
    { label: "Our Impact", path: "/our-impact", icon: <TrendingUp className="mr-2 h-4 w-4" /> },
    { label: "Our Values", path: "/values", icon: <Heart className="mr-2 h-4 w-4" /> },
    { label: "FAQ", path: "/faq", icon: <HelpCircle className="mr-2 h-4 w-4" /> },
    { label: "Safety Tips", path: "/safety-tips", icon: <Shield className="mr-2 h-4 w-4" /> },
    { label: "Privacy Policy", path: "/privacy-policy", icon: <FileText className="mr-2 h-4 w-4" /> },
    { label: "Terms of Service", path: "/terms-of-service", icon: <File className="mr-2 h-4 w-4" /> },
    { label: "Stay Updated", path: "/subscribe", icon: <Bell className="mr-2 h-4 w-4" /> },
    { label: "Contact Us", path: "/contact", icon: <Info className="mr-2 h-4 w-4" /> },
  ];
  
  const involvedItems = [
    { label: "Partner With Us", path: "/partner-with-us", icon: <Handshake className="mr-2 h-4 w-4" /> },
    { label: "Volunteer", path: "/volunteer", icon: <HelpCircle className="mr-2 h-4 w-4" /> },
    { label: "Donate", path: "/donate", icon: <Heart className="mr-2 h-4 w-4" /> },
  ];
  
  const supportItems = [
    { label: "Offer Help", path: "/offer-help", icon: <Heart className="mr-2 h-4 w-4" /> },
    { label: "Request Help", path: "/request-help", icon: <HelpCircle className="mr-2 h-4 w-4" /> },
    { label: "Search Help", path: "/search-help", icon: <Search className="mr-2 h-4 w-4" /> },
  ];
  
  const items = 
    type === "about" ? aboutItems : 
    type === "involved" ? involvedItems : 
    supportItems;
  
  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger className={`flex items-center transition-colors hover:text-thryvance-green focus:outline-none ${
          isActive ? "text-thryvance-green font-medium" : "text-gray-700"
        }`}>
          <span>{label}</span>
          <ChevronDown className="ml-1 h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-56 bg-white">
          {items.map((item) => (
            <DropdownMenuItem key={item.path} asChild>
              <Link to={item.path} className="flex items-center cursor-pointer w-full">
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NavbarDropdown;
