import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@^4.0.0";
import {
  formatDate,
  getBusinessInfo,
  OrderData
} from "../_shared/emailTemplates.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://elisbakery.com";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "orders@elisbakery.com";
const FROM_NAME = Deno.env.get("FROM_NAME") || "Eli's Bakery";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// XSS Protection: Escape HTML special characters to prevent script injection
function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

    const { order } = await req.json() as { order: OrderData };

    if (!order || !order.customer_email) {
      return new Response(
        JSON.stringify({ error: "Order data and customer email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const isSpanish = order.customer_language === 'es' || order.customer_language === 'spanish';

    // Generate tracking URL
    const trackingUrl = `${FRONTEND_URL}/order-tracking?orderNumber=${encodeURIComponent(order.order_number)}`;

    // Email content based on language
    const subject = isSpanish
      ? `Confirmacion de Pedido #${escapeHtml(order.order_number)} - Eli's Bakery`
      : `Order Confirmation #${escapeHtml(order.order_number)} - Eli's Bakery`;

    const htmlContent = generateConfirmationEmail(order, trackingUrl, isSpanish);
    const textContent = generateConfirmationText(order, trackingUrl, isSpanish);

    // Send email
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: order.customer_email,
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-order-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateConfirmationEmail(order: OrderData, trackingUrl: string, isSpanish: boolean): string {
  const biz = getBusinessInfo(isSpanish ? 'es' : 'en');
  const lang = isSpanish ? 'es' : 'en';

  // Sanitize all user-provided fields to prevent XSS
  const safeName = escapeHtml(order.customer_name);
  const safeOrderNumber = escapeHtml(order.order_number);
  const safeCakeSize = escapeHtml(order.cake_size);
  const safeFilling = escapeHtml(order.filling);
  const safeTheme = escapeHtml(order.theme);
  const safeDedication = escapeHtml(order.dedication);
  const safeDeliveryAddress = escapeHtml(order.delivery_address);
  const safeDeliveryApartment = escapeHtml(order.delivery_apartment);

  // Localized strings
  const labels = {
    title: isSpanish ? 'Pedido Confirmado!' : 'Order Confirmed!',
    greeting: isSpanish ? 'Estimado/a' : 'Dear',
    intro: isSpanish
      ? 'Gracias por tu pedido! Estamos emocionados de crear tu pastel personalizado.'
      : "Thank you for your order! We're excited to create your custom cake.",
    detailsHeader: isSpanish ? 'Detalles del Pedido' : 'Order Details',
    orderNumber: isSpanish ? 'Numero de Orden:' : 'Order Number:',
    dateNeeded: isSpanish ? 'Fecha Necesaria:' : 'Date Needed:',
    at: isSpanish ? 'a las' : 'at',
    size: isSpanish ? 'Tamano:' : 'Cake Size:',
    filling: isSpanish ? 'Relleno:' : 'Filling:',
    theme: isSpanish ? 'Tema:' : 'Theme:',
    dedication: isSpanish ? 'Dedicatoria:' : 'Dedication:',
    delivery: isSpanish ? 'Entrega:' : 'Delivery:',
    deliveryHome: isSpanish ? 'Entrega a Domicilio' : 'Home Delivery',
    deliveryPickup: isSpanish ? 'Recoger' : 'Pickup',
    address: isSpanish ? 'Direccion de Entrega:' : 'Delivery Address:',
    total: 'Total:',
    trackBtn: isSpanish ? 'Rastrear Tu Pedido' : 'Track Your Order',
    notify: isSpanish
      ? 'Te notificaremos cuando tu pedido este listo. Puedes rastrear el estado de tu pedido usando el enlace de arriba.'
      : "We'll notify you when your order is ready. You can track your order status using the link above.",
    contactTitle: isSpanish ? 'Contactanos:' : 'Contact Us:',
    phone: isSpanish ? 'Telefono:' : 'Phone:',
    website: isSpanish ? 'Sitio Web:' : 'Website:'
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #fff; margin: 0; font-size: 28px;">🎂 ${labels.title}</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">${labels.greeting} ${escapeHtml(order.customer_name)},</p>
    
    <p style="font-size: 16px;">${labels.intro}</p>
    
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="color: #d4af37; margin-top: 0;">${labels.detailsHeader}</h2>
      <p><strong>${labels.orderNumber}</strong> ${order.order_number}</p>
      <p><strong>${labels.dateNeeded}</strong> ${formatDate(order.date_needed, lang)} ${labels.at} ${order.time_needed}</p>
      <p><strong>${labels.size}</strong> ${order.cake_size}</p>
      <p><strong>${labels.filling}</strong> ${order.filling}</p>
      <p><strong>${labels.theme}</strong> ${escapeHtml(order.theme)}</p>
      ${order.dedication ? `<p><strong>${labels.dedication}</strong> "${escapeHtml(order.dedication)}"</p>` : ''}
      <p><strong>${labels.delivery}</strong> ${order.delivery_option === 'delivery' ? labels.deliveryHome : labels.deliveryPickup}</p>
      ${order.delivery_address ? `<p><strong>${labels.address}</strong> ${escapeHtml(order.delivery_address)}${order.delivery_apartment ? `, ${escapeHtml(order.delivery_apartment)}` : ''}</p>` : ''}
      <p style="font-size: 20px; font-weight: bold; color: #d4af37; margin-top: 15px;">
        ${labels.total} $${order.total_amount.toFixed(2)}
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${trackingUrl}" style="background: #d4af37; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        ${labels.trackBtn}
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">${labels.notify}</p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #666;">
      <strong>${labels.contactTitle}</strong><br>
      📞 ${labels.phone} ${biz.phone}<br>
      📧 Email: ${biz.email}<br>
      🌐 ${labels.website} ${biz.website}
    </p>
  </div>
</body>
</html>
  `;
}

function generateConfirmationText(order: OrderData, trackingUrl: string, isSpanish: boolean): string {
  const biz = getBusinessInfo(isSpanish ? 'es' : 'en');
  const lang = isSpanish ? 'es' : 'en';

  // Plain text doesn't need HTML escaping but we sanitize for consistency
  const safeName = order.customer_name || '';
  const safeOrderNumber = order.order_number || '';
  const safeCakeSize = order.cake_size || '';
  const safeFilling = order.filling || '';
  const safeTheme = order.theme || '';
  const safeDedication = order.dedication || '';
  const safeDeliveryAddress = order.delivery_address || '';
  const safeDeliveryApartment = order.delivery_apartment || '';

  if (isSpanish) {
    return `
        Pedido Confirmado!

        Estimado/a ${safeName},

        Gracias por tu pedido! Estamos emocionados de crear tu pastel personalizado.

        Detalles del Pedido:
        - Numero de Orden: ${safeOrderNumber}
        - Fecha Necesaria: ${formatDate(order.date_needed, lang)} a las ${order.time_needed}
        - Tamano: ${safeCakeSize}
        - Relleno: ${safeFilling}
        - Tema: ${safeTheme}
        ${safeDedication ? `- Dedicatoria: "${safeDedication}"\n` : ''}- Entrega: ${order.delivery_option === 'delivery' ? 'Entrega a Domicilio' : 'Recoger'}
        ${safeDeliveryAddress ? `- Direccion de Entrega: ${safeDeliveryAddress}${safeDeliveryApartment ? `, ${safeDeliveryApartment}` : ''}\n` : ''}- Total: $${order.total_amount.toFixed(2)}

        Rastrear tu pedido: ${trackingUrl}

        Te notificaremos cuando tu pedido este listo.

        Contactanos:
        Telefono: ${biz.phone}
        Email: ${biz.email}
        Sitio Web: ${biz.website}
        `;
  }

  return `
  Order Confirmed!

  Dear ${safeName},

  Thank you for your order! We're excited to create your custom cake.

  Order Details:
  - Order Number: ${safeOrderNumber}
  - Date Needed: ${formatDate(order.date_needed, lang)} at ${order.time_needed}
  - Cake Size: ${safeCakeSize}
  - Filling: ${safeFilling}
  - Theme: ${safeTheme}
  ${safeDedication ? `- Dedication: "${safeDedication}"\n` : ''}- Delivery: ${order.delivery_option === 'delivery' ? 'Home Delivery' : 'Pickup'}
  ${safeDeliveryAddress ? `- Delivery Address: ${safeDeliveryAddress}${safeDeliveryApartment ? `, ${safeDeliveryApartment}` : ''}\n` : ''}- Total: $${order.total_amount.toFixed(2)}

  Track your order: ${trackingUrl}

  We'll notify you when your order is ready.

  Contact Us:
  Phone: ${biz.phone}
  Email: ${biz.email}
  Website: ${biz.website}
  `;
}
