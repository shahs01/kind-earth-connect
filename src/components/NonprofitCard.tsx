
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
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3">
          <div className="h-12 w-12 mx-auto rounded-lg bg-thryvance-neutral flex items-center justify-center overflow-hidden flex-shrink-0">
            {nonprofit.logo ? (
              <img 
                src={nonprofit.logo} 
                alt={nonprofit.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <Building className="h-6 w-6 text-thryvance-green" />
            )}
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold line-clamp-2 mb-2">{nonprofit.name}</h3>
            <Badge variant="outline" className="text-xs bg-thryvance-green-light/50 text-thryvance-green border-thryvance-green/20">
              {nonprofit.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-gray-600 mb-3 line-clamp-3 text-xs leading-relaxed">{nonprofit.description}</p>
        
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
            <span className="truncate">{nonprofit.location}</span>
          </div>
          
          {nonprofit.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3 text-gray-500 flex-shrink-0" />
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
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-gray-500 flex-shrink-0" />
              <a 
                href={`tel:${nonprofit.phone_number}`} 
                className="hover:underline truncate"
              >
                {nonprofit.phone_number}
              </a>
            </div>
          )}
          
          {nonprofit.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 text-gray-500 flex-shrink-0" />
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
        <div className="w-full flex gap-2">
          <Button variant="ghost" className="flex-1 text-thryvance-green text-xs p-2">
            Learn More
          </Button>
          <Button className="flex-1 bg-thryvance-green hover:bg-thryvance-green-dark text-xs p-2">
            Contact
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NonprofitCard;
