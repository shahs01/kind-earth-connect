
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/search/SearchFilters";
import PostsGrid from "@/components/PostsGrid";
import { categories } from "@/data/searchHelpData";
import { useAuth } from "@/context/AuthContext";

const SearchHelp = () => {
  const [activeTab, setActiveTab] = useState("all");
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
      
      <div className="bg-thryvance-blue-light py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Search Help</h1>
          <p className="text-gray-700 max-w-3xl mx-auto">
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
          
          <PostsGrid
            searchQuery={searchQuery}
            categoryFilter={selectedCategory !== "All Categories" ? selectedCategory : ""}
            typeFilter={postType === "all" ? null : (postType === "offers" ? "offer" : "request")}
            locationFilter={locationFilter}
            sortBy={sortBy}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchHelp;
