
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Phone, Mail, Building } from "lucide-react";
import { Nonprofit } from "@/hooks/useNonprofits";

interface NonprofitCardProps {
  nonprofit: Nonprofit;
}

const NonprofitCard = ({ nonprofit }: NonprofitCardProps) => {
  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 sm:pb-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="h-8 w-8 sm:h-16 sm:w-16 rounded-lg bg-thryvance-neutral flex items-center justify-center overflow-hidden flex-shrink-0">
            {nonprofit.logo ? (
              <img 
                src={nonprofit.logo} 
                alt={nonprofit.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <Building className="h-4 w-4 sm:h-8 sm:w-8 text-thryvance-green" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-xl font-semibold line-clamp-2">{nonprofit.name}</h3>
            <Badge variant="outline" className="mt-1 text-xs sm:text-sm bg-thryvance-green-light/50 text-thryvance-green border-thryvance-green/20">
              {nonprofit.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 sm:pb-6">
        <p className="text-gray-600 mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-3 text-xs sm:text-base">{nonprofit.description}</p>
        
        <div className="flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
            <span className="truncate">{nonprofit.location}</span>
          </div>
          
          {nonprofit.website && (
            <div className="flex items-center gap-1 sm:gap-2">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
              <a 
                href={nonprofit.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-thryvance-blue hover:underline truncate"
              >
                Website
              </a>
            </div>
          )}
          
          {nonprofit.phone_number && (
            <div className="flex items-center gap-1 sm:gap-2">
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
              <a 
                href={`tel:${nonprofit.phone_number}`} 
                className="hover:underline truncate"
              >
                {nonprofit.phone_number}
              </a>
            </div>
          )}
          
          {nonprofit.email && (
            <div className="flex items-center gap-1 sm:gap-2">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
              <a 
                href={`mailto:${nonprofit.email}`} 
                className="text-thryvance-blue hover:underline truncate"
              >
                {nonprofit.email}
              </a>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 border-t">
        <div className="w-full flex gap-1 sm:gap-3">
          <Button variant="ghost" className="flex-1 text-thryvance-green text-xs sm:text-sm p-1 sm:p-2">
            Learn More
          </Button>
          <Button className="flex-1 bg-thryvance-green hover:bg-thryvance-green-dark text-xs sm:text-sm p-1 sm:p-2">
            Contact
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NonprofitCard;
