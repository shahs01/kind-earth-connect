
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import SearchButton from "./SearchButton";
import { useAuth } from "@/context/AuthContext";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const GuestActions = () => {
  const { signInWithProvider } = useAuth();
  const [isSecure, setIsSecure] = useState(true);
  
  // Check for secure context once component mounts
  useEffect(() => {
    // Check if connection is secure (HTTPS or localhost)
    const connectionIsSecure = 
      window.location.protocol === 'https:' || 
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    
    setIsSecure(connectionIsSecure);
    
    // Log warning for non-secure connections
    if (!connectionIsSecure) {
      console.warn('Warning: Application is not running on HTTPS. Authentication is not secure.');
    }
  }, []);

  const handleGoogleSignIn = () => {
    signInWithProvider('google');
  };
  
  // Optionally display a warning for non-secure connections
  if (!isSecure) {
    return (
      <div className="flex flex-col space-y-2">
        <div className="text-red-500 text-xs font-semibold mb-1">
          ⚠️ Insecure connection - use HTTPS for secure login
        </div>
        <div className="flex space-x-2">
          <SearchButton />
          <Button variant="ghost" asChild>
            <Link to="/login" aria-label="Log in to your account">Log In</Link>
          </Button>
          <Button asChild>
            <Link to="/signup" aria-label="Create a new account">Sign Up</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-2">
      <SearchButton />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline"
              className="bg-white border-gray-300 hover:bg-gray-50 flex items-center gap-1"
              onClick={handleGoogleSignIn}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path 
                  d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" 
                  fill="#EA4335" 
                />
                <path 
                  d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" 
                  fill="#4285F4" 
                />
                <path 
                  d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" 
                  fill="#FBBC05" 
                />
                <path 
                  d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.2154 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" 
                  fill="#34A853" 
                />
              </svg>
              Sign in
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sign in with Google</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Button variant="ghost" asChild>
        <Link to="/login" aria-label="Log in to your account">Log In</Link>
      </Button>
      <Button asChild>
        <Link to="/signup" aria-label="Create a new account">Sign Up</Link>
      </Button>
      <Button variant="outline" className="bg-thryvance-green-light text-thryvance-green hover:bg-thryvance-green hover:text-white" asChild>
        <Link to="/donate" aria-label="Make a donation">Donate</Link>
      </Button>
    </div>
  );
};

export default GuestActions;
