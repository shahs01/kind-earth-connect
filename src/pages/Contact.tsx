
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MapPin, Phone, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    subscribe: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subject: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting contact form:", formData);

    try {
      // First, save to database
      const { error: dbError } = await supabase
        .from('contacts')
        .insert([formData]);

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error("Failed to save contact submission");
      }

      console.log("Contact saved to database successfully");

      // Then send email via Edge Function
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      console.log("Function response:", { data, error });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to send message");
      }

      if (data && !data.success && data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Message sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        subscribe: false
      });
      
    } catch (error: any) {
      console.error("Error sending contact message:", error);
      toast({
        title: "Error sending message",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
          <p className="text-lg text-gray-700 mb-8">
            Have questions or feedback? We'd love to hear from you. Get in touch with our team.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <Mail className="h-10 w-10 text-thryvance-green mb-4" />
              <h2 className="text-lg font-semibold mb-2">Email Us</h2>
              <p className="text-gray-700 mb-2">For general inquiries:</p>
              <a href="mailto:info@thryvance.org" className="text-thryvance-green hover:underline">
                info@thryvance.org
              </a>
              <p className="text-gray-700 mt-2 mb-2">For support:</p>
              <a href="mailto:support@thryvance.org" className="text-thryvance-green hover:underline">
                support@thryvance.org
              </a>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <MapPin className="h-10 w-10 text-thryvance-green mb-4" />
              <h2 className="text-lg font-semibold mb-2">Visit Us</h2>
              <p className="text-gray-700 mb-1">Thryvance Headquarters</p>
              <p className="text-gray-700 mb-1">123 Community Way</p>
              <p className="text-gray-700 mb-3">San Francisco, CA 94105</p>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-thryvance-green hover:underline"
              >
                Get Directions
              </a>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex gap-4">
                <Phone className="h-10 w-10 text-thryvance-green" />
                <Clock className="h-10 w-10 text-thryvance-green" />
              </div>
              <h2 className="text-lg font-semibold mt-4 mb-2">Call or Visit</h2>
              <p className="text-gray-700 mb-2">Phone: (555) 123-4567</p>
              <p className="text-gray-700 mb-1">Hours:</p>
              <p className="text-gray-700 mb-1">Monday-Friday: 9am-5pm</p>
              <p className="text-gray-700">Saturday: 10am-2pm</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-3 bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <Input 
                      id="name" 
                      name="name"
                      placeholder="Your name" 
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      placeholder="your@email.com" 
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Select value={formData.subject} onValueChange={handleSelectChange} disabled={isSubmitting}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                      <SelectItem value="Technical Support">Technical Support</SelectItem>
                      <SelectItem value="Partnership Opportunities">Partnership Opportunities</SelectItem>
                      <SelectItem value="Donation Questions">Donation Questions</SelectItem>
                      <SelectItem value="Volunteering">Volunteering</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea 
                    id="message" 
                    name="message"
                    placeholder="How can we help you?" 
                    rows={5} 
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="subscribe"
                    name="subscribe"
                    type="checkbox"
                    className="h-4 w-4 text-thryvance-green border-gray-300 rounded"
                    checked={formData.subscribe}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="subscribe" className="ml-2 block text-sm text-gray-700">
                    Subscribe to our newsletter
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-thryvance-green hover:bg-thryvance-green-dark"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </form>
            </div>
            
            <div className="lg:col-span-2 bg-white shadow-md rounded-lg overflow-hidden">
              <div className="h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">[Map Placeholder]</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-700 mb-4">
              Before reaching out, you might find answers to common questions in our FAQ section.
            </p>
            <Button asChild variant="outline" className="border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light">
              <a href="/faq">View FAQs</a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
