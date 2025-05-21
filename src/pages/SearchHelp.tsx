
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/search/SearchFilters";
import ResultsDisplay from "@/components/search/ResultsDisplay";
import { sampleOffers, sampleRequests, categories } from "@/data/searchHelpData";

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
  
  // Sort the filtered results
  allFiltered = sortItems(allFiltered);
  
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
          
          <ResultsDisplay 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filteredOffers={filteredOffers}
            filteredRequests={filteredRequests}
            allFiltered={allFiltered}
            handleClearFilters={handleClearFilters}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchHelp;
