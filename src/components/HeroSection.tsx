
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Users } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="bg-hero-pattern py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm shadow-sm">
              <Heart className="h-4 w-4 text-thryvance-green" />
              <span className="text-sm font-medium">Community Support Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800">
              Connecting <span className="text-thryvance-green">Kindness</span> in Your Community
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600">
              Thryvance connects those who need help with those who can give it. 
              Join our community of neighbors helping neighbors.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark text-white font-medium px-8 py-6 h-auto">
                <Link to="/offer-help">Offer Help</Link>
              </Button>
              <Button asChild variant="outline" className="border-thryvance-blue text-thryvance-blue hover:bg-thryvance-blue-light px-8 py-6 h-auto">
                <Link to="/request-help">Request Help</Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-thryvance-neutral-light border-2 border-white flex items-center justify-center">
                    <Users size={16} className="text-thryvance-neutral-dark" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Join <span className="font-semibold">1,234+</span> community members
              </p>
            </div>
          </div>
          
          <div className="flex-1 max-w-lg animate-float">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-thryvance-blue-light rounded-full opacity-50"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-thryvance-green-light rounded-full opacity-50"></div>
              <img 
                src="https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&q=80" 
                alt="People helping in community" 
                className="w-full h-auto rounded-xl shadow-xl relative z-10 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
