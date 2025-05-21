
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Heart, MessageSquare, Share2, AlertCircle } from "lucide-react";

interface Post {
  id: number;
  type: string;
  title: string;
  description: string;
  location: string;
  user: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
}

interface CommunityFeedProps {
  searchQuery?: string;
  locationFilter?: string;
  postTypeFilter?: string;
}

const CommunityFeed = ({
  searchQuery = "",
  locationFilter = "",
  postTypeFilter = "all",
}: CommunityFeedProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Simulate fetching posts from an API
    setTimeout(() => {
      // This would be replaced with a real API call
      // For now, just set empty posts array to simulate no posts
      setPosts([]);
      setLoading(false);
    }, 1000);
  }, [searchQuery, locationFilter, postTypeFilter]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Community Posts</h2>
        {isAuthenticated ? (
          <div className="flex gap-2">
            <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark">
              <Link to="/offer-help">Offer Help</Link>
            </Button>
            <Button asChild variant="outline" className="border-thryvance-blue text-thryvance-blue hover:bg-thryvance-blue-light">
              <Link to="/request-help">Request Help</Link>
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button asChild variant="outline" className="border-thryvance-blue text-thryvance-blue hover:bg-thryvance-blue-light">
              <Link to="/login">Login to Post</Link>
            </Button>
          </div>
        )}
      </div>

      {posts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">No posts yet</h3>
            <p className="text-gray-500 mt-2">
              Be the first to create a post in our community!
            </p>
            {isAuthenticated ? (
              <div className="mt-6 flex gap-4 justify-center">
                <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark">
                  <Link to="/offer-help">Offer Help</Link>
                </Button>
                <Button asChild variant="outline" className="border-thryvance-blue text-thryvance-blue hover:bg-thryvance-blue-light">
                  <Link to="/request-help">Request Help</Link>
                </Button>
              </div>
            ) : (
              <Button asChild className="mt-6 bg-thryvance-green hover:bg-thryvance-green-dark">
                <Link to="/login">Login to Create Post</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{post.user.name}</h3>
                    <p className="text-xs text-gray-500">{post.createdAt}</p>
                  </div>
                  <span className="ml-auto px-2 py-1 text-xs font-medium rounded-full bg-thryvance-neutral-light text-thryvance-neutral-dark">
                    {post.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="text-lg font-medium mb-2">{post.title}</h4>
                <p className="text-gray-700 mb-2">{post.description}</p>
                <div className="text-sm text-gray-500">📍 {post.location}</div>
              </CardContent>
              <CardFooter className="border-t border-gray-100 pt-4">
                <div className="flex justify-between w-full">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Heart className="h-4 w-4" /> {post.likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" /> {post.comments}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
