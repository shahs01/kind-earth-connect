
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NonprofitCard from "@/components/NonprofitCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Nonprofit } from "@/types";
import { Search } from "lucide-react";
import { Badge, Globe, Phone, Mail, MapPin } from "@/components/NonprofitUtils";

// Sample nonprofit data
const sampleNonprofits: Nonprofit[] = [
  {
    id: "1",
    name: "Portland Food Bank",
    description: "Providing emergency food assistance to individuals and families in need throughout Portland.",
    category: "Food Assistance",
    location: "Downtown Portland",
    website: "https://example.com/pfb",
    phoneNumber: "(503) 555-1234",
    email: "info@portlandfoodbank.org",
    logo: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80",
    verified: true, // Added verified property
  },
  {
    id: "2",
    name: "Safe Harbor Shelter",
    description: "Emergency shelter and supportive services for individuals experiencing homelessness.",
    category: "Housing & Shelter",
    location: "Southeast Portland",
    website: "https://example.com/shelter",
    phoneNumber: "(503) 555-5678",
    email: "contact@safeharbor.org",
    logo: "", // Added empty logo property
    verified: false, // Added verified property
  },
  {
    id: "3",
    name: "Community Care Clinic",
    description: "Providing affordable healthcare services to underserved populations in our community.",
    category: "Healthcare",
    location: "North Portland",
    website: "https://example.com/clinic",
    phoneNumber: "(503) 555-9876",
    email: "info@carelinic.org",
    logo: "", // Added empty logo property
    verified: true, // Added verified property
  },
  {
    id: "4",
    name: "Youth Mentorship Alliance",
    description: "Connecting youth with positive role models through one-on-one mentorship programs.",
    category: "Youth Services",
    location: "West Portland",
    website: "https://example.com/yma",
    phoneNumber: "(503) 555-4321",
    email: "info@youthmentorship.org",
    logo: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80",
    verified: true, // Added verified property
  },
  {
    id: "5",
    name: "Senior Support Network",
    description: "Services and social activities for seniors to help them live independently and combat isolation.",
    category: "Senior Services",
    location: "Downtown Portland",
    website: "https://example.com/ssn",
    phoneNumber: "(503) 555-8765",
    email: "help@seniorsupport.org",
    logo: "", // Added empty logo property
    verified: false, // Added verified property
  },
  {
    id: "6",
    name: "Veterans Resource Center",
    description: "Supporting veterans with resources, counseling, and community connections.",
    category: "Veterans Services",
    location: "Northeast Portland",
    website: "https://example.com/vrc",
    phoneNumber: "(503) 555-3456",
    email: "info@veteransrc.org",
    logo: "", // Added empty logo property
    verified: true, // Added verified property
  }
];

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
  "Disability Services"
];

const NonprofitDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  
  const filteredNonprofits = sampleNonprofits.filter(nonprofit => {
    const matchesSearch = 
      nonprofit.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      nonprofit.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All Categories" || nonprofit.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNonprofits.length > 0 ? (
                  filteredNonprofits.map((nonprofit) => (
                    <NonprofitCard key={nonprofit.id} nonprofit={nonprofit} />
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center">
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
                          <Search className="h-8 w-8 text-thryvance-green" />
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
                          
                          {nonprofit.phoneNumber && (
                            <a 
                              href={`tel:${nonprofit.phoneNumber}`} 
                              className="text-sm text-thryvance-blue hover:underline flex items-center gap-1"
                            >
                              <Phone className="h-4 w-4" />
                              <span>{nonprofit.phoneNumber}</span>
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
