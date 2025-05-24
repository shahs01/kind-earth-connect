
import { useEffect, useState } from "react";
import { useFavorites, Favorite } from "@/hooks/useFavorites";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, Calendar, MapPin, Tag } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const Favorites = () => {
  const { loading, favorites, fetchFavorites, removeFavorite } = useFavorites();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchFavorites();
  }, []);
  
  const handleRemove = async (favoriteId: string) => {
    setRemovingId(favoriteId);
    await removeFavorite(favoriteId);
    setRemovingId(null);
  };
  
  const handleViewDetails = (postId: string) => {
    // Navigate to post details page when implemented
    console.log("View post details:", postId);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
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
              <div className="grid gap-6">
                {favorites.map((favorite) => (
                  <Card key={favorite.id} className="overflow-hidden bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle 
                            className="text-xl hover:text-thryvance-blue cursor-pointer" 
                            onClick={() => handleViewDetails(favorite.post_id)}
                          >
                            {favorite.post?.title}
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            {favorite.post?.created_at ? 
                              format(new Date(favorite.post.created_at), 'MMM d, yyyy') : 
                              'Unknown date'}
                          </CardDescription>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {favorite.post?.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            disabled={removingId === favorite.id}
                            onClick={() => handleRemove(favorite.id)}
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            {removingId === favorite.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Star className="h-4 w-4 fill-current" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 line-clamp-2 mb-2">
                        {favorite.post?.description || 'No description available'}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-2">
                        {favorite.post?.category && (
                          <div className="flex items-center">
                            <Tag className="h-3.5 w-3.5 mr-1" />
                            {favorite.post.category}
                          </div>
                        )}
                        {favorite.post?.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {favorite.post.location}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(favorite.post_id)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
