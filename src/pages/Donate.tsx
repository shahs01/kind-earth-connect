
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const Donate = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Donate Online</h1>
          <p className="text-lg text-gray-700 mb-8">
            Your generous donation helps us support communities in need. Every contribution 
            makes a difference in the lives of those we serve.
          </p>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Make a One-Time Donation</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[25, 50, 100, 250, 500, 1000].map((amount) => (
                <Button 
                  key={amount}
                  variant={amount === 100 ? "default" : "outline"}
                  className={amount === 100 ? "bg-thryvance-green hover:bg-thryvance-green-dark" : ""}
                >
                  ${amount}
                </Button>
              ))}
            </div>
            <div className="mb-4">
              <label htmlFor="custom-amount" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  id="custom-amount"
                  min="1"
                  placeholder="Other amount"
                  className="pl-8 w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <Button className="w-full bg-thryvance-green hover:bg-thryvance-green-dark mt-4">
              <Heart className="mr-2 h-4 w-4" />
              Donate Now
            </Button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Other Ways to Give</h2>
            <ul className="space-y-4">
              <li>
                <a href="/monthly-giving" className="text-thryvance-green hover:underline font-medium">
                  Become a monthly donor
                </a>
                <p className="text-gray-600">Make a recurring impact with regular contributions.</p>
              </li>
              <li>
                <a href="/sponsor-project" className="text-thryvance-green hover:underline font-medium">
                  Sponsor a community project
                </a>
                <p className="text-gray-600">Fund specific initiatives that align with your values.</p>
              </li>
              <li>
                <a href="/donate-goods" className="text-thryvance-green hover:underline font-medium">
                  Donate goods or services
                </a>
                <p className="text-gray-600">Contribute resources, expertise, or products.</p>
              </li>
            </ul>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Impact</h2>
            <p className="text-gray-700 mb-4">
              When you donate to Thryvance, your contribution helps:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Provide essential resources to underserved communities</li>
              <li>Fund educational and skill-building programs</li>
              <li>Support local businesses and entrepreneurs</li>
              <li>Create opportunities for community connection and growth</li>
              <li>Develop sustainable community infrastructure</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Donate;
