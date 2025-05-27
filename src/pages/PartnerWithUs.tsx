
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const PartnerWithUs = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    organizationName: "",
    contactName: "",
    email: "",
    phone: "",
    organizationType: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      organizationType: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.organizationName || !formData.contactName || !formData.email || !formData.organizationType || !formData.message) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields marked with *",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    console.log("Submitting partnership form:", formData);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-partnership-email', {
        body: formData
      });

      console.log("Partnership function response:", { data, error });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to send partnership request");
      }

      // Check if the response indicates success
      if (data?.success) {
        console.log("Partnership email sent successfully");

        toast({
          title: "Partnership request sent!",
          description: "Thank you for your interest! We'll review your information and contact you soon.",
        });
        
        // Reset form
        setFormData({
          organizationName: "",
          contactName: "",
          email: "",
          phone: "",
          organizationType: "",
          message: ""
        });
      } else {
        throw new Error(data?.error || "Failed to send partnership request");
      }
      
    } catch (error: any) {
      console.error("Error sending partnership request:", error);
      toast({
        title: "Error sending request",
        description: error.message || "Please try again or contact us directly at thryvance.ca@gmail.com",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-12 bg-thryvance-neutral-light">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Partner With Us</h1>
              <p className="text-gray-600 mb-8">
                Are you a nonprofit, business, or foundation interested in joining our community? Fill out this form to get in touch about partnership opportunities.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name*
                  </label>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name*
                    </label>
                    <Input
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Type*
                    </label>
                    <Select
                      value={formData.organizationType}
                      onValueChange={handleSelectChange}
                      required
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select organization type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nonprofit">Nonprofit Organization</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="foundation">Foundation</SelectItem>
                        <SelectItem value="government">Government Agency</SelectItem>
                        <SelectItem value="educational">Educational Institution</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address*
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    How would you like to partner with us?*
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full h-32"
                    placeholder="Tell us how you'd like to collaborate, what resources you can offer, or what you're looking for in a partnership..."
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="bg-thryvance-green hover:bg-thryvance-green-dark text-white w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </div>
              </form>
            </div>
            
            <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Partner With Us?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-thryvance-green mb-2">Increase Your Visibility</h3>
                  <p className="text-gray-600">
                    Get featured in our nonprofit directory and be discovered by community members looking for organizations like yours.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-thryvance-green mb-2">Connect With Volunteers</h3>
                  <p className="text-gray-600">
                    Access our network of skilled volunteers eager to support your mission and programs.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-thryvance-green mb-2">Collaborate On Projects</h3>
                  <p className="text-gray-600">
                    Work together with our team and other partners on community initiatives and social impact projects.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-thryvance-green mb-2">Share Resources</h3>
                  <p className="text-gray-600">
                    Pool resources, knowledge, expertise to maximize your organization's impact in the community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PartnerWithUs;
