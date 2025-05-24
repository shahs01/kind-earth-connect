
import { useState } from "react";
import Navbar from "@/components/Navbar";
import BasicInfoForm from "@/components/BasicInfoForm";
import UsernameSelectionForm from "@/components/UsernameSelectionForm";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState<'basic' | 'username'>('basic');
  const [basicUserData, setBasicUserData] = useState<{
    email: string;
    password: string;
    name: string;
    phone: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBasicInfoComplete = (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => {
    setBasicUserData(data);
    setCurrentStep('username');
  };

  const handleSignUp = async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    username: string;
  }) => {
    setIsLoading(true);
    
    try {
      await signUp(data);
      
      toast({
        title: "Account created!",
        description: "Your account has been created successfully."
      });
      
      navigate('/');
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An error occurred during signup",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-hero-pattern">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto mb-4 bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
            <strong>Note:</strong> Email verification is currently disabled. You'll be able to log in immediately after signing up.
          </div>
          
          {currentStep === 'basic' && (
            <BasicInfoForm onNextStep={handleBasicInfoComplete} />
          )}
          
          {currentStep === 'username' && (
            <UsernameSelectionForm 
              userData={basicUserData} 
              onComplete={handleSignUp}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;
