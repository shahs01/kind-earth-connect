
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PostsList from "@/components/PostsList";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, MapPin, Filter, SortDesc } from "lucide-react";
import { categories } from "@/data/searchHelpData";

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [postType, setPostType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTab, setSearchTab] = useState("posts");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-thryvance-green-light py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Community & Help</h1>
          <p className="text-gray-700 max-w-3xl">
            Connect with others in your community. Find offers of help, requests for assistance, volunteer opportunities, or nonprofits. 
            Search across all categories or filter for specific needs.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search across all community resources..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Filter by location..." 
                  className="pl-10"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs value={searchTab} onValueChange={setSearchTab} className="mt-6">
              <TabsList className="w-full md:w-auto grid grid-cols-2 md:flex md:space-x-2">
                <TabsTrigger value="posts">Community Posts</TabsTrigger>
                <TabsTrigger value="nonprofits">Nonprofits</TabsTrigger>
                <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
                <TabsTrigger value="all">All Resources</TabsTrigger>
              </TabsList>
              
              <div className="mt-4">
                {searchTab === "posts" && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <Select 
                        value={selectedCategory} 
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="w-[200px]">
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Select category" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Categories">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select 
                        value={postType} 
                        onValueChange={setPostType}
                      >
                        <SelectTrigger className="w-[200px]">
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Post type" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Posts</SelectItem>
                          <SelectItem value="offers">Offers Only</SelectItem>
                          <SelectItem value="requests">Requests Only</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select 
                        value={sortBy} 
                        onValueChange={setSortBy}
                      >
                        <SelectTrigger className="w-[200px]">
                          <div className="flex items-center gap-2">
                            <SortDesc className="h-4 w-4" />
                            <SelectValue placeholder="Sort posts" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => {
                        setSearchQuery("");
                        setLocationFilter("");
                        setPostType("all");
                        setSortBy("newest");
                        setSelectedCategory("All Categories");
                      }}>
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <main className="flex-grow container mx-auto px-4 pb-10">
        <TabsContent value="posts" className="mt-0">
          <PostsList 
            searchQuery={searchQuery} 
            categoryFilter={selectedCategory !== "All Categories" ? selectedCategory : ""}
            typeFilter={postType === "all" ? null : (postType === "offers" ? "offer" : "request")}
            locationFilter={locationFilter}
            sortBy={sortBy}
          />
        </TabsContent>
        
        <TabsContent value="nonprofits" className="mt-0">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-4">Nonprofit Directory</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Find nonprofits in your area or list your nonprofit organization.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark">
                <a href="/nonprofit-directory">Browse Nonprofits</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/list-nonprofit">List Your Nonprofit</a>
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="volunteers" className="mt-0">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-4">Volunteer Opportunities</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Find volunteer opportunities in your community or post opportunities for your organization.
            </p>
            <Button asChild className="bg-thryvance-blue hover:bg-thryvance-blue-dark">
              <a href="/volunteer">View Volunteer Opportunities</a>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Community Posts</h2>
              <PostsList 
                searchQuery={searchQuery} 
                locationFilter={locationFilter}
                limit={3}
              />
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <a href="/community" onClick={() => setSearchTab('posts')}>See All Posts</a>
                </Button>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Nonprofits</h2>
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">
                  Find nonprofits in your area or list your nonprofit organization.
                </p>
                <Button asChild size="sm">
                  <a href="/nonprofit-directory">Browse Nonprofits</a>
                </Button>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Volunteer Opportunities</h2>
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">
                  Find volunteer opportunities or post opportunities for volunteers.
                </p>
                <Button asChild size="sm">
                  <a href="/volunteer">View Opportunities</a>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
