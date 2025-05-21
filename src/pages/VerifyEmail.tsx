
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const VerifyEmail = () => {
  const { user, isLoading, emailVerified, sendEmailVerification, verifyEmail } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract token from URL if present
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    
    if (token) {
      const verifyToken = async () => {
        setVerifying(true);
        const success = await verifyEmail(token);
        setVerifying(false);
        
        if (success) {
          setTimeout(() => {
            navigate('/profile');
          }, 2000);
        }
      };
      
      verifyToken();
    }
  }, [location, verifyEmail, navigate]);
  
  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
    
    // Redirect to profile if already verified
    if (!isLoading && emailVerified) {
      navigate('/profile');
    }
  }, [user, isLoading, emailVerified, navigate]);
  
  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);
  
  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    
    await sendEmailVerification();
    setResendCooldown(60); // 1 minute cooldown
  };
  
  if (isLoading || verifying) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-thryvance-green" />
            <p className="text-gray-600">
              {verifying ? "Verifying your email..." : "Loading..."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect to login
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 flex items-center justify-center">
        <div className="container px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              {emailVerified ? (
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
              ) : (
                <Mail className="mx-auto h-12 w-12 text-thryvance-blue mb-2" />
              )}
              <CardTitle className="text-2xl">
                {emailVerified ? "Email Verified" : "Verify Your Email"}
              </CardTitle>
              <CardDescription>
                {emailVerified
                  ? "Your email has been successfully verified."
                  : `We sent a verification link to ${user.email}. Please check your inbox.`}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {!emailVerified && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-sm">
                  <div className="flex gap-2 items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Verification required</p>
                      <p className="text-amber-700 mt-1">
                        You need to verify your email address before you can fully use your account. 
                        Click the link in the email we sent you, or request a new verification link below.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {emailVerified && (
                <p className="text-center mb-4 text-gray-600">
                  You now have full access to your Thryvance account.
                </p>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col gap-2">
              {emailVerified ? (
                <Button 
                  onClick={() => navigate('/profile')}
                  className="w-full bg-thryvance-green hover:bg-thryvance-green-dark"
                >
                  Continue to Your Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleResendVerification}
                    variant="outline"
                    className="w-full"
                    disabled={resendCooldown > 0}
                  >
                    {resendCooldown > 0
                      ? `Resend link (${resendCooldown}s)`
                      : "Resend verification email"}
                  </Button>
                  <Button
                    onClick={() => navigate('/profile')}
                    variant="ghost"
                    className="w-full"
                  >
                    Continue to profile (limited access)
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
