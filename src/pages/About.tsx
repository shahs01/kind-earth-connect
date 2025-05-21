
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About Thryvance</h1>
          <p className="text-lg text-gray-700 mb-8">
            Thryvance is a community-focused platform connecting people and resources to create thriving communities.
          </p>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-6">
              We believe that when communities have access to the right resources and connections,
              they can thrive and overcome challenges together. Our mission is to create a platform
              where help can be easily offered and received, where community stories are shared,
              and where collective action leads to meaningful change.
            </p>
            <div className="aspect-video bg-gray-200 rounded-lg mb-6"></div>
            <h3 className="text-lg font-medium mb-3">Core Values</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="flex items-start">
                <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium">Community-First</span>: We put community needs at the center of everything we do.
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium">Accessibility</span>: Making resources accessible to all community members.
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium">Empowerment</span>: Building capacity for communities to help themselves.
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-thryvance-green rounded-full p-1 mr-3 mt-0.5">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <span className="font-medium">Transparency</span>: Open and honest in all our operations and communications.
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Our Story</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Thryvance began in 2022 when a group of community organizers noticed a disconnect between available resources and community needs.
                During a local crisis, they saw how difficult it was for people who wanted to help to connect with those who needed assistance.
              </p>
              <p>
                What started as a simple community board quickly evolved into a comprehensive platform designed to facilitate connections,
                share resources, and build stronger community bonds. Today, Thryvance operates in multiple cities, connecting thousands
                of individuals, nonprofits, and businesses in a shared mission of community support.
              </p>
              <p>
                Our platform continues to grow and evolve based on community feedback and needs, always staying true to our
                founding principle: Communities thrive when people can easily connect and support each other.
              </p>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(member => (
                <div key={member} className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-3"></div>
                  <h3 className="font-medium">Team Member {member}</h3>
                  <p className="text-sm text-gray-500">Role / Position</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Join Our Mission</h2>
            <p className="text-gray-700 mb-5">
              There are many ways to get involved with Thryvance and support our mission of building thriving communities.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-thryvance-green hover:bg-thryvance-green-dark">
                Join the Community
              </Button>
              <Button variant="outline" className="border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light">
                Partner With Us
              </Button>
              <Button variant="outline" className="border-thryvance-green text-thryvance-green hover:bg-thryvance-green-light">
                View Open Positions
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
