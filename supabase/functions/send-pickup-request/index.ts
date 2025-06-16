
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PickupRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  itemsDescription: string;
  additionalDetails?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      name, 
      email, 
      phone, 
      address, 
      preferredDate, 
      preferredTime, 
      itemsDescription, 
      additionalDetails 
    }: PickupRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "shezashahzad28@gmail.com",
      to: ["thryvance.ca@gmail.com"],
      subject: "New Donation Pickup Request",
      html: `
        <h1>New Donation Pickup Request</h1>
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Contact Information</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          
          <h2>Pickup Details</h2>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Preferred Date:</strong> ${preferredDate}</p>
          <p><strong>Preferred Time:</strong> ${preferredTime}</p>
          
          <h2>Items to Donate</h2>
          <p>${itemsDescription}</p>
          
          ${additionalDetails ? `
            <h2>Additional Details</h2>
            <p>${additionalDetails}</p>
          ` : ''}
          
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            This request was submitted through the Thryvance donation platform.
            Please contact the donor within 24 hours to confirm the pickup.
          </p>
        </div>
      `,
    });

    console.log("Pickup request email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-pickup-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
