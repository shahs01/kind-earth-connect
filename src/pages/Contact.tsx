import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          subscribe: formData.subscribe
        }
      });

      console.log("Contact function response:", { data, error });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to send message");
      }

      if (data?.success) {
        console.log("Contact email sent successfully");
        toast({
          title: "Message sent!",
          description: "Thank you for contacting us. We'll get back to you soon."
        });

        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          subscribe: false
        });
      } else {
        throw new Error(data?.error || "Failed to send message");
      }
    } catch (error: any) {
      console.error("Error sending contact message:", error);
      toast({
        title: "Error sending message",
        description: error.message || "Please try again or contact us directly at thryvance.ca@gmail.com",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-thryvance-green-light/30 to-thryvance-blue-light/30">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get In Touch</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions or feedback? We'd love to hear from you. Connect with our team and let's start a conversation.
            </p>
          </div>
          
          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-thryvance-green-light rounded-full">
                    <Mail className="h-6 w-6 text-thryvance-green" />
                  </div>
                  <CardTitle className="text-xl">Email Us</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">General Inquiries:</p>
                    <a href="mailto:thryvance.ca@gmail.com" className="text-thryvance-green hover:text-thryvance-green-dark font-medium transition-colors">
                      thryvance.ca@gmail.com
                    </a>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Support:</p>
                    <a href="mailto:support@thryvance.org" className="text-thryvance-green hover:text-thryvance-green-dark font-medium transition-colors">
                      support@thryvance.org
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-thryvance-blue-light rounded-full">
                    <Phone className="h-6 w-6 text-thryvance-blue" />
                  </div>
                  <CardTitle className="text-xl">Call or Visit</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Phone:</p>
                    <p className="text-gray-800 font-medium">(778) 385-9811</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Business Hours:</p>
                    <div className="text-gray-800">
                      <p className="text-sm">Monday-Friday: 9am-5pm</p>
                      <p className="text-sm">Saturday: 10am-2pm</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl text-gray-900">Send us a Message</CardTitle>
                  <p className="text-gray-600">Fill out the form below and we'll get back to you as soon as possible.</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <Input 
                          id="name" 
                          name="name" 
                          placeholder="Enter your full name" 
                          value={formData.name} 
                          onChange={handleChange} 
                          disabled={isSubmitting} 
                          required 
                          className="border-gray-200 focus:border-thryvance-green focus:ring-thryvance-green/20"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
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
                          className="border-gray-200 focus:border-thryvance-green focus:ring-thryvance-green/20"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <Select value={formData.subject} onValueChange={handleSelectChange} disabled={isSubmitting}>
                        <SelectTrigger className="border-gray-200 focus:border-thryvance-green focus:ring-thryvance-green/20">
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
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        placeholder="Tell us how we can help you..." 
                        rows={6} 
                        value={formData.message} 
                        onChange={handleChange} 
                        disabled={isSubmitting} 
                        required 
                        className="border-gray-200 focus:border-thryvance-green focus:ring-thryvance-green/20 resize-none"
                      />
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <input 
                        id="subscribe" 
                        name="subscribe" 
                        type="checkbox" 
                        className="mt-1 h-4 w-4 text-thryvance-green border-gray-300 rounded focus:ring-thryvance-green" 
                        checked={formData.subscribe} 
                        onChange={handleChange} 
                        disabled={isSubmitting} 
                      />
                      <label htmlFor="subscribe" className="text-sm text-gray-700 leading-relaxed">
                        Subscribe to our newsletter to stay updated on community initiatives and platform updates
                      </label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      size="lg"
                      className="w-full bg-thryvance-green hover:bg-thryvance-green-dark text-white font-medium py-3 transition-colors" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <div className="lg:col-span-1">
              <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 h-fit">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Need Quick Answers?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Before reaching out, you might find answers to common questions in our comprehensive FAQ section.
                  </p>
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full border-thryvance-green text-thryvance-green hover:bg-thryvance-green hover:text-white transition-colors"
                  >
                    <a href="/faq">Browse FAQs</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
