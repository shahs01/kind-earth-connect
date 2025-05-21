
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const GuestActions = () => {
  return (
    <div className="flex space-x-2">
      <Button variant="ghost" asChild>
        <Link to="/login">Log In</Link>
      </Button>
      <Button asChild>
        <Link to="/signup">Sign Up</Link>
      </Button>
      <Button variant="outline" className="bg-thryvance-green-light text-thryvance-green hover:bg-thryvance-green hover:text-white" asChild>
        <Link to="/donate">Donate</Link>
      </Button>
    </div>
  );
};

export default GuestActions;
