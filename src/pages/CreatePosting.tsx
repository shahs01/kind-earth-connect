
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Gift, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

const CreatePosting = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleOptionSelect = (path: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in or sign up to create a posting.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    navigate(path);
  };

  const options = [
    {
      title: "Volunteer Opportunity",
      description: "Post an opportunity for volunteers to help your organization or community project.",
      icon: <Briefcase className="h-10 w-10 text-thryvance-green" />,
      path: "/volunteer?tab=post",
      color: "bg-green-50",
    },
    {
      title: "Offer Help",
      description: "Offer goods, services, or assistance to others in your community.",
      icon: <Gift className="h-10 w-10 text-blue-500" />,
      path: "/offer-help",
      color: "bg-blue-50",
    },
    {
      title: "Request Help",
      description: "Ask for support, goods, or services from your community.",
      icon: <HelpCircle className="h-10 w-10 text-purple-500" />,
      path: "/request-help",
      color: "bg-purple-50",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Create a New Posting</h1>
          <p className="text-gray-600 mb-8">Select the type of posting you want to create</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {options.map((option) => (
              <Card 
                key={option.title} 
                className="border-2 hover:border-thryvance-green cursor-pointer transition-all duration-200 hover:shadow-md"
                onClick={() => handleOptionSelect(option.path)}
              >
                <CardHeader className={`${option.color} rounded-t-lg pb-4`}>
                  <div className="flex justify-center">{option.icon}</div>
                </CardHeader>
                <CardContent className="pt-6">
                  <CardTitle className="mb-2 text-xl text-center">{option.title}</CardTitle>
                  <CardDescription className="text-center">{option.description}</CardDescription>
                  <Button 
                    className="w-full mt-4 bg-thryvance-green hover:bg-thryvance-green-dark" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionSelect(option.path);
                    }}
                  >
                    Create {option.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreatePosting;
