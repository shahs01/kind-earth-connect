
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SearchButton = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="relative bg-thryvance-neutral-light border-thryvance-blue hover:bg-thryvance-blue-light"
            asChild
          >
            <Link to="/search-help" aria-label="Search for help">
              <Search className="h-4 w-4 text-thryvance-blue" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Search for help</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SearchButton;
