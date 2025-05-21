import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, Filter, ChevronDown, Users, Handshake, Briefcase } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";

// Sample data for offers and requests
const sampleOffers = [
  {
    id: "o1",
    title: "Free Photography Services for Events",
    category: "Creative Services",
    location: "Portland, OR",
    description: "Professional photographer offering free photography for community events and nonprofit fundraisers.",
    postedBy: "Alex Johnson",
    postedDate: "2025-05-15"
  },
  {
    id: "o2",
    title: "Web Development Help for Small Businesses",
    category: "Technology",
    location: "Remote",
    description: "Experienced developer offering 5 hours of free web development help for local small businesses.",
    postedBy: "Maria Chen",
    postedDate: "2025-05-10"
  },
  {
    id: "o3",
    title: "Tutoring in Mathematics",
    category: "Education",
    location: "Portland, OR",
    description: "Math teacher offering free tutoring sessions for high school students twice a week.",
    postedBy: "David Wilson",
    postedDate: "2025-05-12"
  },
  {
    id: "o4",
    title: "Free Legal Advice for Startups",
    category: "Legal",
    location: "Remote",
    description: "Attorney offering 1-hour free consultations for startups and small business owners.",
    postedBy: "Sarah Lopez",
    postedDate: "2025-05-08"
  }
];

const sampleRequests = [
  {
    id: "r1",
    title: "Need Help with Garden Project at Community Center",
    category: "Manual Labor",
    location: "Southeast Portland",
    description: "Looking for volunteers to help plant and set up our new community garden this weekend.",
    postedBy: "Community Growth Initiative",
    postedDate: "2025-05-14"
  },
  {
    id: "r2",
    title: "Tech Support Needed for Senior Citizens",
    category: "Technology",
    location: "North Portland",
    description: "Senior center seeking volunteers to provide basic computer and smartphone training to elderly members.",
    postedBy: "Golden Years Center",
    postedDate: "2025-05-09"
  },
  {
    id: "r3",
    title: "Donations Needed for Homeless Shelter",
    category: "Donations",
    location: "Downtown Portland",
    description: "Shelter urgently needs blankets, warm clothing, and non-perishable food items for the upcoming winter season.",
    postedBy: "Portland Shelter Alliance",
    postedDate: "2025-05-11"
  },
  {
    id: "r4",
    title: "Mentors Needed for Youth Program",
    category: "Mentorship",
    location: "West Portland",
    description: "After-school program looking for adults willing to mentor at-risk youth (2 hours per week commitment).",
    postedBy: "Future Leaders Program",
    postedDate: "2025-05-13"
  }
];

const categories = [
  "All Categories",
  "Education",
  "Technology",
  "Creative Services",
  "Manual Labor", 
  "Legal",
  "Mentorship",
  "Donations",
  "Healthcare",
  "Financial Services",
  "Other"
];

const SearchHelp = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [locationFilter, setLocationFilter] = useState("");
  const [postType, setPostType] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setLocationFilter("");
    setPostType("all");
    setSortBy("newest");
  };
  
  const filterItems = (items: any[]) => {
    return items.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "All Categories" || 
        item.category === selectedCategory;
      
      const matchesLocation = 
        !locationFilter || 
        item.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      const matchesType = 
        postType === "all" || 
        (postType === "offers" && item.id.startsWith('o')) ||
        (postType === "requests" && item.id.startsWith('r'));
      
      return matchesSearch && matchesCategory && matchesLocation && matchesType;
    });
  };
  
  // Apply filters
  const filteredOffers = filterItems(sampleOffers);
  const filteredRequests = filterItems(sampleRequests);
  let allFiltered = [...filteredOffers, ...filteredRequests];
  
  // Apply sorting
  const sortItems = (items: any[]) => {
    if (sortBy === "newest") {
      return [...items].sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
    } else if (sortBy === "oldest") {
      return [...items].sort((a, b) => new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime());
    }
    return items;
  };
  
  filteredOffers.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
  filteredRequests.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
  allFiltered = sortItems(allFiltered);
  
  const displayResults = () => {
    let itemsToShow;
    
    switch(activeTab) {
      case "offers":
        itemsToShow = filteredOffers;
        break;
      case "requests":
        itemsToShow = filteredRequests;
        break;
      default:
        itemsToShow = allFiltered;
    }
    
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
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itemsToShow.map(item => (
          <Card key={item.id} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge className={`${item.id.startsWith('o') ? 'bg-thryvance-blue-light text-thryvance-blue' : 'bg-thryvance-green-light text-thryvance-green'}`}>
                  {item.id.startsWith('o') ? 'Offering' : 'Request'}
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
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-thryvance-blue-light py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Search Help</h1>
          <p className="text-gray-700 max-w-3xl">
            Find offers of help or requests for assistance in our community. Filter by category, location, or search for specific skills or needs.
          </p>
        </div>
      </div>
      
      <main className="flex-grow py-10 bg-thryvance-neutral-light">
        <div className="container mx-auto px-4">
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
                          <Label htmlFor="newest" className="cursor-pointer">Newest First</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="oldest" id="oldest" />
                          <Label htmlFor="oldest" className="cursor-pointer">Oldest First</Label>
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchHelp;
