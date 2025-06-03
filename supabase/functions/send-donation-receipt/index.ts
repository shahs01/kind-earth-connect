
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DonationReceiptRequest {
  donorEmail: string;
  amount: number;
  currency: string;
  sessionId: string;
  donationDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== DONATION RECEIPT EMAIL STARTED ===");
    
    const { donorEmail, amount, currency, sessionId, donationDate }: DonationReceiptRequest = await req.json();
    
    console.log("Sending receipt to:", donorEmail, "Amount:", amount, "Currency:", currency);

    const formattedAmount = (amount / 100).toFixed(2);
    const receiptNumber = `THR-${sessionId.slice(-12).toUpperCase()}`;
    
    const emailResponse = await resend.emails.send({
      from: "Thryvance <donations@thryvance.org>",
      to: [donorEmail],
      subject: `Thank you for your donation to Thryvance - Receipt #${receiptNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Donation Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
            .receipt-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .amount { font-size: 24px; font-weight: bold; color: #10b981; text-align: center; margin: 15px 0; }
            .details { margin: 20px 0; }
            .details table { width: 100%; border-collapse: collapse; }
            .details td { padding: 8px 0; border-bottom: 1px solid #eee; }
            .details td:first-child { font-weight: bold; }
            .footer { background-color: #374151; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
            .important-note { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Thank You for Your Donation!</h1>
            <p>Your generosity helps us support communities in need</p>
          </div>
          
          <div class="content">
            <div class="receipt-box">
              <h2 style="margin-top: 0; color: #10b981;">Donation Receipt</h2>
              
              <div class="amount">$${formattedAmount} ${currency.toUpperCase()}</div>
              
              <div class="details">
                <table>
                  <tr>
                    <td>Receipt Number:</td>
                    <td>${receiptNumber}</td>
                  </tr>
                  <tr>
                    <td>Donation Date:</td>
                    <td>${new Date(donationDate).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td>Payment Method:</td>
                    <td>Credit/Debit Card</td>
                  </tr>
                  <tr>
                    <td>Transaction ID:</td>
                    <td>${sessionId}</td>
                  </tr>
                  <tr>
                    <td>Donor Email:</td>
                    <td>${donorEmail}</td>
                  </tr>
                </table>
              </div>
            </div>

            <div class="important-note">
              <strong>Important Tax Information:</strong> Currently, donations made through Thryvance are not tax-deductible. We are working toward obtaining the necessary certifications and registrations to make donations tax-deductible in the future. We appreciate your understanding and continued support.
            </div>

            <h3>Your Impact</h3>
            <p>Your donation of $${formattedAmount} ${currency.toUpperCase()} helps us:</p>
            <ul>
              <li>Provide essential resources to underserved communities</li>
              <li>Fund educational and skill-building programs</li>
              <li>Support local businesses and entrepreneurs</li>
              <li>Create opportunities for community connection and growth</li>
              <li>Develop sustainable community infrastructure</li>
            </ul>

            <p><strong>Keep this receipt for your records.</strong> If you have any questions about your donation or need a duplicate receipt, please contact us at donations@thryvance.org.</p>
          </div>
          
          <div class="footer">
            <p><strong>Thryvance</strong><br>
            Supporting Communities Together<br>
            <a href="mailto:donations@thryvance.org" style="color: #60a5fa;">donations@thryvance.org</a></p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Donation receipt email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      receiptNumber 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error sending donation receipt:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
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
