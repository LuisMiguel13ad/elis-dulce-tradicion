import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
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
}

interface OrderIssue {
    id: number;
    order_id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    issue_category: string;
    issue_description: string;
    photo_urls?: string[];
    priority: string;
    created_at: string;
}

Deno.serve(async (req) => {
    // Handle CORS preflight request
             if (req.method === 'OPTIONS') {
                   return new Response('ok', { headers: corsHeaders })
             }

             try {
                   if (!RESEND_API_KEY) {
                           throw new Error("RESEND_API_KEY is not set");
                   }

      const { issue } = await req.json() as { issue: OrderIssue };

      if (!issue || !issue.customer_email) {
              return new Response(
                        JSON.stringify({ error: "Issue data and customer email are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                      );
      }

      const resend = new Resend(RESEND_API_KEY);

      // Priority badge color
      const priorityColors: Record<string, string> = {
              low: '#28a745',
              medium: '#ffc107',
              high: '#fd7e14',
              urgent: '#dc3545',
      };

      // 1. Send notification to owner
      const ownerSubject = `🚨 Order Issue Reported: ${issue.order_number} - ${issue.issue_category}`;
                   const ownerHtml = `
                         <!DOCTYPE html>
                               <html>
                                     <head>
                                             <meta charset="utf-8">
                                                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                                           </head>
                                                                 <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                                                                         <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                                                                                   <h1 style="color: #fff; margin: 0; font-size: 28px;">🚨 Order Issue Reported</h1>
                                                                                           </div>
                                                                                                   <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                                                                                                             <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px;">
                                                                                                                         <p style="margin: 0;"><strong>Priority:</strong> <span style="background: ${priorityColors[issue.priority] || '#6c757d'}; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">${issue.priority}</span></p>
                                                                                                                                   </div>
                                                                                                                                             <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                                                                                                                                         <h2 style="color: #dc3545; margin-top: 0;">Issue Details</h2>
                                                                                                                                                                     <p><strong>Order Number:</strong> ${issue.order_number}</p>
                                                                                                                                                                                 <p><strong>Customer:</strong> ${issue.customer_name}</p>
                                                                                                                                                                                             <p><strong>Email:</strong> ${issue.customer_email}</p>
                                                                                                                                                                                                         ${issue.customer_phone ? `<p><strong>Phone:</strong> ${issue.customer_phone}</p>` : ''}
                                                                                                                                                                                                                     <p><strong>Category:</strong> ${issue.issue_category}</p>
                                                                                                                                                                                                                                 <p><strong>Description:</strong></p>
                                                                                                                                                                                                                                             <div style="background: #fff; padding: 15px; border-left: 3px solid #dc3545; margin: 10px 0;">
                                                                                                                                                                                                                                                           ${issue.issue_description.replace(/\n/g, '<br>')}
                                                                                                                                                                                                                                                                       </div>
                                                                                                                                                                                                                                                                                   ${issue.photo_urls && issue.photo_urls.length > 0 ? `
                                                                                                                                                                                                                                                                                                 <p><strong>Photos:</strong></p>
                                                                                                                                                                                                                                                                                                               <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                                                                                                                                                                                                                                                                                                               ${issue.photo_urls.map(url => `<a href="${url}" style="display: inline-block;"><img src="${url}" style="max-width: 100px; max-height: 100px; border-radius: 4px; border: 1px solid #ddd;" /></a>`).join('')}
                                                                                                                                                                                                                                                                                                                                             </div>
                                                                                                                                                                                                                                                                                                                                                         ` : ''}
                                                                                                                                                                                                                                                                                                                                                                     <p><strong>Reported:</strong> ${new Date(issue.created_at).toLocaleString()}</p>
                                                                                                                                                                                                                                                                                                                                                                               </div>
                                                                                                                                                                                                                                                                                                                                                                                         <div style="text-align: center; margin: 30px 0;">
                                                                                                                                                                                                                                                                                                                                                                                                     <a href="${FRONTEND_URL}/owner-dashboard" style="background: #dc3545; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
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

      // 2. Send confirmation to customer
      const customerSubject = `We've received your issue report - Order ${issue.order_number}`;
                   const customerHtml = `
                         <!DOCTYPE html>
                               <html>
                                     <head>
                                             <meta charset="utf-8">
                                                     <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                                           </head>
                                                                 <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                                                                         <div style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                                                                                   <h1 style="color: #fff; margin: 0; font-size: 28px;">📋 Issue Report Received</h1>
                                                                                           </div>
                                                                                                   <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                                                                                                             <p style="font-size: 16px;">Dear ${issue.customer_name},</p>
                                                                                                                       <p style="font-size: 16px;">We've received your issue report regarding order <strong>${issue.order_number}</strong>. We take all customer concerns seriously and will investigate this matter promptly.</p>
                                                                                                                                 <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                                                                                                                             <p style="margin: 0 0 10px 0;"><strong>Issue Category:</strong> ${issue.issue_category}</p>
                                                                                                                                                         <p style="margin: 0;"><strong>Your Description:</strong></p>
                                                                                                                                                                     <p style="margin: 5px 0 0 0;">${issue.issue_description}</p>
                                                                                                                                                                               </div>
                                                                                                                                                                                         <p style="font-size: 14px; color: #666;">Our team will review your report and contact you within 24 hours to discuss the next steps and resolution.</p>
                                                                                                                                                                                                   <div style="text-align: center; margin: 30px 0;">
                                                                                                                                                                                                               <a href="${FRONTEND_URL}/order-tracking?orderNumber=${issue.order_number}" style="background: #d4af37; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                                                                                                                                                                                                             Track Your Order
                                                                                                                                                                                                                                         </a>
                                                                                                                                                                                                                                                   </div>
                                                                                                                                                                                                                                                             <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                                                                                                                                                                                                                                                                       <p style="font-size: 14px; color: #666;">
                                                                                                                                                                                                                                                                                   <strong>Contact Us:</strong><br>
                                                                                                                                                                                                                                                                                               📞 Phone: (610) 279-6200<br>
                                                                                                                                                                                                                                                                                                           📧 Email: ${FROM_EMAIL}<br>
                                                                                                                                                                                                                                                                                                                       🌐 Website: ${FRONTEND_URL}
                                                                                                                                                                                                                                                                                                                                 </p>
                                                                                                                                                                                                                                                                                                                                         </div>
                                                                                                                                                                                                                                                                                                                                               </body>
                                                                                                                                                                                                                                                                                                                                                     </html>
                                                                                                                                                                                                                                                                                                                                                         `;

      await resend.emails.send({
              from: `${FROM_NAME} <${FROM_EMAIL}>`,
              to: issue.customer_email,
              subject: customerSubject,
              html: customerHtml,
      });

      return new Response(
              JSON.stringify({ success: true, message: "Notifications sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
             } catch (error) {
                   console.error("Error in send-order-issue-notification:", error);
                   return new Response(
                           JSON.stringify({ error: error.message }),
                     { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                         );
             }
});
