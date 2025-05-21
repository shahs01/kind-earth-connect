
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import RequestHelpForm from "@/components/RequestHelpForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const RequestHelp = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthAlert, setShowAuthAlert] = useState(false);

  useEffect(() => {
    // Show auth alert if user is not authenticated after loading completes
    if (!isLoading && !isAuthenticated) {
      setShowAuthAlert(true);
    }
  }, [isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-thryvance-blue-light py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Request Help</h1>
          <p className="text-gray-700 max-w-3xl">
            Ask for the support you need from your community. Whether it's assistance with a task, resources, or skills, let us know how we can help.
          </p>
        </div>
      </div>
      
      <main className="flex-grow py-10 bg-thryvance-neutral-light">
        <div className="container mx-auto px-4 max-w-3xl">
          {isAuthenticated ? (
            <RequestHelpForm />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  You need to be logged in to request help from our community.
                </AlertDescription>
              </Alert>
              
              <div className="text-center">
                <p className="mb-6 text-gray-700">
                  Please log in to your account or create a new account to continue.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button asChild>
                    <Link to="/login">Log In</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RequestHelp;
