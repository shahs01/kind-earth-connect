import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResumeSubmissionRequest {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  resumeFile: {
    content: string; // base64 content
    filename: string;
    contentType: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Resume submission function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { name, email, phone, message, resumeFile }: ResumeSubmissionRequest = await req.json();

    console.log("Processing resume submission for:", name, email);

    // Convert base64 to buffer for attachment
    const fileContent = Uint8Array.from(atob(resumeFile.content), c => c.charCodeAt(0));

    const emailResponse = await resend.emails.send({
      from: "Thryvance Careers <onboarding@resend.dev>",
      to: ["thryvance.ca@gmail.com"],
      subject: `New Resume Submission from ${name}`,
      html: `
        <h2>New Resume Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        ${message ? `<p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>` : ''}
        <p><strong>Resume:</strong> See attached file</p>
        <hr>
        <p><em>This is an automated email from the Thryvance careers page.</em></p>
      `,
      attachments: [
        {
          filename: resumeFile.filename,
          content: fileContent,
        },
      ],
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-resume-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send resume" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);