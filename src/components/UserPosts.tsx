
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Trash2, Edit, AlertCircle, Loader2 } from "lucide-react";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface Post {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  created_at: string;
  location: string | null;
  status: string | null;
  photos?: string[] | null;
}

interface UserPostsProps {
  userId?: string;
}

const UserPosts = ({ userId }: UserPostsProps) => {
  const { user } = useAuth();
  const { fetchUserPosts, deletePost, isLoading: loadingPosts } = useProfileManagement();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Determine whose posts we're showing
  const targetUserId = userId || user?.id;
  const isOwnProfile = user?.id === targetUserId;

  useEffect(() => {
    const loadPosts = async () => {
      if (!targetUserId) {
        setIsLoading(false);
        return;
      }
      
      console.log("Loading posts for user:", targetUserId);
      setIsLoading(true);
      setError(null);
      
      try {
        const userPosts = await fetchUserPosts(targetUserId);
        console.log("Fetched posts:", userPosts);
        setPosts(userPosts);
      } catch (err: any) {
        console.error("Error loading posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [targetUserId, fetchUserPosts]);

  const handleDelete = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      const success = await deletePost(postId);
      if (success) {
        // Remove the deleted post from state
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      }
    }
  };

  const handleEditPost = (postId: string) => {
    // For now just navigate to edit page
    window.location.href = `/edit-post/${postId}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 my-4">
        <h2 className="text-2xl font-bold">
          {isOwnProfile ? "My Posts" : "User's Posts"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">
          {isOwnProfile 
            ? "You haven't created any posts yet." 
            : "This user hasn't created any posts yet."}
        </p>
        {isOwnProfile && (
          <div className="flex justify-center gap-4">
            <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark">
              <Link to="/offer-help">Offer Help</Link>
            </Button>
            <Button asChild className="bg-thryvance-blue hover:bg-thryvance-blue-dark">
              <Link to="/request-help">Request Help</Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 my-4">
      <h2 className="text-2xl font-bold">
        {isOwnProfile ? "My Posts" : "User's Posts"}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">{post.title}</CardTitle>
                <Badge variant={post.type === 'offer' ? 'outline' : 'default'} className={
                  post.type === 'offer' 
                    ? 'bg-thryvance-green-light text-thryvance-green border-thryvance-green' 
                    : 'bg-thryvance-blue-light text-thryvance-blue'
                }>
                  {post.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Posted on {new Date(post.created_at).toLocaleDateString()}
              </div>
            </CardHeader>
            
            <CardContent className="pt-4">
              <p className="text-gray-700 mb-3 line-clamp-3">{post.description}</p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {post.category && (
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                )}
                {post.location && (
                  <div className="text-xs text-gray-500">📍 {post.location}</div>
                )}
              </div>
            </CardContent>
            
            {isOwnProfile && (
              <CardFooter className="border-t pt-3 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => handleEditPost(post.id)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserPosts;
