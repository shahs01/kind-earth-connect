
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
      from: "Thryvance Pickup <noreply@thryvance.ca>",
      to: ["thryvance.ca@gmail.com"],
      reply_to: email,
      subject: "New Donation Pickup Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            New Donation Pickup Request
          </h1>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin-top: 0;">Contact Information</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> ${phone}</p>
          </div>
          
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin-top: 0;">Pickup Details</h2>
            <p><strong>Address:</strong> ${address}</p>
            <p><strong>Preferred Date:</strong> ${preferredDate}</p>
            <p><strong>Preferred Time:</strong> ${preferredTime}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin-top: 0;">Items to Donate</h2>
            <div style="background-color: white; padding: 10px; border-radius: 4px; border-left: 4px solid #fbbf24;">
              ${itemsDescription.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          ${additionalDetails ? `
            <div style="background-color: #e0e7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1e40af; margin-top: 0;">Additional Details</h2>
              <div style="background-color: white; padding: 10px; border-radius: 4px; border-left: 4px solid #6366f1;">
                ${additionalDetails.replace(/\n/g, '<br>')}
              </div>
            </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              This pickup request was submitted through the Thryvance donation platform at ${new Date().toLocaleString()}
            </p>
            <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">
              Please contact ${name} within 24 hours to confirm the pickup
            </p>
          </div>
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
