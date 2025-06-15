
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const VerifyEmail = () => {
  const { user, emailVerified, sendEmailVerification, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!isLoading && emailVerified) {
      toast({
        title: "Email verified!",
        description: "You can now access all features.",
      });
      navigate('/profile', { replace: true });
    }
  }, [emailVerified, navigate, toast, isLoading]);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await sendEmailVerification();
      toast({
        title: "Verification Email Sent",
        description: "A new verification link has been sent to your email address.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  // If user is not logged in but somehow lands here, redirect to login
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-12 flex items-center justify-center bg-hero-pattern">
          <div className="container px-4">
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  Not Logged In
                </CardTitle>
                <CardDescription>
                  Please log in to continue.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => navigate('/login')} className="w-full">
                  Go to Login
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 flex items-center justify-center bg-hero-pattern">
        <div className="container px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <MailCheck className="mx-auto h-12 w-12 text-thryvance-green mb-2" />
              <CardTitle className="text-2xl">
                Verify Your Email
              </CardTitle>
              <CardDescription>
                A verification link has been sent to your email address ({user.email}). Please check your inbox and click the link to activate your account.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="text-center mb-4 text-gray-600">
                If you haven't received the email, please check your spam folder or click the button below to resend it.
              </p>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-2">
              <Button 
                onClick={handleResendVerification}
                className="w-full bg-thryvance-green hover:bg-thryvance-green-dark"
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
              <Button 
                onClick={handleLogout}
                variant="link"
                className="w-full text-thryvance-blue"
              >
                Log out and try another account
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
