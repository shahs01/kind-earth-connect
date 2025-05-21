
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

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
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    availability: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.availability.trim()) newErrors.availability = "Availability is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Here you would normally handle the form submission with a backend service
    console.log("Form submitted:", formData);
    // For demo purposes, redirect to community
    window.location.href = "/community";
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
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
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
            />
            {errors.availability && <p className="text-xs text-red-500">{errors.availability}</p>}
          </div>
          
          <Button type="submit" className="w-full bg-thryvance-green hover:bg-thryvance-green-dark">
            Submit Offer
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
