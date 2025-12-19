import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@^4.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://elisbakery.com";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "orders@elisbakery.com";
const FROM_NAME = Deno.env.get("FROM_NAME") || "Eli's Bakery";
const OWNER_EMAIL = Deno.env.get("OWNER_EMAIL") || "owner@elisbakery.com";

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  attachment_url?: string;
  order_number?: string;
  created_at: string;
}

Deno.serve(async (req) => {
  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const { submission } = await req.json() as { submission: ContactSubmission };

    if (!submission || !submission.email) {
      return new Response(
        JSON.stringify({ error: "Submission data and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);

    // 1. Send notification to owner
    const ownerSubject = `New Contact Form Submission: ${submission.subject}`;
    const ownerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #fff; margin: 0; font-size: 28px;">📧 New Contact Form Submission</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="color: #d4af37; margin-top: 0;">Submission Details</h2>
      <p><strong>Name:</strong> ${submission.name}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      ${submission.phone ? `<p><strong>Phone:</strong> ${submission.phone}</p>` : ''}
      <p><strong>Subject:</strong> ${submission.subject}</p>
      ${submission.order_number ? `<p><strong>Order Number:</strong> ${submission.order_number}</p>` : ''}
      <p><strong>Message:</strong></p>
      <div style="background: #fff; padding: 15px; border-left: 3px solid #d4af37; margin: 10px 0;">
        ${submission.message.replace(/\n/g, '<br>')}
      </div>
      ${submission.attachment_url ? `<p><strong>Attachment:</strong> <a href="${submission.attachment_url}">View Attachment</a></p>` : ''}
      <p><strong>Submitted:</strong> ${new Date(submission.created_at).toLocaleString()}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${FRONTEND_URL}/owner-dashboard" style="background: #d4af37; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        View in Dashboard
      </a>
    </div>
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

    // 2. Send auto-reply to customer
    const customerSubject = `Thank you for contacting ${FROM_NAME}`;
    const customerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #fff; margin: 0; font-size: 28px;">🎂 Thank You for Contacting Us!</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${submission.name},</p>
    
    <p style="font-size: 16px;">Thank you for reaching out to us! We've received your message and will get back to you as soon as possible.</p>
    
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Your Message:</strong></p>
      <p style="margin: 5px 0 0 0;">${submission.subject}</p>
    </div>
    
    <p style="font-size: 14px; color: #666;">We typically respond within 24 hours during business hours.</p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #666;">
      <strong>Contact Us:</strong><br>
      📞 Phone: (610) 910-9067<br>
      📧 Email: ${FROM_EMAIL}<br>
      🌐 Website: ${FRONTEND_URL}
    </p>
  </div>
</body>
</html>
    `;

    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: submission.email,
      subject: customerSubject,
      html: customerHtml,
    });

    return new Response(
      JSON.stringify({ success: true, message: "Notifications sent" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-contact-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

