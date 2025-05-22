import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { categories } from "@/data/searchHelpData";
import { useAuth } from "@/context/AuthContext";

const EditPosting = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Load existing post data
  useEffect(() => {
    const loadPostData = async () => {
      if (!postId) return;
      
      try {
        setIsLoading(true);
        setError("");
        
        const { data: post, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .single();
        
        if (postError) {
          throw postError;
        }
        
        if (!post) {
          setError("Post not found");
          return;
        }
        
        // Check if the post belongs to the current user
        if (post.user_id !== user?.id) {
          setError("You don't have permission to edit this post");
          navigate('/profile');
          return;
        }
        
        // Populate form fields
        setTitle(post.title || '');
        setDescription(post.description || '');
        setType(post.type || '');
        setCategory(post.category || '');
        setLocation(post.location || '');
        setPhotos(post.photos || []);
        
      } catch (err: any) {
        console.error("Error loading post:", err);
        setError(err.message || "Failed to load post data");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load post data. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPostData();
  }, [postId, navigate, toast, user?.id]);
  
  const handleNewPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to Array and append to newPhotos
      const filesArray = Array.from(e.target.files);
      setNewPhotos(prev => [...prev, ...filesArray]);
    }
  };
  
  const removeExistingPhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeNewPhoto = (index: number) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
  };
  
  // Upload photos to Supabase Storage
  const uploadPhotos = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of newPhotos) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('post_photos')
        .upload(filePath, file);
      
      if (error) {
        console.error('Error uploading photo:', error);
        continue;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('post_photos')
        .getPublicUrl(filePath);
      
      uploadedUrls.push(publicUrlData.publicUrl);
    }
    
    return uploadedUrls;
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!title || !type) {
      toast({
        variant: "destructive",
        title: "Required Fields Missing",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Upload any new photos
      let allPhotos = [...photos];
      if (newPhotos.length > 0) {
        const newPhotoUrls = await uploadPhotos();
        allPhotos = [...photos, ...newPhotoUrls];
      }
      
      // Update the post in the database
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          title,
          description,
          type,
          category,
          location,
          photos: allPhotos,
          // Don't change user_id or created_at
        })
        .eq('id', postId);
      
      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: "Post Updated",
        description: "Your post has been successfully updated.",
      });
      
      // Redirect back to profile
      navigate(`/profile/${user?.id}`);
      
    } catch (err: any) {
      console.error("Error updating post:", err);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || "There was an error updating your post.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center p-8">
            <Loader2 className="h-10 w-10 animate-spin text-thryvance-green mb-4" />
            <p>Loading post data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate(-1)}>Go Back</Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-thryvance-blue-light py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Edit Your Post</h1>
          <p className="text-gray-700 max-w-3xl">
            Make changes to your post and save to update it.
          </p>
        </div>
      </div>
      
      <main className="flex-grow py-10 bg-thryvance-neutral-light">
        <div className="container mx-auto px-4">
          <Card className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Edit Post Details</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label htmlFor="title" className="block font-medium">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a clear and descriptive title"
                    required
                  />
                </div>
                
                {/* Type */}
                <div className="space-y-2">
                  <label htmlFor="type" className="block font-medium">
                    Post Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={type}
                    onValueChange={(value) => setType(value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select post type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offer">Offering Help</SelectItem>
                      <SelectItem value="request">Requesting Help</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Category */}
                <div className="space-y-2">
                  <label htmlFor="category" className="block font-medium">
                    Category
                  </label>
                  <Select
                    value={category}
                    onValueChange={(value) => setCategory(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="block font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={description || ''}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about your offer or request"
                    className="min-h-[150px]"
                  />
                </div>
                
                {/* Location */}
                <div className="space-y-2">
                  <label htmlFor="location" className="block font-medium">
                    Location
                  </label>
                  <Input
                    id="location"
                    value={location || ''}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your city, neighborhood, or area"
                  />
                </div>
                
                {/* Photos */}
                <div className="space-y-4">
                  <label className="block font-medium">Photos</label>
                  
                  {/* Existing Photos */}
                  {photos.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Current Photos:</p>
                      <div className="flex flex-wrap gap-4">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/100?text=Error';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingPhoto(index)}
                              className="absolute top-1 right-1 bg-red-500 rounded-full p-1 text-white"
                              aria-label="Remove photo"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* New Photos */}
                  {newPhotos.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">New Photos to Upload:</p>
                      <div className="flex flex-wrap gap-4">
                        {newPhotos.map((photo, index) => (
                          <div key={index} className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={URL.createObjectURL(photo)}
                              alt={`New Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewPhoto(index)}
                              className="absolute top-1 right-1 bg-red-500 rounded-full p-1 text-white"
                              aria-label="Remove photo"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Upload new photos */}
                  <div className="pt-2">
                    <label
                      htmlFor="new-photos"
                      className="cursor-pointer flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="h-5 w-5 text-gray-500" />
                      <span>Add Photos</span>
                      <input
                        id="new-photos"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleNewPhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-thryvance-green hover:bg-thryvance-green-dark"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EditPosting;
