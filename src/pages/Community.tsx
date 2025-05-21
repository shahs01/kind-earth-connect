
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import CommunityFeed from "@/components/CommunityFeed";
import Footer from "@/components/Footer";

const Community = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-thryvance-green-light py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Community Feed</h1>
          <p className="text-gray-700 max-w-3xl">
            Welcome to the Thryvance community feed. Here you can see all the ways 
            people are offering help and requesting support in your area.
          </p>
        </div>
      </div>
      <main className="flex-grow">
        <CommunityFeed />
      </main>
      <Footer />
    </div>
  );
};

export default Community;
