
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SearchButton from "./SearchButton";

const GuestActions = () => {
  return (
    <div className="flex items-center space-x-2">
      <SearchButton />
      <Link to="/login">
        <Button variant="ghost" className="text-thryvance-blue hover:text-thryvance-blue-dark">
          Log In
        </Button>
      </Link>
      <Link to="/signup">
        <Button className="bg-thryvance-green hover:bg-thryvance-green-dark text-white">
          Sign Up
        </Button>
      </Link>
    </div>
  );
};

export default GuestActions;
