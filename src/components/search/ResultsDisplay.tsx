
import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, Handshake } from "lucide-react";
import ResultCard from "./ResultCard";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ResultsDisplayProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredOffers: any[];
  filteredRequests: any[];
  allFiltered: any[];
  handleClearFilters: () => void;
}

const ResultsDisplay = ({
  activeTab,
  setActiveTab,
  filteredOffers,
  filteredRequests,
  allFiltered,
  handleClearFilters
}: ResultsDisplayProps) => {
  const { isAuthenticated } = useAuth();
  
  const getItemsToShow = () => {
    switch(activeTab) {
      case "offers":
        return filteredOffers;
      case "requests":
        return filteredRequests;
      default:
        return allFiltered;
    }
  };

  const displayResults = () => {
    const itemsToShow = getItemsToShow();
    
    if (itemsToShow.length === 0) {
      return (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700">No results found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search filters</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleClearFilters}
          >
            Clear filters
          </Button>
          
          {isAuthenticated && (
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark">
                <Link to="/offer-help">Offer Help</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/request-help">Request Help</Link>
              </Button>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itemsToShow.map(item => (
          <ResultCard key={item.id} item={item} />
        ))}
      </div>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          Search Results 
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({allFiltered.length} {allFiltered.length === 1 ? 'result' : 'results'})
          </span>
        </h2>
        
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Users className="h-4 w-4" /> All
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" /> Offers
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-1">
            <Handshake className="h-4 w-4" /> Requests
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="all">{displayResults()}</TabsContent>
      <TabsContent value="offers">{displayResults()}</TabsContent>
      <TabsContent value="requests">{displayResults()}</TabsContent>
    </Tabs>
  );
};

export default ResultsDisplay;
