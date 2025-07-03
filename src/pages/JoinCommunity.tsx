import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, MessageSquare, HandHeart, MapPin, Calendar, Shield } from "lucide-react";

const JoinCommunity = () => {
  const steps = [
    {
      icon: <Users className="h-8 w-8 text-thryvance-green" />,
      title: "Create Your Profile",
      description: "Sign up and tell us about yourself. Share your location, interests, and how you'd like to help."
    },
    {
      icon: <MapPin className="h-8 w-8 text-thryvance-green" />,
      title: "Explore Your Area",
      description: "Browse posts from neighbors in your community. See what help is needed and what support is available."
    },
    {
      icon: <HandHeart className="h-8 w-8 text-thryvance-green" />,
      title: "Start Helping",
      description: "Respond to requests, offer your skills, or post your own needs. Every interaction strengthens our community."
    }
  ];

  const features = [
    {
      icon: <MessageSquare className="h-6 w-6 text-thryvance-green" />,
      title: "Direct Messaging",
      description: "Connect privately with community members to coordinate help and build relationships."
    },
    {
      icon: <Shield className="h-6 w-6 text-thryvance-green" />,
      title: "Safe & Verified",
      description: "Our verification system and community guidelines ensure a safe environment for everyone."
    },
    {
      icon: <Calendar className="h-6 w-6 text-thryvance-green" />,
      title: "Event Coordination",
      description: "Organize and participate in community events, volunteer opportunities, and local initiatives."
    },
    {
      icon: <Users className="h-6 w-6 text-thryvance-green" />,
      title: "Build Trust",
      description: "Earn trust badges and build your reputation as a reliable community member through positive interactions."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-hero-pattern py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Join Our Growing Community
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Become part of a network where neighbors help neighbors, communities thrive, and everyone has the support they need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-thryvance-green hover:bg-thryvance-green-dark text-white px-8 py-6 h-auto text-lg">
                <Link to="/signup">Sign Up Today</Link>
              </Button>
              <Button asChild variant="outline" className="border-thryvance-blue text-thryvance-blue hover:bg-thryvance-blue-light px-8 py-6 h-auto text-lg">
                <Link to="/community">Browse Community</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Getting started is easy. Follow these simple steps to become an active part of your community.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="bg-thryvance-green-light p-4 rounded-full">
                        {step.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-thryvance-neutral-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Community Features</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everything you need to connect, help, and thrive with your neighbors.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {feature.icon}
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Join Thousands of Community Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-thryvance-green mb-2">1,200+</div>
                <div className="text-gray-600">Active Members</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-thryvance-green mb-2">3,400+</div>
                <div className="text-gray-600">Successful Connections</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-thryvance-green mb-2">150+</div>
                <div className="text-gray-600">Communities Served</div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-thryvance-green text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join our community today and discover the power of neighbors helping neighbors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-white text-thryvance-green hover:bg-gray-100 px-8 py-6 h-auto text-lg">
                <Link to="/signup">Create Your Account</Link>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-thryvance-green px-8 py-6 h-auto text-lg">
                <Link to="/about">Learn More About Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default JoinCommunity;