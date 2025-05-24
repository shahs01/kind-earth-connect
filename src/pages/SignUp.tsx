
import { useState } from "react";
import Navbar from "@/components/Navbar";
import SignUpForm from "@/components/SignUpForm";
import Footer from "@/components/Footer";
import UsernameSelectionForm from "@/components/UsernameSelectionForm";

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<{
    email: string;
    password: string;
    name: string;
    location: string;
    phone: string;
  } | null>(null);

  const handleFirstStepComplete = (data: {
    email: string;
    password: string;
    name: string;
    location: string;
    phone: string;
  }) => {
    setUserData(data);
    setStep(2);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-hero-pattern">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto mb-4 bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
            <strong>Note:</strong> Email verification is currently disabled. You'll be able to log in immediately after signing up.
          </div>
          
          {step === 1 ? (
            <SignUpForm onFirstStepComplete={handleFirstStepComplete} />
          ) : (
            <UsernameSelectionForm userData={userData} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignUp;
