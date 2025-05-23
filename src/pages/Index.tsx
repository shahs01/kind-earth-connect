
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import CommunityFeed from "@/components/CommunityFeed";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        {/* Removed duplicate buttons section */}
        <FeatureSection />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Recent Activity in Our Community</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            See what's happening in the Thryvance community right now.
          </p>
        </div>
        <CommunityFeed />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
