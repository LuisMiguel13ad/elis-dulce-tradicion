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
    const trackingUrl = `${FRONTEND_URL}/order-tracking?orderNumber=${order.order_number}`;

    // Email content based on language
    const subject = isSpanish
      ? `Confirmación de Pedido #${order.order_number} - Eli's Bakery`
      : `Order Confirmation #${order.order_number} - Eli's Bakery`;

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

  // Localized strings
  const labels = {
    title: isSpanish ? '¡Pedido Confirmado!' : 'Order Confirmed!',
    greeting: isSpanish ? 'Estimado/a' : 'Dear',
    intro: isSpanish
      ? '¡Gracias por tu pedido! Estamos emocionados de crear tu pastel personalizado.'
      : "Thank you for your order! We're excited to create your custom cake.",
    detailsHeader: isSpanish ? 'Detalles del Pedido' : 'Order Details',
    orderNumber: isSpanish ? 'Número de Orden:' : 'Order Number:',
    dateNeeded: isSpanish ? 'Fecha Necesaria:' : 'Date Needed:',
    at: isSpanish ? 'a las' : 'at',
    size: isSpanish ? 'Tamaño:' : 'Cake Size:',
    filling: isSpanish ? 'Relleno:' : 'Filling:',
    theme: isSpanish ? 'Tema:' : 'Theme:',
    dedication: isSpanish ? 'Dedicatoria:' : 'Dedication:',
    delivery: isSpanish ? 'Entrega:' : 'Delivery:',
    deliveryHome: isSpanish ? 'Entrega a Domicilio' : 'Home Delivery',
    deliveryPickup: isSpanish ? 'Recoger' : 'Pickup',
    address: isSpanish ? 'Dirección de Entrega:' : 'Delivery Address:',
    total: 'Total:',
    trackBtn: isSpanish ? 'Rastrear Tu Pedido' : 'Track Your Order',
    notify: isSpanish
      ? 'Te notificaremos cuando tu pedido esté listo. Puedes rastrear el estado de tu pedido usando el enlace de arriba.'
      : "We'll notify you when your order is ready. You can track your order status using the link above.",
    contactTitle: isSpanish ? 'Contáctanos:' : 'Contact Us:',
    phone: isSpanish ? 'Teléfono:' : 'Phone:',
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
    <p style="font-size: 16px;">${labels.greeting} ${order.customer_name},</p>
    
    <p style="font-size: 16px;">${labels.intro}</p>
    
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="color: #d4af37; margin-top: 0;">${labels.detailsHeader}</h2>
      <p><strong>${labels.orderNumber}</strong> ${order.order_number}</p>
      <p><strong>${labels.dateNeeded}</strong> ${formatDate(order.date_needed, lang)} ${labels.at} ${order.time_needed}</p>
      <p><strong>${labels.size}</strong> ${order.cake_size}</p>
      <p><strong>${labels.filling}</strong> ${order.filling}</p>
      <p><strong>${labels.theme}</strong> ${order.theme}</p>
      ${order.dedication ? `<p><strong>${labels.dedication}</strong> "${order.dedication}"</p>` : ''}
      <p><strong>${labels.delivery}</strong> ${order.delivery_option === 'delivery' ? labels.deliveryHome : labels.deliveryPickup}</p>
      ${order.delivery_address ? `<p><strong>${labels.address}</strong> ${order.delivery_address}${order.delivery_apartment ? `, ${order.delivery_apartment}` : ''}</p>` : ''}
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

  if (isSpanish) {
    return `
¡Pedido Confirmado!

Estimado/a ${order.customer_name},

¡Gracias por tu pedido! Estamos emocionados de crear tu pastel personalizado.

Detalles del Pedido:
- Número de Orden: ${order.order_number}
- Fecha Necesaria: ${formatDate(order.date_needed, lang)} a las ${order.time_needed}
- Tamaño: ${order.cake_size}
- Relleno: ${order.filling}
- Tema: ${order.theme}
${order.dedication ? `- Dedicatoria: "${order.dedication}"\n` : ''}- Entrega: ${order.delivery_option === 'delivery' ? 'Entrega a Domicilio' : 'Recoger'}
${order.delivery_address ? `- Dirección de Entrega: ${order.delivery_address}${order.delivery_apartment ? `, ${order.delivery_apartment}` : ''}\n` : ''}- Total: $${order.total_amount.toFixed(2)}

Rastrear tu pedido: ${trackingUrl}

Te notificaremos cuando tu pedido esté listo.

Contáctanos:
Teléfono: ${biz.phone}
Email: ${biz.email}
Sitio Web: ${biz.website}
    `;
  }

  return `
Order Confirmed!

Dear ${order.customer_name},

Thank you for your order! We're excited to create your custom cake.

Order Details:
- Order Number: ${order.order_number}
- Date Needed: ${formatDate(order.date_needed, lang)} at ${order.time_needed}
- Cake Size: ${order.cake_size}
- Filling: ${order.filling}
- Theme: ${order.theme}
${order.dedication ? `- Dedication: "${order.dedication}"\n` : ''}- Delivery: ${order.delivery_option === 'delivery' ? 'Home Delivery' : 'Pickup'}
${order.delivery_address ? `- Delivery Address: ${order.delivery_address}${order.delivery_apartment ? `, ${order.delivery_apartment}` : ''}\n` : ''}- Total: $${order.total_amount.toFixed(2)}

Track your order: ${trackingUrl}

We'll notify you when your order is ready.

Contact Us:
Phone: ${biz.phone}
Email: ${biz.email}
Website: ${biz.website}
  `;
}
