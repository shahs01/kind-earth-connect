
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, MapPin, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";

interface Post {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string | null;
  created_at: string;
  location: string | null;
  status: string;
  user_id: string;
  profiles: {
    name: string;
    avatar: string | null;
  } | null;
}

interface PostsListProps {
  searchQuery?: string;
  categoryFilter?: string;
  typeFilter?: string | null;
  locationFilter?: string;
}

const PostsList = ({ 
  searchQuery = "", 
  categoryFilter = "",
  typeFilter = null,
  locationFilter = ""
}: PostsListProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Start building the query
        let query = supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (
              name,
              avatar
            )
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        // Apply filters
        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }
        
        if (categoryFilter) {
          query = query.eq('category', categoryFilter);
        }
        
        if (typeFilter) {
          query = query.eq('type', typeFilter);
        }
        
        if (locationFilter) {
          query = query.ilike('location', `%${locationFilter}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        
        setPosts(data || []);
      } catch (err: any) {
        console.error("Error fetching posts:", err);
        setError(err.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchQuery, categoryFilter, typeFilter, locationFilter]);

  if (loading) {
    return (
      <div className="my-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-gray-100"></CardHeader>
              <CardContent className="h-32 mt-4 space-y-3">
                <div className="h-4 bg-gray-100 rounded"></div>
                <div className="h-4 bg-gray-100 rounded w-4/5"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="my-8 border-red-200">
        <CardContent className="text-center py-6">
          <p className="text-red-500">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="my-8 border-gray-200">
        <CardContent className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Posts Found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || categoryFilter || typeFilter || locationFilter
              ? "Try adjusting your search filters"
              : "Be the first to create a post in our community!"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className={
            post.type === 'offer' 
              ? 'border-b-2 border-thryvance-green-light bg-thryvance-green-light/20 pb-3' 
              : 'border-b-2 border-thryvance-blue-light bg-thryvance-blue-light/20 pb-3'
          }>
            <div className="flex justify-between">
              <Badge variant={post.type === 'offer' ? 'outline' : 'default'} className={
                post.type === 'offer' 
                  ? 'bg-thryvance-green-light text-thryvance-green border-thryvance-green' 
                  : 'bg-thryvance-blue-light text-thryvance-blue'
              }>
                {post.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
              </Badge>
              
              {post.category && (
                <Badge variant="secondary" className="text-xs">
                  {post.category}
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-4">
            <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
            
            <p className="text-gray-700 mb-4 line-clamp-3">{post.description}</p>
            
            <div className="flex flex-wrap gap-y-2 text-sm text-gray-500">
              {post.location && (
                <div className="flex items-center gap-1 w-full">
                  <MapPin className="h-3.5 w-3.5" /> 
                  <span className="truncate">{post.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1 w-full">
                <Clock className="h-3.5 w-3.5" /> 
                <span>Posted {new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-3 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.profiles?.avatar || undefined} />
                <AvatarFallback className="bg-thryvance-neutral-light text-thryvance-neutral-dark">
                  <User className="h-3.5 w-3.5" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate max-w-[100px]">
                {post.profiles?.name || "User"}
              </span>
            </div>
            
            <Button size="sm" className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Contact</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PostsList;
