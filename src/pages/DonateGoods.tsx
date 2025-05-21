
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Box, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DonateGoods = () => {
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
    },
    { 
      category: "Professional Services", 
      items: ["Legal consultation", "Financial advising", "Career coaching", "Mental health services", "Medical care"] 
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Donate Goods & Services</h1>
          <p className="text-lg text-gray-700 mb-8">
            Your donation of goods or professional services can make a meaningful impact 
            in our community. We connect donated items and services to those who need them most.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white shadow-md rounded-lg p-6">
              <Box className="h-12 w-12 text-thryvance-green mb-4" />
              <h2 className="text-xl font-semibold mb-3">Donate Goods</h2>
              <p className="text-gray-700 mb-4">
                Donate new or gently used items to help individuals and families in need.
              </p>
              <Button className="w-full bg-thryvance-green hover:bg-thryvance-green-dark">
                Schedule a Drop-off
              </Button>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="h-12 w-12 text-thryvance-green mb-4 flex items-center justify-center">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-3">Offer Professional Services</h2>
              <p className="text-gray-700 mb-4">
                Share your expertise and professional skills to support our community members.
              </p>
              <Button className="w-full bg-thryvance-green hover:bg-thryvance-green-dark">
                Register as a Service Provider
              </Button>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Currently Needed Items & Services</h2>
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
                <h3 className="font-medium text-gray-900">Drop-off Locations</h3>
                <p className="text-gray-700">
                  Main Center: 123 Community Ave, Mon-Fri 9am-5pm, Sat 10am-2pm<br />
                  North Side Hub: 456 Helper Street, Tue-Thu 10am-6pm
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Pick-up Service</h3>
                <p className="text-gray-700">
                  For larger items, we offer a free pick-up service within city limits.
                  Schedule at least 48 hours in advance.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Tax Deductions</h3>
                <p className="text-gray-700">
                  All donations of goods and services may be tax-deductible.
                  We provide receipts for all donations.
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
