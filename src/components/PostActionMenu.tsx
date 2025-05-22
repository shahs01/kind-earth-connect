
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Archive, RefreshCw, Trash, Edit } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

interface PostActionMenuProps {
  postId: string;
  onDeleted: () => void;
}

const PostActionMenu = ({ postId, onDeleted }: PostActionMenuProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: newStatus })
        .eq('id', postId);
        
      if (error) throw error;
      
      if (newStatus === 'archived') {
        toast({
          title: "Post archived successfully",
          description: "Your post has been archived."
        });
      } else if (newStatus === 'active') {
        toast({
          title: "Post republished successfully",
          description: "Your post is now visible to the community."
        });
      }
      
      if (newStatus === 'deleted') {
        onDeleted();
      }
    } catch (err) {
      console.error("Error updating post:", err);
      toast({
        title: "Error",
        description: "Failed to update post status",
        variant: "destructive"
      });
    }
  };

  const handleArchive = () => {
    handleStatusChange('archived');
  };

  const handleRepublish = () => {
    handleStatusChange('active');
  };

  const handleRenew = () => {
    // In a real app this would update the post date and potentially boost visibility
    handleStatusChange('active');
    toast({
      title: "Post renewed successfully",
      description: "Your post has been renewed."
    });
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    handleStatusChange('deleted');
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleArchive} className="cursor-pointer">
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleRepublish} className="cursor-pointer">
            <RefreshCw className="mr-2 h-4 w-4" />
            Republish
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleRenew} className="cursor-pointer">
            <RefreshCw className="mr-2 h-4 w-4" />
            Renew
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild className="cursor-pointer">
            <a href={`/edit-post/${postId}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </a>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-600 focus:text-red-600">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this post. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PostActionMenu;
