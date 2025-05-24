
import { useEffect, useState } from "react";
import { useFavorites, Favorite } from "@/hooks/useFavorites";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, Calendar, MapPin, User, Heart, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PostDetailDialog from "@/components/PostDetailDialog";

interface PostDetailDialogPost {
  id: string;
  title: string;
  description: string | null;
  type: "offer" | "request";
  category: string | null;
  location: string | null;
  created_at: string;
  user_id: string;
  photos?: string[] | null;
  user: {
    name: string;
    avatar: string;
  };
}

const Favorites = () => {
  const { loading, favorites, fetchFavorites, removeFavorite } = useFavorites();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostDetailDialogPost | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchFavorites();
  }, []);
  
  const handleRemove = async (favoriteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovingId(favoriteId);
    const success = await removeFavorite(favoriteId);
    if (success) {
      toast({ title: "Removed from favorites" });
    }
    setRemovingId(null);
  };
  
  const handlePostClick = (favorite: Favorite) => {
    if (!favorite.post) return;
    
    const detailPost: PostDetailDialogPost = {
      id: favorite.post.id,
      title: favorite.post.title,
      description: favorite.post.description || null,
      type: favorite.post.type as "offer" | "request",
      category: favorite.post.category || null,
      location: favorite.post.location || null,
      created_at: favorite.post.created_at || favorite.created_at,
      user_id: favorite.post.user_id,
      photos: favorite.post.photos || null,
      user: {
        name: "Unknown User", // We'll need to fetch this separately
        avatar: "https://ui-avatars.com/api/?name=User"
      }
    };
    setSelectedPost(detailPost);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Your Favorites</h1>
            
            {loading && !favorites.length ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
              </div>
            ) : favorites.length === 0 ? (
              <Card className="text-center py-12 bg-white">
                <CardContent>
                  <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <h3 className="text-xl font-medium mb-2">No favorites yet</h3>
                  <p className="text-gray-500 mb-4">
                    You haven't saved any posts to your favorites yet.
                  </p>
                  <Button onClick={() => navigate('/community')}>
                    Browse Community Posts
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {favorites.map((favorite) => (
                  <Card 
                    key={favorite.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                    onClick={() => handlePostClick(favorite)}
                  >
                    <div className="relative">
                      {/* Post image or placeholder */}
                      <div className="aspect-video bg-gray-200 relative overflow-hidden">
                        {favorite.post?.photos && favorite.post.photos.length > 0 ? (
                          <img 
                            src={favorite.post.photos[0]} 
                            alt={favorite.post.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <div className="text-gray-400 text-center">
                              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                              <span className="text-sm">No Image</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Type badge */}
                        <Badge 
                          className={`absolute top-2 left-2 ${
                            favorite.post?.type === 'offer' 
                              ? 'bg-thryvance-green text-white' 
                              : 'bg-thryvance-blue text-white'
                          }`}
                        >
                          {favorite.post?.type === 'offer' ? 'Offer' : 'Request'}
                        </Badge>
                        
                        {/* Favorite button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                          onClick={(e) => handleRemove(favorite.id, e)}
                          disabled={removingId === favorite.id}
                        >
                          {removingId === favorite.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      {/* Title */}
                      <h3 className="font-semibold text-base mb-2 line-clamp-2">
                        {favorite.post?.title || 'Untitled'}
                      </h3>
                      
                      {/* Description preview */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {favorite.post?.description || "No description provided"}
                      </p>
                      
                      {/* Location and category */}
                      <div className="space-y-1 mb-3">
                        {favorite.post?.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{favorite.post.location}</span>
                          </div>
                        )}
                        {favorite.post?.category && (
                          <div className="text-xs">
                            <Badge variant="secondary" className="text-xs">
                              {favorite.post.category}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Date */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Favorited {format(new Date(favorite.created_at), 'MMM d')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Post Detail Dialog */}
      {selectedPost && (
        <PostDetailDialog 
          post={selectedPost} 
          open={!!selectedPost} 
          onOpenChange={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
};

export default Favorites;
