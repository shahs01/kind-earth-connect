
import { useEffect, useState } from "react";
import { useFavorites, Favorite } from "@/hooks/useFavorites";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PostsGrid from "@/components/PostsGrid";

const Favorites = () => {
  const { loading, favorites, fetchFavorites } = useFavorites();
  const navigate = useNavigate();
  const [favoritePosts, setFavoritePosts] = useState<any[]>([]);
  
  useEffect(() => {
    fetchFavorites();
  }, []);
  
  // Transform favorites into posts format for PostsGrid
  useEffect(() => {
    const transformedPosts = favorites.map(favorite => ({
      id: favorite.post?.id || favorite.post_id,
      title: favorite.post?.title || "Unknown Title",
      description: favorite.post?.description || null,
      type: (favorite.post?.type as "offer" | "request") || "offer",
      category: favorite.post?.category || null,
      location: favorite.post?.location || null,
      created_at: favorite.post?.created_at || favorite.created_at,
      user_id: favorite.post?.user_id || "",
      photos: null,
      user: {
        name: "Unknown User",
        avatar: "https://ui-avatars.com/api/?name=User"
      },
      isFavorited: true,
      favoriteId: favorite.id
    }));
    setFavoritePosts(transformedPosts);
  }, [favorites]);
  
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
              <PostsGrid 
                customPosts={favoritePosts}
                searchQuery=""
                categoryFilter=""
                locationFilter=""
                typeFilter={null}
                sortBy="newest"
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
