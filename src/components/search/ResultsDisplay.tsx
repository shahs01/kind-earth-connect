
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, Handshake } from "lucide-react";
import ResultCard from "./ResultCard";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ResultsDisplayProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredOffers: any[];
  filteredRequests: any[];
  allFiltered: any[];
  handleClearFilters: () => void;
  searchQuery: string;
  categoryFilter: string;
  locationFilter: string;
}

const ResultsDisplay = ({
  activeTab,
  setActiveTab,
  filteredOffers,
  filteredRequests,
  allFiltered,
  handleClearFilters,
  searchQuery,
  categoryFilter,
  locationFilter
}: ResultsDisplayProps) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  
  // Fetch posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        
        let query = supabase
          .from('posts')
          .select(`
            *,
            profiles(name, avatar, username)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
          
        // Apply search filters if provided
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }
        
        if (categoryFilter && categoryFilter !== "All Categories") {
          query = query.eq('category', categoryFilter);
        }
        
        if (locationFilter) {
          query = query.ilike('location', `%${locationFilter}%`);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data) {
          const formattedPosts = data.map(post => {
            // Handle the profiles relationship - it returns an array of profiles
            const profileData = post.profiles && Array.isArray(post.profiles) && post.profiles.length > 0 
              ? post.profiles[0] 
              : { name: "Unknown User", avatar: null, username: null };
            
            return {
              id: post.id,
              type: post.type,
              title: post.title,
              description: post.description,
              location: post.location,
              createdAt: new Date(post.created_at).toLocaleString(),
              user: {
                name: typeof profileData === 'object' ? profileData.name || "Unknown User" : "Unknown User",
                avatar: typeof profileData === 'object' ? profileData.avatar || "https://ui-avatars.com/api/?name=User" : "https://ui-avatars.com/api/?name=User"
              },
              likes: 0,
              comments: 0
            };
          });
          
          setPosts(formattedPosts);
          setOffers(formattedPosts.filter(post => post.type === 'offer'));
          setRequests(formattedPosts.filter(post => post.type === 'request'));
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [searchQuery, categoryFilter, locationFilter]);
  
  const getItemsToShow = () => {
    switch(activeTab) {
      case "offers":
        return offers;
      case "requests":
        return requests;
      default:
        return posts;
    }
  };

  const displayResults = () => {
    const itemsToShow = getItemsToShow();
    
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 h-48 rounded-lg"></div>
          ))}
        </div>
      );
    }
    
    if (itemsToShow.length === 0) {
      return (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700">No results found</h3>
          <p className="text-gray-500 mt-2">
            {searchQuery || categoryFilter || locationFilter 
              ? "Try adjusting your search filters" 
              : "No posts have been created yet"}
          </p>
          
          {(searchQuery || categoryFilter || locationFilter) && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleClearFilters}
            >
              Clear filters
            </Button>
          )}
          
          {isAuthenticated && (
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark">
                <Link to="/offer-help">Offer Help</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/request-help">Request Help</Link>
              </Button>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 gap-6">
        {itemsToShow.map(item => (
          <ResultCard key={item.id} item={item} />
        ))}
      </div>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          Search Results 
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({posts.length} {posts.length === 1 ? 'result' : 'results'})
          </span>
        </h2>
        
        <TabsList>
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Users className="h-4 w-4" /> All
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" /> Offers
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-1">
            <Handshake className="h-4 w-4" /> Requests
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="all">{displayResults()}</TabsContent>
      <TabsContent value="offers">{displayResults()}</TabsContent>
      <TabsContent value="requests">{displayResults()}</TabsContent>
    </Tabs>
  );
};

export default ResultsDisplay;
