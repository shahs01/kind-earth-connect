
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar } from "lucide-react";

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
      
      return matchesSearch && matchesCategory && matchesLocation;
    });
  };
  
  const filteredOffers = filterItems(sampleOffers);
  const filteredRequests = filterItems(sampleRequests);
  const allFiltered = [...filteredOffers, ...filteredRequests];
  
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
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All Categories");
              setLocationFilter("");
            }}
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
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search for skills, services, or needs..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
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
              
              <Input 
                placeholder="Filter by location" 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                Search Results
              </h2>
              
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="offers">Offers</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
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
