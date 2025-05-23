
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import CommunityFeed from "@/components/CommunityFeed";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Search, HandHelping, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        
        {/* Search and Help Actions Section - Moved to hero section */}
        <div className="container mx-auto px-4 py-8 mt-4">
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <Button asChild size="lg" className="bg-thryvance-green hover:bg-thryvance-green-dark">
              <Link to="/offer-help" className="flex items-center gap-2">
                <HandHelping className="w-5 h-5" />
                Offer Help
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-thryvance-blue hover:bg-thryvance-blue-dark">
              <Link to="/request-help" className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Request Help
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-thryvance-green-light text-thryvance-green border border-thryvance-green hover:bg-thryvance-green-light/80">
              <Link to="/community" className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Community
              </Link>
            </Button>
          </div>
        </div>
        
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
