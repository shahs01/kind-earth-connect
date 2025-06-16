
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Box, Calendar, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DonateGoods = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    preferredDate: "",
    preferredTime: "",
    itemsDescription: "",
    additionalDetails: ""
  });
  const { toast } = useToast();

  const neededItems = [
    { 
      category: "Clothing & Personal Items", 
      items: ["New/gently used clothing (all sizes)", "Shoes and socks", "Winter coats and gear", "Personal hygiene products", "Backpacks"] 
    },
    { 
      category: "Food & Kitchen", 
      items: ["Non-perishable food items", "Baby formula", "Kitchen utensils", "Small appliances", "Dinnerware sets"] 
    },
    { 
      category: "Home & Furniture", 
      items: ["Beds and mattresses", "Tables and chairs", "Lamps and lighting", "Blankets and bedding", "Home decor"] 
    },
    { 
      category: "Office & School", 
      items: ["Laptops and computers", "Office furniture", "School supplies", "Books", "Art supplies"] 
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.preferredDate || !formData.preferredTime || !formData.itemsDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-pickup-request', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          itemsDescription: formData.itemsDescription,
          additionalDetails: formData.additionalDetails
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Pickup Request Submitted",
        description: "Thank you! We'll contact you within 24 hours to confirm your pickup.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        preferredDate: "",
        preferredTime: "",
        itemsDescription: "",
        additionalDetails: ""
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error submitting pickup request:", error);
      toast({
        title: "Submission Error",
        description: "Failed to submit pickup request. Please try again.",
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Donate Goods</h1>
          <p className="text-lg text-gray-700 mb-8">
            Your donation of goods can make a meaningful impact in our community. 
            We connect donated items to those who need them most.
          </p>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <Box className="h-12 w-12 text-thryvance-green mb-4" />
            <h2 className="text-xl font-semibold mb-3">Donate Goods</h2>
            <p className="text-gray-700 mb-4">
              Donate new or gently used items to help individuals and families in need.
            </p>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-thryvance-green hover:bg-thryvance-green-dark">
                  Schedule a Pick-up
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Schedule a Pick-up</DialogTitle>
                  <DialogDescription>
                    Please fill out the form below and we'll contact you to arrange a pickup time.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Pickup Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Please include full address with postal code"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="preferredDate">Preferred Date *</Label>
                    <Input
                      id="preferredDate"
                      name="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="preferredTime">Preferred Time *</Label>
                    <Input
                      id="preferredTime"
                      name="preferredTime"
                      type="time"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="itemsDescription">Items to Donate *</Label>
                    <Textarea
                      id="itemsDescription"
                      name="itemsDescription"
                      value={formData.itemsDescription}
                      onChange={handleInputChange}
                      placeholder="Please describe the items you'd like to donate"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="additionalDetails">Additional Details</Label>
                    <Textarea
                      id="additionalDetails"
                      name="additionalDetails"
                      value={formData.additionalDetails}
                      onChange={handleInputChange}
                      placeholder="Any special instructions or additional information"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-thryvance-green hover:bg-thryvance-green-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Pickup Request"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Currently Needed Items</h2>
            <Accordion type="single" collapsible className="w-full">
              {neededItems.map((category, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="hover:text-thryvance-green">
                    {category.category}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Donation Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Pick-up Service</h3>
                <p className="text-gray-700">
                  We offer a free pick-up service within city limits.
                  Schedule at least 48 hours in advance using the form above.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Tax Deductions</h3>
                <p className="text-gray-700">
                  Donations of goods are not currently tax-deductible. 
                  We are working on obtaining the necessary certifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DonateGoods;
