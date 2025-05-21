
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Post {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  location: string | null;
  status: string | null;
  created_at: string;
  user_id: string;
  username?: string;
  name?: string;
  avatar?: string;
}

const AdminPosts = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { toast } = useToast();
  const pageSize = 10;
  
  useEffect(() => {
    fetchPosts();
  }, [page]);
  
  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Calculate the range based on page and pageSize
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
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
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include user profile information
      const formattedPosts = data.map(post => ({
        ...post,
        username: post.profiles?.username,
        name: post.profiles?.name,
        avatar: post.profiles?.avatar
      }));
      
      setPosts(formattedPosts);
    } catch (error: any) {
      toast({
        title: "Error fetching posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const deletePost = async (postId: string) => {
    setDeletingId(postId);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      
      toast({
        title: "Post deleted",
        description: "The post has been permanently deleted.",
      });
      
      // Remove post from state
      setPosts(posts.filter(p => p.id !== postId));
    } catch (error: any) {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Post Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && posts.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {post.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant={post.type === 'offer' ? 'outline' : 'secondary'}>
                            {post.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
                          </Badge>
                        </TableCell>
                        <TableCell>{post.name || post.username || 'Unknown'}</TableCell>
                        <TableCell>{post.category || 'Uncategorized'}</TableCell>
                        <TableCell>{post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : 'Unknown'}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPost(post)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => deletePost(post.id)}
                              disabled={deletingId === post.id}
                            >
                              {deletingId === post.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={posts.length < pageSize || loading}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Post View Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        {selectedPost && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedPost.title}</DialogTitle>
              <DialogDescription>
                {selectedPost.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
                {selectedPost.created_at && ` • ${format(new Date(selectedPost.created_at), 'MMM d, yyyy')}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Author:</span>
                <span>{selectedPost.name || selectedPost.username || 'Unknown'}</span>
              </div>
              
              {selectedPost.category && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Category:</span>
                  <span>{selectedPost.category}</span>
                </div>
              )}
              
              {selectedPost.location && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Location:</span>
                  <span>{selectedPost.location}</span>
                </div>
              )}
              
              {selectedPost.status && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Status:</span>
                  <span>{selectedPost.status}</span>
                </div>
              )}
              
              <div className="mt-4">
                <span className="font-medium block mb-2">Description:</span>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedPost.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default AdminPosts;
