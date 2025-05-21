
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const GuestActions = () => {
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
  
  // Optionally display a warning for non-secure connections
  if (!isSecure) {
    return (
      <div className="flex flex-col space-y-2">
        <div className="text-red-500 text-xs font-semibold mb-1">
          ⚠️ Insecure connection - use HTTPS for secure login
        </div>
        <div className="flex space-x-2">
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
    <div className="flex space-x-2">
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
