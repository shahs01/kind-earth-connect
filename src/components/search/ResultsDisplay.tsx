
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, Handshake, Loader2 } from "lucide-react";
import ResultCard from "./ResultCard";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ResultsDisplayProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  categoryFilter: string;
  locationFilter: string;
  sortBy?: string;
}

const ResultsDisplay = ({
  activeTab,
  setActiveTab,
  searchQuery,
  categoryFilter,
  locationFilter,
  sortBy = "newest"
}: ResultsDisplayProps) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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
        
        let query = supabase
          .from('posts')
          .select('*')
          .eq('status', 'active')
          .not('description', 'like', '%Schedule:%'); // Exclude volunteer opportunities
          
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
              photos: post.photos,
              user: {
                id: post.user_id,
                name: profileData?.name || profileData?.username || "Unknown User",
                avatar: profileData?.avatar || "https://ui-avatars.com/api/?name=User"
              },
              likes: 0,
              comments: 0
            };
          }));
          
          console.log("Formatted posts for search:", formattedPosts);
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

  const handleConnect = (userId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to connect with other users",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    navigate(`/messages/${userId}`);
    toast({
      title: "Connection initiated",
      description: "You can now message this user"
    });
  };

  const displayResults = () => {
    const itemsToShow = getItemsToShow();
    
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
          <span className="ml-2">Loading results...</span>
        </div>
      );
    }

    if (itemsToShow.length === 0) {
      return (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700">No results found</h3>
          <p className="text-gray-500 mt-2">
            Try adjusting your search criteria or browse all posts
          </p>
          <div className="mt-4 space-x-2">
            <Button onClick={handleClearFilters} variant="outline">
              Clear Filters
            </Button>
            {!isAuthenticated && (
              <Button asChild>
                <Link to="/create-posting">Create a Post</Link>
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itemsToShow.map((item) => (
          <ResultCard 
            key={item.id} 
            post={item} 
            onConnect={handleConnect}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Handshake className="h-4 w-4" />
            Offers ({offers.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Requests ({requests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {displayResults()}
        </TabsContent>

        <TabsContent value="offers" className="mt-6">
          {displayResults()}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          {displayResults()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResultsDisplay;
