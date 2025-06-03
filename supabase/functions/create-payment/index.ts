
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting payment creation...");
    
    // Get the Stripe secret key
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("Stripe key exists:", !!stripeSecretKey);
    
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY environment variable is not set");
      throw new Error("Payment configuration error. Please contact support.");
    }

    // Get the request body
    const { amount, currency = 'usd', description, donorEmail } = await req.json();
    console.log("Payment request:", { amount, currency, description, donorEmail });

    if (!amount || amount < 100) { // Minimum $1.00
      throw new Error("Invalid amount. Minimum donation is $1.00");
    }

    if (!donorEmail || !donorEmail.includes('@')) {
      throw new Error("Valid email address is required");
    }

    // Initialize Stripe with the secret key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || "http://localhost:3000";
    console.log("Origin:", origin);

    // Create a one-time payment session
    const sessionData = {
      customer_email: donorEmail,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: "Donation to Thryvance",
              description: description || `Donation to support Thryvance - $${(amount / 100).toFixed(2)}`
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment" as const,
      success_url: `${origin}/donate?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/donate?canceled=true`,
      metadata: {
        donor_email: donorEmail,
        donation_amount: (amount / 100).toString(),
      }
    };

    console.log("Creating Stripe session with data:", JSON.stringify(sessionData, null, 2));
    const session = await stripe.checkout.sessions.create(sessionData);
    console.log("Session created successfully:", session.id);

    return new Response(JSON.stringify({ 
      url: session.url, 
      sessionId: session.id,
      success: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error creating payment session:", error);
    console.error("Error stack:", error.stack);
    
    let errorMessage = "An unexpected error occurred";
    if (error.message) {
      errorMessage = error.message;
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
