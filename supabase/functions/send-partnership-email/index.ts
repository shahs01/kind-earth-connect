
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PartnershipRequest {
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  organizationType: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      organizationName,
      contactName,
      email,
      phone,
      organizationType,
      message,
    }: PartnershipRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Thryvance Partnership <onboarding@resend.dev>",
      to: ["partnerships@thryvance.ca"], // Replace with your actual email
      subject: `New Partnership Request from ${organizationName}`,
      html: `
        <h1>New Partnership Request</h1>
        <h2>Organization Details</h2>
        <p><strong>Organization Name:</strong> ${organizationName}</p>
        <p><strong>Organization Type:</strong> ${organizationType}</p>
        
        <h2>Contact Information</h2>
        <p><strong>Contact Name:</strong> ${contactName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        
        <h2>Partnership Details</h2>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        
        <hr>
        <p><em>This email was sent from the Thryvance partnership request form.</em></p>
      `,
    });

    console.log("Partnership email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-partnership-email function:", error);
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
