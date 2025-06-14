
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MailPlus } from "lucide-react";

const Subscribe = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Stay Updated</h1>
          <p className="text-lg text-gray-700 mb-8">
            Sign up for our newsletter to receive updates about community initiatives,
            success stories, and ways to get involved.
          </p>
          
          <div className="bg-white shadow-md rounded-lg p-8 mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-thryvance-green-light p-4 rounded-full">
                <MailPlus className="h-10 w-10 text-thryvance-green" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-6 text-center">Subscribe to Our Newsletter</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <Input id="first-name" placeholder="Your first name" />
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <Input id="last-name" placeholder="Your last name" />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>
              
              <div>
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code (Optional)
                </label>
                <Input 
                  id="zip" 
                  placeholder="For local updates" 
                  className="max-w-[200px]" 
                />
                <p className="mt-1 text-sm text-gray-500">
                  Helps us send you relevant local information
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">I'm interested in:</h3>
                <div className="space-y-2">
                  {[
                    "Community Events & Activities",
                    "Volunteer Opportunities",
                    "Fundraising & Donation Campaigns",
                    "Partner Organization Updates",
                    "Success Stories",
                    "General News & Updates"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Checkbox id={`interest-${i}`} />
                      <label
                        htmlFor={`interest-${i}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Email Frequency:</h3>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="weekly" name="frequency" className="h-4 w-4" />
                    <label htmlFor="weekly" className="text-sm text-gray-700">Weekly</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="biweekly" name="frequency" className="h-4 w-4" defaultChecked />
                    <label htmlFor="biweekly" className="text-sm text-gray-700">Bi-weekly</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="monthly" name="frequency" className="h-4 w-4" />
                    <label htmlFor="monthly" className="text-sm text-gray-700">Monthly</label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" defaultChecked />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none"
                  >
                    I agree to receive emails from Thryvance
                  </label>
                  <p className="text-sm text-gray-500">
                    You can unsubscribe at any time. View our <a href="#" className="text-thryvance-green hover:underline">Privacy Policy</a>
                  </p>
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-thryvance-green hover:bg-thryvance-green-dark">
                Subscribe Now
              </Button>
            </form>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Other Ways to Connect</h2>
            <p className="text-gray-700 mb-4">
              In addition to our newsletter, here are other ways to stay in the loop:
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-thryvance-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
                <a href="https://x.com/ThryvanceCanada" target="_blank" rel="noopener noreferrer" className="text-thryvance-green hover:underline">Follow us on Twitter</a>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2 text-thryvance-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <a href="https://www.instagram.com/thryvancecanada/" target="_blank" rel="noopener noreferrer" className="text-thryvance-green hover:underline">Follow us on Instagram</a>
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Subscribe;
