import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecureContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  subscribe?: boolean;
}

// Input validation and sanitization
const validateAndSanitizeInput = (data: SecureContactRequest) => {
  const errors: string[] = [];

  // Validate name
  if (!data.name || data.name.trim().length === 0) {
    errors.push("Name is required");
  } else if (data.name.length > 100) {
    errors.push("Name is too long");
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push("Valid email is required");
  } else if (data.email.length > 254) {
    errors.push("Email is too long");
  }

  // Validate subject
  if (!data.subject || data.subject.trim().length === 0) {
    errors.push("Subject is required");
  } else if (data.subject.length > 200) {
    errors.push("Subject is too long");
  }

  // Validate message
  if (!data.message || data.message.trim().length === 0) {
    errors.push("Message is required");
  } else if (data.message.length > 5000) {
    errors.push("Message is too long");
  }

  // Sanitize inputs
  const sanitized = {
    name: data.name.trim().slice(0, 100),
    email: data.email.toLowerCase().trim().slice(0, 254),
    subject: data.subject.trim().slice(0, 200),
    message: data.message.trim().slice(0, 5000),
    subscribe: Boolean(data.subscribe)
  };

  // Check for inappropriate content
  const inappropriatePatterns = [
    /\b(spam|scam|phishing|viagra|cialis)\b/i,
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi
  ];

  const contentToCheck = `${sanitized.name} ${sanitized.subject} ${sanitized.message}`;
  if (inappropriatePatterns.some(pattern => pattern.test(contentToCheck))) {
    errors.push("Content contains inappropriate material");
  }

  return { errors, sanitized };
};

// Rate limiting implementation
const checkRateLimit = async (supabase: any, email: string, ip: string) => {
  const identifier = ip || email;
  const action = 'contact_form';
  const maxAttempts = 5;
  const windowMinutes = 60;

  try {
    // Check existing rate limit
    const { data: existing } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('action', action)
      .single();

    const now = new Date();
    const windowStart = existing?.window_start ? new Date(existing.window_start) : now;
    const windowEnd = new Date(windowStart.getTime() + (windowMinutes * 60 * 1000));

    if (existing) {
      // Check if we're still in the same window
      if (now <= windowEnd) {
        if (existing.attempts >= maxAttempts) {
          return { 
            allowed: false, 
            resetTime: windowEnd,
            attemptsRemaining: 0
          };
        }
        
        // Increment attempts
        await supabase
          .from('rate_limits')
          .update({ 
            attempts: existing.attempts + 1,
            updated_at: now.toISOString()
          })
          .eq('id', existing.id);

        return { 
          allowed: true, 
          attemptsRemaining: maxAttempts - existing.attempts - 1
        };
      } else {
        // Reset window
        await supabase
          .from('rate_limits')
          .update({
            attempts: 1,
            window_start: now.toISOString(),
            blocked_until: null,
            updated_at: now.toISOString()
          })
          .eq('id', existing.id);

        return { allowed: true, attemptsRemaining: maxAttempts - 1 };
      }
    } else {
      // First attempt
      await supabase
        .from('rate_limits')
        .insert({
          identifier,
          action,
          attempts: 1,
          window_start: now.toISOString()
        });

      return { allowed: true, attemptsRemaining: maxAttempts - 1 };
    }
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Allow request if rate limiting fails
    return { allowed: true, attemptsRemaining: maxAttempts };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: SecureContactRequest = await req.json();
    
    // Validate and sanitize input
    const { errors, sanitized } = validateAndSanitizeInput(requestData);
    
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: "Validation failed", 
          details: errors 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get client IP (simplified for this example)
    const clientIP = req.headers.get('cf-connecting-ip') || 
                    req.headers.get('x-forwarded-for') || 
                    'unknown';

    // Check rate limiting
    const rateLimit = await checkRateLimit(supabase, sanitized.email, clientIP);
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded", 
          resetTime: rateLimit.resetTime
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": "3600",
            ...corsHeaders 
          },
        }
      );
    }

    // Store contact submission securely
    const { error: dbError } = await supabase
      .from('contacts')
      .insert({
        name: sanitized.name,
        email: sanitized.email,
        subject: sanitized.subject,
        message: sanitized.message,
        subscribe: sanitized.subscribe
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: "Failed to store contact submission" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email with sanitized content
    const emailResponse = await resend.emails.send({
      from: "Thryvance Contact <noreply@thryvance.ca>",
      to: ["contact@thryvance.ca"],
      subject: `Contact Form: ${sanitized.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${sanitized.name}</p>
        <p><strong>Email:</strong> ${sanitized.email}</p>
        <p><strong>Subject:</strong> ${sanitized.subject}</p>
        <p><strong>Message:</strong></p>
        <div style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${sanitized.message}
        </div>
        <p><strong>Subscribe to updates:</strong> ${sanitized.subscribe ? 'Yes' : 'No'}</p>
        <p><strong>Submitted at:</strong> ${new Date().toISOString()}</p>
        <p><strong>IP Address:</strong> ${clientIP}</p>
      `,
    });

    console.log("Secure contact email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        attemptsRemaining: rateLimit.attemptsRemaining
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in secure-contact function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);