
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OfferHelpRequest {
  title: string;
  description: string;
  category: string;
  location: string;
  timeCommitment: string;
  skills?: string;
  name: string;
  email: string;
  phone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Offer help email function called with method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log("RESEND_API_KEY exists:", !!resendApiKey);
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not found in environment variables");
      return new Response(JSON.stringify({ 
        error: "Email service not configured",
        success: false 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resend = new Resend(resendApiKey);
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);

    const {
      title,
      description,
      category,
      location,
      timeCommitment,
      skills,
      name,
      email,
      phone,
    }: OfferHelpRequest = JSON.parse(requestBody);

    console.log("Parsed offer help data:", { 
      title, 
      category, 
      location, 
      timeCommitment, 
      name, 
      email, 
      phone,
      skills,
      descriptionLength: description?.length 
    });

    // Validate required fields
    if (!title || !description || !category || !location || !timeCommitment || !name || !email) {
      console.error("Missing required fields");
      return new Response(JSON.stringify({ 
        error: "Missing required fields",
        success: false 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Sending offer help email via Resend...");

    const emailResponse = await resend.emails.send({
      from: "Thryvance Help Offers <noreply@thryvance.ca>",
      to: ["thryvance.ca@gmail.com"],
      reply_to: email,
      subject: `New Help Offer: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            New Help Offer Submission
          </h1>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin-top: 0;">Offer Details</h2>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Time Commitment:</strong> ${timeCommitment}</p>
            ${skills ? `<p><strong>Skills/Resources:</strong> ${skills}</p>` : ''}
          </div>
          
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin-top: 0;">Description</h2>
            <div style="background-color: white; padding: 10px; border-radius: 4px; border-left: 4px solid #10b981;">
              ${description.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin-top: 0;">Contact Information</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              This email was sent from the Thryvance offer help form at ${new Date().toLocaleString()}
            </p>
            <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">
              Reply directly to this email to contact ${name}
            </p>
          </div>
        </div>
      `,
    });

    console.log("Offer help email sent successfully. Response:", JSON.stringify(emailResponse, null, 2));

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Help offer sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-offer-help-email function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send email",
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
