
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { User, Clock, Calendar, MapPin, Users as UsersIcon, Plus, Briefcase, Image, Link, X, AlertCircle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Volunteer = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("browse");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    schedule: "",
    commitment: "",
    category: "Environment",
    description: "",
    spots: "5",
    links: [""]
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

  // Fetch volunteer opportunities from database
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setIsLoading(true);
        
        // Fetch volunteer opportunities (posts with type "offer")
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('status', 'active')
          .eq('type', 'offer')
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;

        if (postsData && postsData.length > 0) {
          // Get profiles for each post
          const postsWithProfiles = await Promise.all(
            postsData.map(async (post) => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('name, avatar, username')
                .eq('id', post.user_id)
                .single();

              return {
                id: post.id,
                title: post.title,
                location: post.location || "Location not specified",
                category: post.category || "General",
                description: post.description,
                created_at: post.created_at,
                user: {
                  name: profileData?.name || "Unknown User",
                  avatar: profileData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.name || 'User')}`
                }
              };
            })
          );

          setOpportunities(postsWithProfiles);
        } else {
          setOpportunities([]);
        }
      } catch (error) {
        console.error("Error fetching volunteer opportunities:", error);
        toast({
          title: "Error",
          description: "Failed to load volunteer opportunities. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "browse") {
      fetchOpportunities();
    }
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.links];
    newLinks[index] = value;
    setFormData(prev => ({ ...prev, links: newLinks }));
  };

  const addLinkField = () => {
    setFormData(prev => ({ ...prev, links: [...prev.links, ""] }));
  };

  const removeLinkField = (index: number) => {
    const newLinks = [...formData.links];
    newLinks.splice(index, 1);
    setFormData(prev => ({ ...prev, links: newLinks }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to post volunteer opportunities",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Filter out empty links
      const validLinks = formData.links.filter(link => link.trim() !== "");
      
      // Create description that includes all the volunteer-specific information
      const fullDescription = `${formData.description}

Schedule: ${formData.schedule}
Commitment: ${formData.commitment}
Available Spots: ${formData.spots}
${validLinks.length > 0 ? `\nRelated Links:\n${validLinks.join('\n')}` : ''}`;
      
      // Create the post in Supabase using the standard posts table structure
      const { error } = await supabase.from('posts').insert({
        title: formData.title,
        description: fullDescription,
        location: formData.location,
        category: formData.category,
        type: "offer", // Using "offer" type since this is offering volunteer opportunities
        user_id: user?.id,
        status: "active"
      });
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Your volunteer opportunity has been posted.",
      });
      
      // Reset form
      setFormData({
        title: "",
        location: "",
        schedule: "",
        commitment: "",
        category: "Environment",
        description: "",
        spots: "5",
        links: [""]
      });
      setPhotos([]);
      setPhotoPreviewUrls([]);
      
      // Switch back to browse tab and refresh opportunities
      setActiveTab("browse");
      
    } catch (error) {
      console.error("Error posting volunteer opportunity:", error);
      toast({
        title: "Error",
        description: "Failed to post volunteer opportunity. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "Environment", 
    "Education", 
    "Food Security", 
    "Senior Support", 
    "Youth", 
    "Community Events", 
    "Healthcare", 
    "Animal Welfare", 
    "Arts & Culture", 
    "Disaster Relief"
  ];

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-grow w-full">
        <div className="container mx-auto px-4 py-8 max-w-full">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Your Time</h1>
                <p className="text-lg text-gray-700">
                  Share your time and talents to make a difference in your community.
                </p>
              </div>
              
              <div className="w-full md:w-auto mt-4 md:mt-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="browse" className="flex items-center gap-1">
                      <UsersIcon className="h-4 w-4" /> Browse Opportunities
                    </TabsTrigger>
                    <TabsTrigger value="post" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" /> Post Opportunity
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            <div className="mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsContent value="browse">
                  <div className="flex flex-wrap gap-3 mb-8">
                    <Button variant="outline" className="bg-thryvance-green text-white hover:bg-thryvance-green-dark">
                      All Opportunities
                    </Button>
                    <Button variant="outline">One-Time</Button>
                    <Button variant="outline">Ongoing</Button>
                    <Button variant="outline">Remote</Button>
                    <Button variant="outline">In-Person</Button>
                    <Button variant="outline">Groups</Button>
                    <Button variant="outline">Individuals</Button>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
                      <span className="ml-2">Loading opportunities...</span>
                    </div>
                  ) : opportunities.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-medium text-gray-700">No volunteer opportunities yet</h3>
                      <p className="text-gray-500 mt-2">
                        Be the first to post a volunteer opportunity!
                      </p>
                      {isAuthenticated && (
                        <Button 
                          onClick={() => setActiveTab("post")}
                          className="mt-4 bg-thryvance-green hover:bg-thryvance-green-dark"
                        >
                          Post an Opportunity
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {opportunities.map(opportunity => (
                        <div key={opportunity.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                          <div className="h-40 bg-gray-200"></div>
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                              <span className="bg-thryvance-green-light text-thryvance-green text-xs font-medium px-2 py-1 rounded">
                                {opportunity.category}
                              </span>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-2" />
                                {opportunity.location}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <User className="h-4 w-4 mr-2" />
                                Posted by {opportunity.user.name}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(opportunity.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-sm text-gray-700 line-clamp-3">
                                {opportunity.description}
                              </p>
                            </div>
                            
                            <Button className="w-full bg-thryvance-green hover:bg-thryvance-green-dark">
                              <User className="mr-2 h-4 w-4" />
                              Sign Up to Volunteer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Virtual Volunteer Opportunities</h2>
                    <p className="text-gray-700 mb-4">
                      Can't volunteer in person? We also offer remote opportunities:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-5">
                      <li>Online tutoring and mentorship</li>
                      <li>Digital content creation</li>
                      <li>Administrative support</li>
                      <li>Translation services</li>
                      <li>Virtual event planning</li>
                    </ul>
                    <Button variant="outline" className="border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light">
                      Browse Virtual Opportunities
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Group Volunteering</h2>
                    <p className="text-gray-700 mb-4">
                      Looking for team-building opportunities or ways to give back with your:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                      <div className="bg-white p-3 rounded text-center">Company</div>
                      <div className="bg-white p-3 rounded text-center">School</div>
                      <div className="bg-white p-3 rounded text-center">Faith Group</div>
                      <div className="bg-white p-3 rounded text-center">Community Org</div>
                    </div>
                    <Button className="bg-thryvance-green hover:bg-thryvance-green-dark">
                      Request Group Volunteer Day
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="post">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Post a Volunteer Opportunity</h2>
                        <p className="text-gray-600">
                          Share details about your volunteer opportunity to find dedicated helpers for your organization's mission.
                        </p>
                      </div>
                      
                      {!isAuthenticated && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <AlertCircle className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-yellow-800">Authentication required</h3>
                              <div className="mt-2 text-sm text-yellow-700">
                                <p>You need to be logged in to post volunteer opportunities.</p>
                                <div className="mt-4">
                                  <Button asChild variant="outline" className="mr-2">
                                    <Link to="/login">Log in</Link>
                                  </Button>
                                  <Button asChild>
                                    <Link to="/signup">Sign up</Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="title" className="block font-medium">Opportunity Title</label>
                          <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g., Community Garden Helper"
                            required
                            disabled={!isAuthenticated}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="location" className="block font-medium">Location</label>
                            <Input
                              id="location"
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              placeholder="e.g., Main St Community Center"
                              required
                              disabled={!isAuthenticated}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="category" className="block font-medium">Category</label>
                            <Select 
                              value={formData.category}
                              onValueChange={(value) => handleSelectChange("category", value)}
                              disabled={!isAuthenticated}
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="schedule" className="block font-medium">Schedule</label>
                            <Input
                              id="schedule"
                              name="schedule"
                              value={formData.schedule}
                              onChange={handleInputChange}
                              placeholder="e.g., Weekends, 9am-12pm"
                              required
                              disabled={!isAuthenticated}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="commitment" className="block font-medium">Commitment</label>
                            <Input
                              id="commitment"
                              name="commitment"
                              value={formData.commitment}
                              onChange={handleInputChange}
                              placeholder="e.g., Weekly, 3 months, etc."
                              required
                              disabled={!isAuthenticated}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="spots" className="block font-medium">Available Spots</label>
                            <Input
                              id="spots"
                              name="spots"
                              type="number"
                              min="1"
                              value={formData.spots}
                              onChange={handleInputChange}
                              required
                              disabled={!isAuthenticated}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="description" className="block font-medium">Description</label>
                          <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe the volunteer opportunity, what volunteers will be doing, skills required, etc."
                            rows={5}
                            required
                            disabled={!isAuthenticated}
                          />
                        </div>
                        
                        {/* Photo Upload Section */}
                        <div className="space-y-2">
                          <label className="block font-medium">Photos (optional, max 3)</label>
                          <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-3 gap-4">
                              {photoPreviewUrls.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-md overflow-hidden border bg-white">
                                  <img src={url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-white/80 text-gray-700 hover:bg-white"
                                    disabled={!isAuthenticated}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                              
                              {photos.length < 3 && (
                                <label htmlFor="photoUpload" className={`flex flex-col justify-center items-center aspect-square border border-dashed rounded-md border-gray-300 ${isAuthenticated ? 'bg-gray-50 cursor-pointer hover:bg-gray-100' : 'bg-gray-100 cursor-not-allowed'} transition-colors`}>
                                  <Image className="h-6 w-6 text-gray-400 mb-1" />
                                  <span className="text-xs text-gray-500">Add Photo</span>
                                  <input
                                    id="photoUpload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="sr-only"
                                    disabled={!isAuthenticated}
                                  />
                                </label>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">Upload photos related to your opportunity (max 3)</p>
                          </div>
                        </div>
                        
                        {/* Links Section */}
                        <div className="space-y-2">
                          <label className="block font-medium">Related Links (optional)</label>
                          <div className="space-y-3">
                            {formData.links.map((link, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="flex-grow">
                                  <div className="relative">
                                    <Input
                                      value={link}
                                      onChange={(e) => handleLinkChange(index, e.target.value)}
                                      placeholder="https://example.com"
                                      className="pl-9"
                                      disabled={!isAuthenticated}
                                    />
                                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                  </div>
                                </div>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => removeLinkField(index)}
                                  disabled={formData.links.length === 1 || !isAuthenticated}
                                  className="flex-shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addLinkField}
                              disabled={!isAuthenticated}
                              className="text-xs"
                            >
                              Add Another Link
                            </Button>
                          </div>
                        </div>
                        
                        <div className="pt-4 flex flex-col sm:flex-row justify-end gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setActiveTab("browse")}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            className="bg-thryvance-green hover:bg-thryvance-green-dark"
                            disabled={isSubmitting || !isAuthenticated}
                          >
                            {isSubmitting ? (
                              <>Processing...</>
                            ) : (
                              <>
                                <Briefcase className="mr-2 h-4 w-4" />
                                Post Opportunity
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Volunteer;
