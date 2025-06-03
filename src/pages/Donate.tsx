import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Loader2, Mail, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const predefinedAmounts = [25, 50, 100, 250, 500, 1000];

  useEffect(() => {
    // Check for payment success/failure in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    const sessionId = urlParams.get('session_id');

    if (success === 'true') {
      toast({
        title: "Thank You!",
        description: "Your donation has been processed successfully. We appreciate your support!",
      });
      // Clean up URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === 'true') {
      toast({
        title: "Payment Canceled",
        description: "Your donation was canceled. No charges were made.",
        variant: "destructive"
      });
      // Clean up URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(parseInt(value) || 0);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleDonate = async () => {
    const donationAmount = customAmount ? parseInt(customAmount) : selectedAmount;
    
    console.log("Starting donation process with amount:", donationAmount);
    
    if (!donationAmount || donationAmount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount of at least $1.",
        variant: "destructive"
      });
      return;
    }

    if (!donorEmail || !validateEmail(donorEmail)) {
      toast({
        title: "Email Required",
        description: "Please enter a valid email address for your donation receipt.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log("Invoking create-payment function with:", {
        amount: donationAmount * 100,
        currency: 'usd',
        description: `Donation to Thryvance - $${donationAmount}`,
        donorEmail: donorEmail
      });
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: donationAmount * 100, // Convert to cents
          currency: 'usd',
          description: `Donation to Thryvance - $${donationAmount}`,
          donorEmail: donorEmail
        }
      });

      console.log("Payment response:", { data, error });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to create payment session");
      }

      if (data?.error) {
        console.error("Payment creation error:", data.error);
        throw new Error(data.error);
      }

      if (data?.url) {
        console.log("Redirecting to Stripe checkout:", data.url);
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received from payment processor");
      }
    } catch (error: any) {
      console.error("Error creating payment:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const currentAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;
  const isValidAmount = currentAmount >= 1;
  const isValidEmail = donorEmail && validateEmail(donorEmail);
  const canDonate = isValidAmount && isValidEmail && !isProcessing;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Our Mission</h1>
            <p className="text-lg text-gray-700">
              Your generous donation helps us support communities in need. Every contribution 
              makes a difference in the lives of those we serve.
            </p>
          </div>
          
          {/* Important Notice */}
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Donations made through this platform are not currently tax-deductible. 
              We are working on obtaining the necessary certifications. Thank you for your understanding and support.
            </AlertDescription>
          </Alert>
          
          <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <DollarSign className="mr-2 h-6 w-6 text-thryvance-green" />
              Make a One-Time Donation
            </h2>
            
            {/* Amount Selection */}
            <div className="mb-6">
              <Label className="text-base font-medium mb-3 block">Select Amount</Label>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {predefinedAmounts.map((amount) => (
                  <Button 
                    key={amount}
                    variant={selectedAmount === amount && !customAmount ? "default" : "outline"}
                    className={`h-12 text-lg font-semibold ${selectedAmount === amount && !customAmount ? "bg-thryvance-green hover:bg-thryvance-green-dark" : ""}`}
                    onClick={() => handleAmountSelect(amount)}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              
              <div className="mb-4">
                <Label htmlFor="custom-amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Amount ($)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 text-lg">$</span>
                  <Input
                    type="number"
                    id="custom-amount"
                    min="1"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    className="pl-8 h-12 text-lg border-2 focus:border-thryvance-green"
                  />
                </div>
                {customAmount && !isValidAmount && (
                  <p className="text-red-500 text-sm mt-1">Minimum donation is $1</p>
                )}
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <Label htmlFor="donor-email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline mr-2 h-4 w-4" />
                Email Address (for donation receipt)
              </Label>
              <Input
                type="email"
                id="donor-email"
                placeholder="your@email.com"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                className="h-12 text-lg border-2 focus:border-thryvance-green"
                required
              />
              {donorEmail && !isValidEmail && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
              )}
            </div>

            {/* Donation Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium">Donation Amount:</span>
                <span className="font-bold text-thryvance-green text-xl">
                  ${currentAmount || 0}
                </span>
              </div>
              {isValidEmail && (
                <div className="flex items-center text-sm text-gray-600 mt-2">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  Receipt will be sent to {donorEmail}
                </div>
              )}
            </div>

            <Button 
              className="w-full h-14 bg-thryvance-green hover:bg-thryvance-green-dark text-lg font-semibold"
              onClick={handleDonate}
              disabled={!canDonate}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-5 w-5" />
                  Donate ${currentAmount || 0} Now
                </>
              )}
            </Button>
            
            <p className="text-sm text-gray-600 text-center mt-4">
              You will be redirected to our secure payment processor to complete your donation.
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Other Ways to Give</h2>
            <ul className="space-y-4">
              <li>
                <a href="/monthly-giving" className="text-thryvance-green hover:underline font-medium">
                  Become a monthly donor
                </a>
                <p className="text-gray-600">Make a recurring impact with regular contributions.</p>
              </li>
              <li>
                <a href="/sponsor-project" className="text-thryvance-green hover:underline font-medium">
                  Sponsor a community project
                </a>
                <p className="text-gray-600">Fund specific initiatives that align with your values.</p>
              </li>
              <li>
                <a href="/donate-goods" className="text-thryvance-green hover:underline font-medium">
                  Donate goods or services
                </a>
                <p className="text-gray-600">Contribute resources, expertise, or products.</p>
              </li>
            </ul>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Impact</h2>
            <p className="text-gray-700 mb-4">
              When you donate to Thryvance, your contribution helps:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Provide essential resources to underserved communities</li>
              <li>Fund educational and skill-building programs</li>
              <li>Support local businesses and entrepreneurs</li>
              <li>Create opportunities for community connection and growth</li>
              <li>Develop sustainable community infrastructure</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Donate;
