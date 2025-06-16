
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Sprout, Search } from "lucide-react";
import Logo from "./Logo";

const HeroSection = () => {
  return (
    <div className="bg-hero-pattern py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 space-y-6 max-w-full">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm shadow-sm">
              <Sprout className="h-4 w-4 text-thryvance-green" />
              <span className="text-sm font-medium">Community Support Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 break-words">
              Get Help. Give Help. <span className="text-thryvance-green">Right Here</span> in Your Community.
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600">
              Thryvance is a free platform to give or get help — from food and housing to local nonprofits and volunteer support. 
              Built for neighbors helping neighbors.
            </p>
            
            <div className="pt-4">
              <p className="text-base font-medium text-gray-700 mb-4">What would you like to do?</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark text-white font-medium px-6 md:px-8 py-4 md:py-6 h-auto text-sm md:text-base">
                  <Link to="/offer-help">🤲 Offer Help</Link>
                </Button>
                <Button asChild variant="outline" className="border-thryvance-blue text-thryvance-blue hover:bg-thryvance-blue-light px-6 md:px-8 py-4 md:py-6 h-auto text-sm md:text-base">
                  <Link to="/request-help">🆘 Request Help</Link>
                </Button>
                <Button asChild className="bg-thryvance-green-light text-thryvance-green border border-thryvance-green hover:bg-thryvance-green-light/80 px-6 md:px-8 py-4 md:py-6 h-auto text-sm md:text-base">
                  <Link to="/community" className="flex items-center gap-2">
                    <Search className="h-4 md:h-5 w-4 md:w-5" />
                    <span>🔍 Browse Community</span>
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-thryvance-neutral-light border-2 border-white flex items-center justify-center">
                    <Users size={12} className="md:w-4 md:h-4 text-thryvance-neutral-dark" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm md:text-base font-semibold text-gray-700">
                  Join <span className="text-thryvance-green">1,234+</span> community members
                </p>
                <p className="text-xs md:text-sm text-gray-600">
                  Trusted by people all across your region
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-lg animate-float w-full">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 md:w-32 md:h-32 bg-thryvance-blue-light rounded-full opacity-50"></div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 md:w-32 md:h-32 bg-thryvance-green-light rounded-full opacity-50"></div>
              <img 
                src="/lovable-uploads/11351756-e1f5-4edf-a34a-d94f3880d8cf.png" 
                alt="Thryvance Logo" 
                className="w-full h-auto rounded-xl shadow-xl relative z-10 object-contain bg-thryvance-neutral-light p-8 md:p-12 max-w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
