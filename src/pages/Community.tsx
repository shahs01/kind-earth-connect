
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import PostsList from "@/components/PostsList";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, MapPin, Filter, SortDesc } from "lucide-react";
import { categories } from "@/data/searchHelpData";

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [postType, setPostType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("newest");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-thryvance-green-light py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Community & Help</h1>
          <p className="text-gray-700 max-w-3xl">
            Connect with others in your community. Find offers of help or requests for assistance. Filter by category, location, or search for specific skills or needs.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input 
                  placeholder="Search community posts..." 
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
              
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
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
            </div>
            
            <div className="mt-4 flex flex-wrap justify-between items-center">
              <div className="mb-2 md:mb-0 flex gap-4">
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
              </div>
              
              <div className="flex gap-4">
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
          </CardContent>
        </Card>
      </div>
      
      <main className="flex-grow container mx-auto px-4 pb-10">
        <PostsList 
          searchQuery={searchQuery} 
          categoryFilter={selectedCategory !== "All Categories" ? selectedCategory : ""}
          typeFilter={postType === "all" ? null : (postType === "offers" ? "offer" : "request")}
          locationFilter={locationFilter}
          sortBy={sortBy}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Community;
