
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar } from "lucide-react";

interface ResultCardProps {
  item: {
    id: string;
    title: string;
    category: string;
    location: string;
    description: string;
    postedBy: string;
    postedDate: string;
  };
}

const ResultCard = ({ item }: ResultCardProps) => {
  const isOffer = item.id.startsWith('o');
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Badge className={`${isOffer ? 'bg-thryvance-blue-light text-thryvance-blue' : 'bg-thryvance-green-light text-thryvance-green'}`}>
            {isOffer ? 'Offering' : 'Request'}
          </Badge>
          <Badge variant="outline">{item.category}</Badge>
        </div>
        <CardTitle className="mt-2 text-xl">{item.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3" /> {item.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-700">{item.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t pt-4">
        <div className="flex justify-between w-full text-sm text-gray-500">
          <span>Posted by: {item.postedBy}</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(item.postedDate).toLocaleDateString()}
          </span>
        </div>
        <Button className="mt-3 w-full bg-thryvance-green hover:bg-thryvance-green-dark">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResultCard;
