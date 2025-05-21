
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PiggyBank } from "lucide-react";

const MonthlyGiving = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Monthly Giving</h1>
          <p className="text-lg text-gray-700 mb-8">
            Join our community of monthly supporters and make a sustained impact. 
            Your recurring donations provide reliable support that helps us plan for the future.
          </p>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Become a Monthly Donor</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[10, 25, 50, 75, 100, 200].map((amount) => (
                <Button 
                  key={amount}
                  variant={amount === 25 ? "default" : "outline"}
                  className={amount === 25 ? "bg-thryvance-green hover:bg-thryvance-green-dark" : ""}
                >
                  ${amount}/month
                </Button>
              ))}
            </div>
            <div className="mb-4">
              <label htmlFor="custom-monthly" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Monthly Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  id="custom-monthly"
                  min="1"
                  placeholder="Other monthly amount"
                  className="pl-8 w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <Button className="w-full bg-thryvance-green hover:bg-thryvance-green-dark mt-4">
              <PiggyBank className="mr-2 h-4 w-4" />
              Start Monthly Giving
            </Button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Benefits of Monthly Giving</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium">Sustained Impact</span>: Your regular support allows for long-term planning and sustainable programs.
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium">Convenience</span>: Set up once and your donation automatically processes each month.
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium">Special Updates</span>: Receive regular reports about the impact of your donations.
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium">Easy to Adjust</span>: Change or cancel your monthly contribution at any time.
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Monthly Donor Spotlight</h2>
            <div className="italic text-gray-700 border-l-4 border-thryvance-green pl-4 mb-4">
              "Becoming a monthly donor has allowed me to make a consistent impact throughout the year. 
              I love getting updates about the projects my donations are supporting."
              <p className="mt-2 font-medium not-italic">— Sarah T., Monthly Donor since 2023</p>
            </div>
            <p className="text-gray-700">
              Join Sarah and hundreds of other monthly supporters who are creating positive change in communities every month.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MonthlyGiving;
