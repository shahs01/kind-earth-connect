
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/search/SearchFilters";
import ResultsDisplay from "@/components/search/ResultsDisplay";
import { sampleOffers, sampleRequests, categories } from "@/data/searchHelpData";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SearchHelp = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [locationFilter, setLocationFilter] = useState("");
  const [postType, setPostType] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const { isAuthenticated } = useAuth();
  
  // This would normally be a fetch request to get real data from the database
  // For now, we're simulating an empty state by using empty arrays
  const realOffers = []; // This would normally be a fetch from the backend
  const realRequests = []; // This would normally be a fetch from the backend
  
  // Show sample data only if there are actual posts (which for now, there aren't)
  const offers = realOffers.length > 0 ? realOffers : [];
  const requests = realRequests.length > 0 ? realRequests : [];
  
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
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "All Categories" || 
        item.category === selectedCategory;
      
      const matchesLocation = 
        !locationFilter || 
        item.location?.toLowerCase().includes(locationFilter.toLowerCase());
      
      const matchesType = 
        postType === "all" || 
        (postType === "offers" && item.id.startsWith('o')) ||
        (postType === "requests" && item.id.startsWith('r'));
      
      return matchesSearch && matchesCategory && matchesLocation && matchesType;
    });
  };
  
  // Apply filters
  const filteredOffers = filterItems(offers);
  const filteredRequests = filterItems(requests);
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
  
  const noPostsYet = !offers.length && !requests.length;
  
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
          
          {noPostsYet ? (
            <div className="mt-8 text-center py-16 bg-white rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-2">No Posts Yet</h2>
              <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                Be the first to share an offer or request in our community. Help others or get the assistance you need by creating a post.
              </p>
              
              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark">
                    <Link to="/offer-help">Offer Help</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/request-help">Request Help</Link>
                  </Button>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      You need to be logged in to post offers or requests.
                    </AlertDescription>
                  </Alert>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button asChild>
                      <Link to="/login">Log In</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ResultsDisplay 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              filteredOffers={filteredOffers}
              filteredRequests={filteredRequests}
              allFiltered={allFiltered}
              handleClearFilters={handleClearFilters}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchHelp;
