import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
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

  const handleDonate = async () => {
    const donationAmount = customAmount ? parseInt(customAmount) : selectedAmount;
    
    if (!donationAmount || donationAmount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: donationAmount * 100, // Convert to cents
          currency: 'usd',
          description: `Donation to Thryvance - $${donationAmount}`
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Payment",
          description: "Opening secure payment page in a new tab.",
        });
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Donate Online</h1>
          <p className="text-lg text-gray-700 mb-8">
            Your generous donation helps us support communities in need. Every contribution 
            makes a difference in the lives of those we serve.
          </p>
          
          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Donations made through this platform are not currently tax-deductible. 
              We are working on obtaining the necessary certifications. Thank you for your understanding and support.
            </p>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Make a One-Time Donation</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {predefinedAmounts.map((amount) => (
                <Button 
                  key={amount}
                  variant={selectedAmount === amount && !customAmount ? "default" : "outline"}
                  className={selectedAmount === amount && !customAmount ? "bg-thryvance-green hover:bg-thryvance-green-dark" : ""}
                  onClick={() => handleAmountSelect(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>
            <div className="mb-4">
              <label htmlFor="custom-amount" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  id="custom-amount"
                  min="1"
                  placeholder="Other amount"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className="pl-8 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-thryvance-green focus:border-transparent"
                />
              </div>
            </div>
            <Button 
              className="w-full bg-thryvance-green hover:bg-thryvance-green-dark mt-4"
              onClick={handleDonate}
              disabled={isProcessing || (!selectedAmount && !customAmount)}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Donate ${customAmount || selectedAmount} Now
                </>
              )}
            </Button>
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
