
import React from "react";
import { Search, MapPin, Filter, ChevronDown, Users, Handshake, Briefcase, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  postType: string;
  setPostType: (type: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  handleClearFilters: () => void;
  categories: string[];
}

const SearchFilters = ({
  searchQuery,
  setSearchQuery,
  locationFilter,
  setLocationFilter,
  postType,
  setPostType,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  showAdvancedFilters,
  setShowAdvancedFilters,
  handleClearFilters,
  categories
}: SearchFiltersProps) => {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search for skills, services, or needs..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Filter by location" 
              className="pl-10"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
          
          <Select 
            value={postType} 
            onValueChange={setPostType}
          >
            <SelectTrigger>
              <div className="flex items-center gap-2">
                {postType === "offers" ? <Briefcase className="h-4 w-4" /> : 
                 postType === "requests" ? <Handshake className="h-4 w-4" /> : 
                 <Filter className="h-4 w-4" />}
                <SelectValue placeholder="Filter by post type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> All Posts
                </div>
              </SelectItem>
              <SelectItem value="offers">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Offers Only
                </div>
              </SelectItem>
              <SelectItem value="requests">
                <div className="flex items-center gap-2">
                  <Handshake className="h-4 w-4" /> Requests Only
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Collapsible 
          open={showAdvancedFilters} 
          onOpenChange={setShowAdvancedFilters}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Advanced Filters</h3>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? 'transform rotate-180' : ''}`} />
                <span className="sr-only">Toggle advanced filters</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Sort By</Label>
                <RadioGroup 
                  value={sortBy} 
                  onValueChange={setSortBy}
                  className="flex flex-row space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="newest" id="newest" />
                    <Label htmlFor="newest" className="cursor-pointer flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" /> Newest First
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="oldest" id="oldest" />
                    <Label htmlFor="oldest" className="cursor-pointer flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" /> Oldest First
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" className="mr-2" onClick={handleClearFilters}>
            Clear Filters
          </Button>
          <Button className="bg-thryvance-blue">
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
