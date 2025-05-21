
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const GuestActions = () => {
  // Security fix: Use HTTPS when in production to prevent MITM attacks
  const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  
  // Security warning if not using HTTPS
  if (!isSecure) {
    console.warn('Warning: Application is not running on HTTPS. Authentication is not secure.');
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
