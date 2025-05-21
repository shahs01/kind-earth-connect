
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, CheckCircle, XCircle, Calendar, Clock, User, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Post {
  id: string;
  title: string;
  description?: string;
  type: string;
  category?: string;
  location?: string;
  status?: string;
  created_at: string;
  user_id: string;
  user?: {
    username: string;
    name: string;
    avatar: string;
  };
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    loadPosts();
  }, []);
  
  async function loadPosts() {
    try {
      setLoading(true);
      
      // Get all posts with user details
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            name,
            avatar
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match the Post interface
      const formattedPosts: Post[] = data?.map((post: any) => ({
        ...post,
        user: post.profiles || { username: 'unknown', name: 'Unknown User', avatar: '' }
      })) || [];
      
      setPosts(formattedPosts);
    } catch (error: any) {
      console.error("Error loading posts:", error);
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }
  
  async function handleStatusChange(postId: string, newStatus: string) {
    try {
      setUpdatingId(postId);
      
      const { error } = await supabase
        .from('posts')
        .update({ status: newStatus })
        .eq('id', postId);
      
      if (error) throw error;
      
      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, status: newStatus } : post
      ));
      
      toast({
        title: "Status updated",
        description: `Post status changed to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  }
  
  async function handleDeletePost(postId: string) {
    try {
      setDeletingId(postId);
      
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      
      // Remove from local state
      setPosts(prev => prev.filter(post => post.id !== postId));
      
      toast({
        title: "Post deleted",
        description: "The post has been permanently deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Manage Posts</h2>
        <p className="text-muted-foreground mb-6">
          Review, approve, or remove posts from the community.
        </p>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          {['all', 'active', 'pending', 'rejected'].map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {posts
                .filter(post => tab === 'all' || post.status === tab)
                .map(post => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle>{post.title}</CardTitle>
                          <CardDescription className="flex items-center mt-1 space-x-4">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {format(new Date(post.created_at), 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {post.user?.name || 'Unknown User'}
                            </span>
                            {post.location && (
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {post.location}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center">
                          <Badge variant={
                            post.type === 'offer' 
                              ? 'outline' 
                              : 'secondary'
                          }>
                            {post.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={post.user?.avatar || ''} alt={post.user?.name || 'User'} />
                          <AvatarFallback>{post.user?.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">@{post.user?.username || 'user'}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {post.description || 'No description provided'}
                          </p>
                          {post.category && (
                            <Badge variant="outline" className="mt-2">
                              {post.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t bg-gray-50 flex justify-between">
                      <div className="flex items-center">
                        <Badge variant={
                          post.status === 'active' ? 'outline' :
                          post.status === 'pending' ? 'secondary' :
                          'destructive'
                        }>
                          {post.status}
                        </Badge>
                      </div>
                      
                      <div className="flex space-x-2">
                        {post.status !== 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-600"
                            onClick={() => handleStatusChange(post.id, 'active')}
                            disabled={updatingId === post.id}
                          >
                            {updatingId === post.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                        )}
                        
                        {post.status !== 'rejected' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-amber-600"
                            onClick={() => handleStatusChange(post.id, 'rejected')}
                            disabled={updatingId === post.id}
                          >
                            {updatingId === post.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </>
                            )}
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600"
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletingId === post.id}
                        >
                          {deletingId === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
                
              {posts.filter(post => tab === 'all' || post.status === tab).length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">No posts found</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
