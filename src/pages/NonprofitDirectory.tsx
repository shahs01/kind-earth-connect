
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NonprofitCard from "@/components/NonprofitCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNonprofits, Nonprofit } from "@/hooks/useNonprofits";
import { Search, Loader2, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Phone, Mail } from "lucide-react";

const categories = [
  "All Categories",
  "Food Assistance",
  "Housing & Shelter",
  "Healthcare",
  "Youth Services",
  "Senior Services",
  "Veterans Services",
  "Education",
  "Job Training",
  "Crisis Support",
  "Mental Health",
  "Disability Services",
  "Environmental",
  "Animal Welfare"
];

const NonprofitDirectory = () => {
  const { loading, fetchNonprofits } = useNonprofits();
  const [nonprofits, setNonprofits] = useState<Nonprofit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  
  useEffect(() => {
    loadNonprofits();
  }, []);

  const loadNonprofits = async () => {
    const data = await fetchNonprofits(false); // Only active nonprofits for public
    setNonprofits(data);
  };

  const filteredNonprofits = nonprofits.filter(nonprofit => {
    const matchesSearch = 
      nonprofit.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      nonprofit.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All Categories" || nonprofit.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-thryvance-green mx-auto mb-4" />
            <p className="text-gray-600">Loading nonprofits...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-thryvance-blue-light py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Find Local Nonprofits</h1>
          <p className="text-gray-700 max-w-3xl">
            Discover organizations in your community that provide specialized support and services.
          </p>
        </div>
      </div>
      
      <main className="flex-grow py-10 bg-thryvance-neutral-light">
        <div className="container mx-auto px-4">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search nonprofits..." 
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
              
              <Input placeholder="Location (Portland, OR)" />
            </div>
          </div>
          
          <Tabs defaultValue="grid">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {filteredNonprofits.length} {filteredNonprofits.length === 1 ? "Result" : "Results"}
              </h2>
              
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="grid">
              {/* Mobile: 3 columns, Tablet: 2 columns, Desktop: 3 columns */}
              <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                {filteredNonprofits.length > 0 ? (
                  filteredNonprofits.map((nonprofit) => (
                    <NonprofitCard key={nonprofit.id} nonprofit={nonprofit} />
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700">No results found</h3>
                    <p className="text-gray-500 mt-2">
                      Try adjusting your search or category filters
                    </p>
                    <Button 
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All Categories");
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="list">
              <div className="space-y-4">
                {filteredNonprofits.length > 0 ? (
                  filteredNonprofits.map((nonprofit) => (
                    <div 
                      key={nonprofit.id}
                      className="bg-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row gap-6"
                    >
                      <div className="h-24 w-24 rounded-lg bg-thryvance-neutral flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {nonprofit.logo ? (
                          <img 
                            src={nonprofit.logo} 
                            alt={nonprofit.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building className="h-8 w-8 text-thryvance-green" />
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold">{nonprofit.name}</h3>
                            <div className="flex items-center gap-6 mt-1">
                              <Badge className="bg-thryvance-green-light/50 text-thryvance-green border-thryvance-green/20">
                                {nonprofit.category}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{nonprofit.location}</span>
                              </div>
                            </div>
                          </div>
                          
                          <Button className="bg-thryvance-green hover:bg-thryvance-green-dark whitespace-nowrap">
                            Contact
                          </Button>
                        </div>
                        
                        <p className="text-gray-600 mt-3">
                          {nonprofit.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                          {nonprofit.website && (
                            <a 
                              href={nonprofit.website} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-sm text-thryvance-blue hover:underline flex items-center gap-1"
                            >
                              <Globe className="h-4 w-4" />
                              <span>Website</span>
                            </a>
                          )}
                          
                          {nonprofit.phone_number && (
                            <a 
                              href={`tel:${nonprofit.phone_number}`} 
                              className="text-sm text-thryvance-blue hover:underline flex items-center gap-1"
                            >
                              <Phone className="h-4 w-4" />
                              <span>{nonprofit.phone_number}</span>
                            </a>
                          )}
                          
                          {nonprofit.email && (
                            <a 
                              href={`mailto:${nonprofit.email}`} 
                              className="text-sm text-thryvance-blue hover:underline flex items-center gap-1"
                            >
                              <Mail className="h-4 w-4" />
                              <span>{nonprofit.email}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-700">No results found</h3>
                    <p className="text-gray-500 mt-2">
                      Try adjusting your search or category filters
                    </p>
                    <Button 
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All Categories");
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NonprofitDirectory;
