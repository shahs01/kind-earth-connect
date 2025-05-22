
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import CommunityFeed from "@/components/CommunityFeed";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeatureSection />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Search for Help or Offers in Our Community</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Find offers of help, request assistance, or connect with others in your neighborhood.
          </p>
          <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark">
            <Link to="/community" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Community & Help
            </Link>
          </Button>
        </div>
        <CommunityFeed />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
