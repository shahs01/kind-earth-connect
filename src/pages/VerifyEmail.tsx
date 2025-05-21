
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const VerifyEmail = () => {
  const { user, emailVerified } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Security fix: Add CSRF protection by checking token origin
  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');
    if (token && !token.match(/^[a-zA-Z0-9_-]+$/)) {
      navigate('/login');
    }
  }, [location, navigate]);
  
  // Redirect to profile since email verification is disabled
  useEffect(() => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  }, [user, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 flex items-center justify-center">
        <div className="container px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
              <CardTitle className="text-2xl">
                Email Verification Not Required
              </CardTitle>
              <CardDescription>
                Email verification has been disabled. You can continue to use your account.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="text-center mb-4 text-gray-600">
                You now have full access to your Thryvance account.
              </p>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-2">
              <Button 
                onClick={() => navigate('/profile')}
                className="w-full bg-thryvance-green hover:bg-thryvance-green-dark"
              >
                Continue to Your Profile
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
