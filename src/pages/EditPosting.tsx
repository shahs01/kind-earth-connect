import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Image, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const EditPosting = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    type: "offer", // Default to offer
  });
  
  // Fetch existing post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!postId || !user) return;
      
      setIsLoading(true);
      try {
        const { data: post, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!post) {
          toast({
            title: "Post not found",
            description: "The post you're trying to edit doesn't exist or you don't have permission to edit it.",
            variant: "destructive"
          });
          navigate("/profile");
          return;
        }
        
        // Set form data
        setFormData({
          title: post.title || "",
          description: post.description || "",
          location: post.location || "",
          category: post.category || "",
          type: post.type || "offer",
        });
        
        // Set existing photos
        if (post.photos && Array.isArray(post.photos)) {
          setExistingPhotos(post.photos);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast({
          title: "Error",
          description: "Failed to load post details. Please try again later.",
          variant: "destructive"
        });
        navigate("/profile");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPost();
  }, [postId, user, toast, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    
    if (!fileList || photos.length + existingPhotos.length + fileList.length > 3) {
      toast({
        title: "Upload limit reached",
        description: "You can only upload up to 3 photos total",
        variant: "destructive"
      });
      return;
    }
    
    const newPhotos = [...photos];
    const newPhotoUrls = [...photoPreviewUrls];
    
    Array.from(fileList).forEach((file) => {
      if (file.type.startsWith("image/")) {
        newPhotos.push(file);
        newPhotoUrls.push(URL.createObjectURL(file));
      }
    });
    
    setPhotos(newPhotos);
    setPhotoPreviewUrls(newPhotoUrls);
    
    // Reset the input to allow selecting the same file again
    e.target.value = "";
  };
  
  const removePhoto = (index: number) => {
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(photoPreviewUrls[index]);
    
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingPhoto = (index: number) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index));
  };
  
  const uploadPhotos = async () => {
    if (photos.length === 0) return existingPhotos; // No new photos to upload
    
    try {
      const uploadPromises = photos.map(async (photo) => {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${user!.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('post-photos')
          .upload(filePath, photo);
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get the public URL
        const { data } = supabase.storage
          .from('post-photos')
          .getPublicUrl(filePath);
          
        return data.publicUrl;
      });
      
      const photoUrls = await Promise.all(uploadPromises);
      return [...existingPhotos, ...photoUrls];
    } catch (error) {
      console.error("Error uploading photos:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.Event) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to edit your post",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload any new photos
      const allPhotos = await uploadPhotos();
      
      // Update the post in Supabase
      const { error } = await supabase
        .from('posts')
        .update({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          category: formData.category,
          photos: allPhotos,
        })
        .eq('id', postId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Your post has been updated.",
      });
      
      // Navigate back to profile page
      navigate("/profile");
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update your post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const categories = [
    "Home Repairs",
    "Tutoring",
    "Rides & Transportation",
    "Childcare",
    "Elder Support",
    "Meals & Food",
    "Cleaning & Organization",
    "Computer Help",
    "Moving Assistance",
    "Yard Work & Gardening",
    "Pet Care",
    "Financial Advice",
    "Legal Assistance",
    "Mental Health Support",
    "Medical Support",
    "Other"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-thryvance-green mb-4" />
            <p className="text-gray-600">Loading post details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-10 bg-thryvance-neutral-light">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Your Post</h1>
            <p className="text-gray-700">Update the details of your post</p>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter a clear title for your post"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Where is this help needed?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    placeholder="Provide details about what you're offering or requesting..."
                    rows={5}
                  />
                </div>
                
                {/* Photo Upload Section */}
                <div className="space-y-2">
                  <Label>Photos (optional, max 3)</Label>
                  <div className="flex flex-col gap-4">
                    {/* Existing photos */}
                    {existingPhotos.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Current photos:</p>
                        <div className="grid grid-cols-3 gap-4">
                          {existingPhotos.map((url, index) => (
                            <div key={`existing-${index}`} className="relative aspect-square rounded-md overflow-hidden border bg-white">
                              <img src={url} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeExistingPhoto(index)}
                                className="absolute top-1 right-1 p-1 rounded-full bg-white/80 text-gray-700 hover:bg-white"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* New photos */}
                    <div>
                      {photoPreviewUrls.length > 0 && (
                        <p className="text-sm text-gray-500 mb-2">New photos to upload:</p>
                      )}
                      <div className="grid grid-cols-3 gap-4">
                        {photoPreviewUrls.map((url, index) => (
                          <div key={`new-${index}`} className="relative aspect-square rounded-md overflow-hidden border bg-white">
                            <img src={url} alt={`New Preview ${index + 1}`} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-white/80 text-gray-700 hover:bg-white"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        
                        {existingPhotos.length + photos.length < 3 && (
                          <label htmlFor="photoUpload" className="flex flex-col justify-center items-center aspect-square border border-dashed rounded-md border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                            <Image className="h-6 w-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">Add Photo</span>
                            <input
                              id="photoUpload"
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="sr-only"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex flex-col sm:flex-row justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/profile')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-thryvance-green hover:bg-thryvance-green-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>Save Changes</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditPosting;
