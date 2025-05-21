
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Phone, Mail, Flag } from "lucide-react";
import { Nonprofit } from "@/types";

interface NonprofitCardProps {
  nonprofit: Nonprofit;
}

const NonprofitCard = ({ nonprofit }: NonprofitCardProps) => {
  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-lg bg-thryvance-neutral flex items-center justify-center overflow-hidden">
            {nonprofit.logo ? (
              <img 
                src={nonprofit.logo} 
                alt={nonprofit.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <Flag className="h-8 w-8 text-thryvance-green" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{nonprofit.name}</h3>
            <Badge variant="outline" className="mt-1 bg-thryvance-green-light/50 text-thryvance-green border-thryvance-green/20">
              {nonprofit.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-6">
        <p className="text-gray-600 mb-4 line-clamp-3">{nonprofit.description}</p>
        
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{nonprofit.location}</span>
          </div>
          
          {nonprofit.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <a 
                href={nonprofit.website} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-thryvance-blue hover:underline"
              >
                Website
              </a>
            </div>
          )}
          
          {nonprofit.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <a 
                href={`tel:${nonprofit.phoneNumber}`} 
                className="hover:underline"
              >
                {nonprofit.phoneNumber}
              </a>
            </div>
          )}
          
          {nonprofit.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <a 
                href={`mailto:${nonprofit.email}`} 
                className="text-thryvance-blue hover:underline"
              >
                {nonprofit.email}
              </a>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 border-t">
        <div className="w-full flex gap-3">
          <Button variant="ghost" className="flex-1 text-thryvance-green">
            Learn More
          </Button>
          <Button className="flex-1 bg-thryvance-green hover:bg-thryvance-green-dark">
            Contact
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NonprofitCard;
