
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/search/SearchFilters";
import CommunityFeed from "@/components/CommunityFeed";
import MobileCommunityFeed from "@/components/MobileCommunityFeed";
import { categories } from "@/data/searchHelpData";
import { useAuth } from "@/context/AuthContext";

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [locationFilter, setLocationFilter] = useState("");
  const [postType, setPostType] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const { isAuthenticated } = useAuth();
  
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setLocationFilter("");
    setPostType("all");
    setSortBy("newest");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-thryvance-blue-light py-6 md:py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3">Community</h1>
          <p className="text-gray-700 max-w-3xl text-sm md:text-base">
            Connect with your community. Share offers of help or request assistance from neighbors and local organizations.
          </p>
        </div>
      </div>
      
      <main className="flex-grow bg-thryvance-neutral-light">
        {/* Mobile Compact Filters */}
        <div className="block md:hidden border-b bg-white">
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All</option>
                <option value="offers">Offers</option>
                <option value="requests">Requests</option>
              </select>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="All Categories">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            {(searchQuery || selectedCategory !== "All Categories" || locationFilter || postType !== "all") && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-thryvance-blue hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:block py-6">
          <div className="container mx-auto px-4">
            <SearchFilters 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              locationFilter={locationFilter}
              setLocationFilter={setLocationFilter}
              postType={postType}
              setPostType={setPostType}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              showAdvancedFilters={showAdvancedFilters}
              setShowAdvancedFilters={setShowAdvancedFilters}
              handleClearFilters={handleClearFilters}
              categories={categories}
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="pb-10">
          {/* Mobile Feed */}
          <div className="block md:hidden">
            <MobileCommunityFeed
              searchQuery={searchQuery}
              locationFilter={locationFilter}
              postTypeFilter={postType === "all" ? "" : postType}
              sortBy={sortBy}
            />
          </div>
          
          {/* Desktop Feed */}
          <div className="hidden md:block">
            <div className="container mx-auto px-4">
              <CommunityFeed
                searchQuery={searchQuery}
                locationFilter={locationFilter}
                postTypeFilter={postType === "all" ? "" : postType}
                sortBy={sortBy}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Community;
