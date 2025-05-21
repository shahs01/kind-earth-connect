
import { useState } from "react";
import { toast } from "sonner";
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
import { Post } from "@/types";

interface PostActionMenuProps {
  post: Post;
  onStatusChange: (post: Post, newStatus: string) => void;
}

const PostActionMenu = ({ post, onStatusChange }: PostActionMenuProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleArchive = () => {
    onStatusChange(post, "archived");
    toast.success("Post archived successfully");
  };

  const handleRepublish = () => {
    onStatusChange(post, "active");
    toast.success("Post republished successfully");
  };

  const handleRenew = () => {
    // In a real app this would update the post date and potentially boost visibility
    onStatusChange({...post, createdAt: new Date()}, "active");
    toast.success("Post renewed successfully");
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    onStatusChange(post, "deleted");
    toast.success("Post deleted successfully");
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
          {post.status === "active" && (
            <DropdownMenuItem onClick={handleArchive} className="cursor-pointer">
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
          )}
          
          {post.status === "archived" && (
            <DropdownMenuItem onClick={handleRepublish} className="cursor-pointer">
              <RefreshCw className="mr-2 h-4 w-4" />
              Republish
            </DropdownMenuItem>
          )}
          
          {post.status === "active" && (
            <DropdownMenuItem onClick={handleRenew} className="cursor-pointer">
              <RefreshCw className="mr-2 h-4 w-4" />
              Renew
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem asChild className="cursor-pointer">
            <a href={`/edit-post/${post.id}`}>
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
              This will permanently delete this {post.type}. This action cannot be undone.
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
