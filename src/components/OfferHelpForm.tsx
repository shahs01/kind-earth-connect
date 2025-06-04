
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Image, X, Loader2 } from "lucide-react";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const categories = [
  "Home Repair",
  "Tutoring",
  "Transportation",
  "Companionship",
  "Shopping/Errands",
  "Tech Support",
  "Meals",
  "Childcare",
  "Pet Care",
  "Moving",
  "Other",
];

const OfferHelpForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createPost, isLoading } = useProfileManagement();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    availability: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user selects
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    
    if (!fileList || photos.length + fileList.length > 3) {
      toast({
        title: "Upload limit reached",
        description: "You can only upload up to 3 photos",
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted with data:", formData);
    
    // Simple validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.availability.trim()) newErrors.availability = "Availability is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log("Validation errors:", newErrors);
      return;
    }
    
    try {
      // Create the post in Supabase
      const postData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        availability: formData.availability,
        type: "offer" // This is an offer help post
      };
      
      console.log("Creating offer post:", postData);
      const newPost = await createPost(postData, photos);
      
      if (newPost) {
        toast({
          title: "Offer submitted successfully!",
          description: "Your help offer has been posted to the community.",
        });
        
        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          location: "",
          availability: "",
        });
        setPhotos([]);
        setPhotoPreviewUrls([]);
        
        // Redirect to search page to see posts
        navigate("/search-help");
      } else {
        throw new Error("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to submit your offer. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="shadow-md max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2">
          <Heart className="h-10 w-10 text-thryvance-green" />
        </div>
        <CardTitle className="text-2xl">Offer Your Help</CardTitle>
        <CardDescription>
          Share your skills and time with others in your community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Briefly describe what help you're offering"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide details about how you can help, your skills, and what you're willing to do"
              value={formData.description}
              onChange={handleChange}
              className={`min-h-32 ${errors.description ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
              disabled={isLoading}
            >
              <SelectTrigger className={`w-full ${errors.category ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="Neighborhood, City, or Online"
              value={formData.location}
              onChange={handleChange}
              className={errors.location ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Input
              id="availability"
              name="availability"
              placeholder="When are you available to help? (weekends, evenings, etc.)"
              value={formData.availability}
              onChange={handleChange}
              className={errors.availability ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.availability && <p className="text-xs text-red-500">{errors.availability}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="photos">Photos (optional, max 3)</Label>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4">
                {photoPreviewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden border bg-white">
                    <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-white/80 text-gray-700 hover:bg-white"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {photos.length < 3 && (
                  <label htmlFor="photoUpload" className={`flex flex-col justify-center items-center aspect-square border border-dashed rounded-md border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Image className="h-6 w-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add Photo</span>
                    <input
                      id="photoUpload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="sr-only"
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500">Upload photos related to your offer (max 3)</p>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-thryvance-green hover:bg-thryvance-green-dark"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Submitting...
              </>
            ) : 'Submit Offer'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm text-gray-600">
        <p>
          By submitting this form, you agree to Thryvance's community guidelines and terms of service.
        </p>
      </CardFooter>
    </Card>
  );
};

export default OfferHelpForm;
