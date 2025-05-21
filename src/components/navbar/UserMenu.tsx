
import { User, LogOut, Mail, Settings, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchButton from "./SearchButton";

const UserMenu = () => {
  const { user, emailVerified, logout } = useAuth();

  return (
    <div className="flex items-center gap-2">
      <div className="flex space-x-2">
        <SearchButton />
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
  );
};

export default UserMenu;
