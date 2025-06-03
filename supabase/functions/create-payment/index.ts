
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
    console.log("=== PAYMENT CREATION STARTED ===");
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    // Check all available environment variables
    console.log("Available env vars:", Object.keys(Deno.env.toObject()));
    
    // Get the Stripe secret key with multiple possible names
    let stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || 
                         Deno.env.get("STRIPE_SECRET") || 
                         Deno.env.get("STRIPE_SK");
    
    console.log("Stripe key check - STRIPE_SECRET_KEY exists:", !!Deno.env.get("STRIPE_SECRET_KEY"));
    console.log("Stripe key check - STRIPE_SECRET exists:", !!Deno.env.get("STRIPE_SECRET"));
    console.log("Stripe key check - STRIPE_SK exists:", !!Deno.env.get("STRIPE_SK"));
    console.log("Final stripe key exists:", !!stripeSecretKey);
    console.log("Stripe key starts with sk_:", stripeSecretKey?.startsWith('sk_') || false);
    
    if (!stripeSecretKey) {
      console.error("❌ NO STRIPE SECRET KEY FOUND");
      console.error("Please ensure you have added STRIPE_SECRET_KEY to your Supabase edge function secrets");
      return new Response(JSON.stringify({ 
        error: "Payment system configuration error. The Stripe secret key is not configured.",
        details: "Please check your Supabase edge function secrets configuration."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!stripeSecretKey.startsWith('sk_')) {
      console.error("❌ INVALID STRIPE SECRET KEY FORMAT");
      console.error("Key should start with 'sk_' but starts with:", stripeSecretKey.substring(0, 3));
      return new Response(JSON.stringify({ 
        error: "Invalid Stripe secret key format. Please check your configuration.",
        details: "The secret key should start with 'sk_test_' or 'sk_live_'"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Get the request body
    const body = await req.json();
    console.log("Request body received:", body);
    
    const { amount, currency = 'cad', description, donorEmail } = body;

    // Validate required fields
    if (!amount || amount < 100) {
      console.error("❌ Invalid amount:", amount);
      return new Response(JSON.stringify({ 
        error: "Invalid amount. Minimum donation is $1.00 CAD" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!donorEmail || !donorEmail.includes('@')) {
      console.error("❌ Invalid email:", donorEmail);
      return new Response(JSON.stringify({ 
        error: "Valid email address is required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("✅ Validation passed - Amount:", amount, "Email:", donorEmail);

    // Initialize Stripe
    console.log("🔄 Initializing Stripe...");
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || req.headers.get("referer")?.split('/').slice(0, 3).join('/') || "http://localhost:3000";
    console.log("✅ Stripe initialized, Origin:", origin);

    // Create checkout session
    const sessionData = {
      customer_email: donorEmail,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: "Donation to Thryvance",
              description: description || `Donation to support Thryvance - $${(amount / 100).toFixed(2)} CAD`
            },
            unit_amount: amount,
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

    console.log("🔄 Creating Stripe checkout session...");
    console.log("Session data:", JSON.stringify(sessionData, null, 2));
    
    const session = await stripe.checkout.sessions.create(sessionData);
    
    console.log("✅ Stripe session created successfully!");
    console.log("Session ID:", session.id);
    console.log("Session URL:", session.url);

    return new Response(JSON.stringify({ 
      url: session.url, 
      sessionId: session.id,
      success: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("❌ ERROR in create-payment:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    let errorMessage = "An unexpected error occurred while processing your donation";
    let statusCode = 500;
    
    if (error.message) {
      errorMessage = error.message;
    }
    
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      console.error("🔴 Stripe Invalid Request Error:", error.message);
      errorMessage = "Invalid payment request. Please check your information and try again.";
      statusCode = 400;
    } else if (error.type === 'StripeAuthenticationError') {
      console.error("🔴 Stripe Authentication Error - Check your secret key");
      errorMessage = "Payment system authentication error. Please contact support.";
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});
