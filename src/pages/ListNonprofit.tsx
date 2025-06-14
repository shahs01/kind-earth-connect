
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const ListNonprofit = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !organization) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    const formData = { name, email, phone, organization, message };
    console.log("Submitting nonprofit listing request:", formData);

    try {
      const { data, error } = await supabase.functions.invoke('send-nonprofit-listing-request-email', {
        body: formData
      });

      console.log("Nonprofit listing function response:", { data, error });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to send request");
      }

      if (data?.success) {
        console.log("Nonprofit listing request email sent successfully");
        toast({
          title: "Request submitted!",
          description: "We'll review your nonprofit listing request and get back to you soon.",
        });
        
        navigate("/nonprofit-directory");
      } else {
        throw new Error(data?.error || "Failed to send request");
      }
      
    } catch (error: any) {
      console.error("Error sending listing request:", error);
      toast({
        title: "Submission failed",
        description: error.message || "There was a problem submitting your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-thryvance-neutral-light py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">List Your Nonprofit</h1>
            <p className="text-gray-600 mb-8">
              Interested in listing your nonprofit organization on Thryvance? Fill out the form below, and our team will review your submission.
            </p>
            
            <Card>
              <CardHeader>
                <CardTitle>Nonprofit Listing Request</CardTitle>
                <CardDescription>
                  Provide information about your organization, and we'll get back to you to discuss listing options.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        disabled={submitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        disabled={submitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization Name *</Label>
                      <Input 
                        id="organization" 
                        value={organization} 
                        onChange={(e) => setOrganization(e.target.value)} 
                        required 
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Information</Label>
                    <Textarea 
                      id="message" 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)} 
                      placeholder="Tell us about your organization's mission, services, and how you help the community..."
                      className="min-h-[150px]"
                      disabled={submitting}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <div className="mt-8 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Benefits of Listing Your Nonprofit</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Increase visibility in your local community</li>
                <li>Connect with potential volunteers and donors</li>
                <li>Showcase your mission and impact</li>
                <li>Collaborate with other organizations and community members</li>
                <li>Share upcoming events and volunteer opportunities</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListNonprofit;
