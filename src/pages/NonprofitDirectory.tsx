
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Filter } from "lucide-react";
import NonprofitCard from "@/components/NonprofitCard";
import NonprofitDetailDialog from "@/components/NonprofitDetailDialog";
import { useNonprofits, Nonprofit } from "@/hooks/useNonprofits";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

const NonprofitDirectory = () => {
  const { fetchNonprofits, loading } = useNonprofits();
  const [nonprofits, setNonprofits] = useState<Nonprofit[]>([]);
  const [filteredNonprofits, setFilteredNonprofits] = useState<Nonprofit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedNonprofit, setSelectedNonprofit] = useState<Nonprofit | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const nonprofitsPerPage = 20;

  // Fetch nonprofits on component mount
  useEffect(() => {
    const loadNonprofits = async () => {
      const data = await fetchNonprofits();
      setNonprofits(data);
      setFilteredNonprofits(data);
    };
    loadNonprofits();
  }, []);

  // Filter nonprofits based on search and filters
  useEffect(() => {
    let filtered = nonprofits;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(nonprofit =>
        nonprofit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nonprofit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nonprofit.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(nonprofit => nonprofit.category === selectedCategory);
    }

    // Filter by location
    if (selectedLocation !== "all") {
      filtered = filtered.filter(nonprofit => 
        nonprofit.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredNonprofits(filtered);
    setCurrentPage(1);
  }, [nonprofits, searchTerm, selectedCategory, selectedLocation]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Get unique categories and locations for filters
  const categories = [...new Set(nonprofits.map(np => np.category))];
  const locations = [...new Set(nonprofits.map(np => np.location))];

  const handleNonprofitClick = (nonprofit: Nonprofit) => {
    setSelectedNonprofit(nonprofit);
    setShowDetailDialog(true);
  };

  // Pagination logic
  const indexOfLastNonprofit = currentPage * nonprofitsPerPage;
  const indexOfFirstNonprofit = indexOfLastNonprofit - nonprofitsPerPage;
  const currentNonprofits = filteredNonprofits.slice(indexOfFirstNonprofit, indexOfLastNonprofit);
  const totalPages = Math.ceil(filteredNonprofits.length / nonprofitsPerPage);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Nonprofit Directory</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Discover local nonprofits making a difference in our community. Connect with organizations 
              that align with your values and interests.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search nonprofits by name, description, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <MapPin className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {currentNonprofits.length > 0 ? `${indexOfFirstNonprofit + 1}-${indexOfFirstNonprofit + currentNonprofits.length}` : 0} of {filteredNonprofits.length} nonprofits
            </p>
          </div>

          {/* Nonprofits Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thryvance-green"></div>
              <span className="ml-2">Loading nonprofits...</span>
            </div>
          ) : currentNonprofits.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MapPin className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No nonprofits found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory !== "all" || selectedLocation !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "Be the first to add a nonprofit to our directory!"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentNonprofits.map(nonprofit => (
                <NonprofitCard 
                  key={nonprofit.id} 
                  nonprofit={nonprofit}
                  onClick={() => handleNonprofitClick(nonprofit)}
                />
              ))}
            </div>
          )}
          
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="px-4 py-2 text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-12 text-center bg-thryvance-green-light rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Don't see your organization?
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Join our directory to connect with volunteers and supporters in your community. 
              It's free and easy to get started.
            </p>
            <Button 
              className="bg-thryvance-green hover:bg-thryvance-green-dark"
              onClick={() => window.location.href = '/list-nonprofit'}
            >
              List Your Nonprofit
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      
      <NonprofitDetailDialog
        nonprofit={selectedNonprofit}
        isOpen={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
      />
    </div>
  );
};

export default NonprofitDirectory;
