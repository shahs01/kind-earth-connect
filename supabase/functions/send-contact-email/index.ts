
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  subscribe?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Contact email function called with method:", req.method);
  
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
      name,
      email,
      subject,
      message,
      subscribe = false,
    }: ContactRequest = JSON.parse(requestBody);

    console.log("Parsed form data:", { name, email, subject, messageLength: message?.length, subscribe });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.error("Missing required fields:", { name: !!name, email: !!email, subject: !!subject, message: !!message });
      return new Response(JSON.stringify({ 
        error: "Missing required fields",
        success: false 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format:", email);
      return new Response(JSON.stringify({ 
        error: "Invalid email format",
        success: false 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Sending contact email via Resend to thryvance.ca@gmail.com...");
    
    // Try sending with better email configuration
    const emailResponse = await resend.emails.send({
      from: "Thryvance Contact Form <noreply@thryvance.ca>",
      to: "thryvance.ca@gmail.com",
      reply_to: email,
      subject: `[CONTACT FORM] ${subject} - From ${name}`,
      text: `
Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}
Newsletter Subscription: ${subscribe ? 'Yes' : 'No'}

Message:
${message}

---
Submitted at: ${new Date().toISOString()}
Reply to this email to respond directly to ${name} at ${email}
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contact Form Submission</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 25px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New Contact Form Submission</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">From Thryvance Website</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; border: 1px solid #e9ecef; margin-bottom: 25px;">
            <h2 style="color: #495057; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Contact Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; font-weight: bold; color: #6c757d; width: 140px; vertical-align: top;">Full Name:</td>
                <td style="padding: 12px 0; color: #495057; font-weight: 500;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: bold; color: #6c757d; vertical-align: top;">Email:</td>
                <td style="padding: 12px 0;">
                  <a href="mailto:${email}" style="color: #10b981; text-decoration: none; font-weight: 500;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: bold; color: #6c757d; vertical-align: top;">Subject:</td>
                <td style="padding: 12px 0; color: #495057; font-weight: 500;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: bold; color: #6c757d; vertical-align: top;">Newsletter:</td>
                <td style="padding: 12px 0; color: #495057;">
                  <span style="background-color: ${subscribe ? '#d4edda' : '#f8d7da'}; color: ${subscribe ? '#155724' : '#721c24'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
                    ${subscribe ? '✓ Wants to subscribe' : '✗ No subscription'}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; border: 1px solid #e9ecef; border-left: 4px solid #10b981;">
            <h2 style="color: #495057; margin: 0 0 15px 0; font-size: 20px;">Message</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; border: 1px solid #dee2e6; line-height: 1.8; color: #495057; white-space: pre-wrap; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${message}</div>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #e9ecef; border-radius: 8px; text-align: center;">
            <p style="color: #6c757d; font-size: 16px; margin: 0 0 10px 0; font-weight: 500;">
              📧 Click "Reply" to respond directly to ${name}
            </p>
            <p style="color: #868e96; font-size: 14px; margin: 0;">
              Submitted on ${new Date().toLocaleString('en-CA', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Toronto'
              })} (Toronto time)
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; padding: 15px; border-top: 1px solid #dee2e6;">
            <p style="color: #adb5bd; font-size: 12px; margin: 0;">
              This email was sent from the Thryvance contact form at thryvance.ca
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email send attempt completed. Full response:", JSON.stringify(emailResponse, null, 2));

    if (emailResponse.error) {
      console.error("Resend API returned an error:", emailResponse.error);
      return new Response(JSON.stringify({ 
        error: `Email delivery failed: ${emailResponse.error.message || 'Unknown error'}`,
        success: false,
        details: emailResponse.error
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!emailResponse.data?.id) {
      console.error("Email response missing ID:", emailResponse);
      return new Response(JSON.stringify({ 
        error: "Email may not have been sent properly",
        success: false 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("✅ Contact email sent successfully! Email ID:", emailResponse.data.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Contact message sent successfully",
      emailId: emailResponse.data.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in send-contact-email function:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send contact email",
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
