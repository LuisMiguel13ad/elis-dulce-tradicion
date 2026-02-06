import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Resend } from "npm:resend@^4.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://elisbakery.com";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "orders@elisbakery.com";
const FROM_NAME = Deno.env.get("FROM_NAME") || "Eli's Bakery";
const OWNER_EMAIL = Deno.env.get("OWNER_EMAIL") || "owner@elisbakery.com";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// XSS protection: escape HTML special characters
function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

interface FailedPaymentData {
  amount: number;
  customer_name: string;
  customer_email: string;
  error_message: string;
  idempotency_key?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const { payment } = await req.json() as { payment: FailedPaymentData };

    if (!payment) {
      return new Response(
        JSON.stringify({ error: "Payment data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(payment.amount);

    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const ownerSubject = `Payment Failed: ${formattedAmount} - ${escapeHtml(payment.customer_name)}`;
    const ownerHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: #fff; margin: 0; font-size: 28px;">Payment Failed</h1>
    </div>
    <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
      <div style="background: #f8d7da; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #721c24;"><strong>A payment attempt has failed and requires attention.</strong></p>
      </div>
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #dc3545; margin-top: 0;">Payment Details</h2>
        <p><strong>Amount:</strong> ${formattedAmount}</p>
        <p><strong>Customer:</strong> ${escapeHtml(payment.customer_name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(payment.customer_email)}</p>
        <p><strong>Time:</strong> ${timestamp}</p>
        ${payment.idempotency_key ? `<p><strong>Reference ID:</strong> <code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px;">${escapeHtml(payment.idempotency_key)}</code></p>` : ''}
      </div>
      <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #856404; margin-top: 0;">Error Message</h3>
        <div style="background: #fff; padding: 15px; border-left: 3px solid #ffc107; margin: 10px 0;">
          <code style="word-break: break-all;">${escapeHtml(payment.error_message)}</code>
        </div>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${FRONTEND_URL}/owner-dashboard" style="background: #dc3545; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          View Dashboard
        </a>
      </div>
      <p style="font-size: 12px; color: #666; text-align: center; margin-top: 20px;">
        This payment has been logged to the failed_payments table for review.
      </p>
    </div>
  </body>
</html>
`;

    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: OWNER_EMAIL,
      subject: ownerSubject,
      html: ownerHtml,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Failed payment notification sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-failed-payment-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
