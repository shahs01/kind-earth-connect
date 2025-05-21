import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, Handshake, Loader2 } from "lucide-react";
import ResultCard from "./ResultCard";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define an interface for profile data to help TypeScript
interface ProfileData {
  name?: string;
  avatar?: string;
  username?: string;
}

interface ResultsDisplayProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  categoryFilter: string;
  locationFilter: string;
  sortBy?: string; // Add sortBy prop
}

const ResultsDisplay = ({
  activeTab,
  setActiveTab,
  searchQuery,
  categoryFilter,
  locationFilter,
  sortBy = "newest" // Default to newest
}: ResultsDisplayProps) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  
  const handleClearFilters = () => {
    window.location.href = '/search-help';
  };
  
  // Fetch posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching search results with:", { searchQuery, categoryFilter, locationFilter, sortBy });
        
        // Updated query to fetch posts first, then get profiles separately
        let query = supabase
          .from('posts')
          .select('*')
          .eq('status', 'active');
          
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

        // Apply sorting based on sortBy prop
        if (sortBy === "oldest") {
          query = query.order('created_at', { ascending: true });
        } else {
          // Default to newest first
          query = query.order('created_at', { ascending: false });
        }

        const { data: postsData, error: postsError } = await query;
        
        if (postsError) throw postsError;
        
        if (postsData && postsData.length > 0) {
          // Process each post with its associated profile data
          const formattedPosts = await Promise.all(postsData.map(async (post) => {
            // Get the profile data in a separate query
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', post.user_id)
              .single();
              
            return {
              id: post.id,
              type: post.type,
              title: post.title,
              description: post.description,
              location: post.location,
              category: post.category,
              createdAt: new Date(post.created_at).toLocaleString(),
              user: {
                name: profileData?.name || profileData?.username || "Unknown User",
                avatar: profileData?.avatar || "https://ui-avatars.com/api/?name=User"
              },
              likes: 0,
              comments: 0
            };
          }));
          
          setPosts(formattedPosts);
          setOffers(formattedPosts.filter(post => post.type === 'offer'));
          setRequests(formattedPosts.filter(post => post.type === 'request'));
          
          if (formattedPosts.length === 0) {
            toast({
              title: "No results found",
              description: "Try adjusting your search filters to find more posts",
              variant: "default"
            });
          }
        } else {
          setPosts([]);
          setOffers([]);
          setRequests([]);
          toast({
            title: "No results found",
            description: "Try adjusting your search filters to find more posts",
            variant: "default"
          });
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        toast({
          title: "Error fetching posts",
          description: "Could not load search results. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [searchQuery, categoryFilter, locationFilter, sortBy, toast]);
  
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
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-thryvance-green mb-4" />
          <p className="text-gray-600">Loading search results...</p>
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
                <Link to="/create-posting">Create a Post</Link>
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
