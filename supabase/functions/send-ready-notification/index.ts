import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@^4.0.0";
import { getBusinessInfo } from "../_shared/emailTemplates.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://elisbakery.com";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "orders@elisbakery.com";
const FROM_NAME = Deno.env.get("FROM_NAME") || "Eli's Bakery";

interface ReadyNotificationData {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_language?: string;
  date_needed: string;
  time_needed: string;
  delivery_option: string;
  delivery_address?: string;
  delivery_apartment?: string;
  total_amount: number;
}

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

    const { order } = await req.json() as { order: ReadyNotificationData };

    if (!order || !order.customer_email) {
      return new Response(
        JSON.stringify({ error: "Order data and customer email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const isSpanish = order.customer_language === 'es' || order.customer_language === 'spanish';

    const trackingUrl = `${FRONTEND_URL}/order-tracking?orderNumber=${order.order_number}`;

    const subject = isSpanish
      ? `¡Tu Pedido #${order.order_number} Está Listo! - Eli's Bakery`
      : `Your Order #${order.order_number} is Ready! - Eli's Bakery`;

    const htmlContent = generateReadyEmail(order, trackingUrl, isSpanish);
    const textContent = generateReadyText(order, trackingUrl, isSpanish);

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
    console.error("Error in send-ready-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateReadyEmail(order: ReadyNotificationData, trackingUrl: string, isSpanish: boolean): string {
  const isDelivery = order.delivery_option === 'delivery';
  const biz = getBusinessInfo(isSpanish ? 'es' : 'en');

  const labels = {
    title: isSpanish ? '¡Tu Pedido Está Listo!' : 'Your Order is Ready!',
    greeting: isSpanish ? 'Estimado/a' : 'Dear',
    intro: isSpanish ? '¡Buenas noticias! ¡Tu pedido de pastel personalizado está listo!' : 'Great news! Your custom cake order is ready!',
    deliveryInfo: isSpanish ? 'Información de Entrega' : 'Delivery Information',
    pickupInfo: isSpanish ? 'Información de Recogida' : 'Pickup Information',
    orderNumber: isSpanish ? 'Número de Orden:' : 'Order Number:',
    deliveryAddress: isSpanish ? 'Dirección de Entrega:' : 'Delivery Address:',
    deliveryNote: isSpanish ? 'Tu pedido será entregado pronto. Por favor asegúrate de que haya alguien disponible para recibirlo.' : 'Your order will be delivered soon. Please ensure someone is available to receive it.',
    pickupNote: isSpanish ? 'Puedes recoger tu pedido en nuestra panadería. Por favor trae una identificación válida.' : 'You can pick up your order at our bakery location. Please bring a valid ID.',
    pickupLocation: isSpanish ? 'Ubicación de Recogida:' : 'Pickup Location:',
    phone: isSpanish ? 'Teléfono:' : 'Phone:',
    viewDetails: isSpanish ? 'Ver Detalles del Pedido' : 'View Order Details',
    questions: isSpanish ? '¿Preguntas?' : 'Questions?',
    contactUs: isSpanish ? 'Contáctanos al' : 'Contact us at',
    or: isSpanish ? 'o' : 'or',
    thanks: isSpanish ? "¡Gracias por elegir Eli's Bakery!" : "Thank you for choosing Eli's Bakery!"
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #fff; margin: 0; font-size: 32px;">🎉 ${labels.title}</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; font-weight: bold;">${labels.greeting} ${order.customer_name},</p>
    
    <p style="font-size: 16px;">${labels.intro}</p>
    
    <div style="background: #f0f9ff; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <h2 style="color: #28a745; margin-top: 0;">${isDelivery ? `🚗 ${labels.deliveryInfo}` : `📍 ${labels.pickupInfo}`}</h2>
      <p><strong>${labels.orderNumber}</strong> ${order.order_number}</p>
      ${isDelivery ? `
        <p><strong>${labels.deliveryAddress}</strong> ${order.delivery_address}${order.delivery_apartment ? `, ${order.delivery_apartment}` : ''}</p>
        <p style="color: #666; font-size: 14px;">${labels.deliveryNote}</p>
      ` : `
        <p style="color: #666; font-size: 14px;">${labels.pickupNote}</p>
        <p><strong>${labels.pickupLocation}</strong><br>
        Eli's Bakery<br>
        324 W Marshall St, Norristown, PA 19401<br>
        ${labels.phone} ${biz.phone}</p>
      `}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${trackingUrl}" style="background: #28a745; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        ${labels.viewDetails}
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      <strong>${labels.questions}</strong> ${labels.contactUs} ${biz.phone} ${labels.or} ${biz.email}
    </p>
    
    <p style="font-size: 16px; font-weight: bold; color: #28a745; text-align: center; margin-top: 30px;">
      ${labels.thanks} 🎂
    </p>
  </div>
</body>
</html>
  `;
}

function generateReadyText(order: ReadyNotificationData, trackingUrl: string, isSpanish: boolean): string {
  const isDelivery = order.delivery_option === 'delivery';
  const biz = getBusinessInfo(isSpanish ? 'es' : 'en');

  if (isSpanish) {
    return `
¡Tu Pedido Está Listo!

Estimado/a ${order.customer_name},

¡Buenas noticias! ¡Tu pedido de pastel personalizado está listo!

Número de Orden: ${order.order_number}

${isDelivery ? `
Información de Entrega:
- Dirección de Entrega: ${order.delivery_address}${order.delivery_apartment ? `, ${order.delivery_apartment}` : ''}
- Tu pedido será entregado pronto. Por favor asegúrate de que haya alguien disponible para recibirlo.
` : `
Información de Recogida:
- Puedes recoger tu pedido en nuestra panadería
- Por favor trae una identificación válida
- Ubicación: 324 W Marshall St, Norristown, PA 19401
- Teléfono: ${biz.phone}
`}

Ver detalles del pedido: ${trackingUrl}

¿Preguntas? Contáctanos al ${biz.phone} o ${biz.email}

¡Gracias por elegir Eli's Bakery! 🎂
    `;
  }

  return `
Your Order is Ready!

Dear ${order.customer_name},

Great news! Your custom cake order is ready!

Order Number: ${order.order_number}

${isDelivery ? `
Delivery Information:
- Delivery Address: ${order.delivery_address}${order.delivery_apartment ? `, ${order.delivery_apartment}` : ''}
- Your order will be delivered soon. Please ensure someone is available to receive it.
` : `
Pickup Information:
- You can pick up your order at our bakery location
- Please bring a valid ID
- Location: 324 W Marshall St, Norristown, PA 19401
- Phone: ${biz.phone}
`}

View order details: ${trackingUrl}

Questions? Contact us at ${biz.phone} or ${biz.email}

Thank you for choosing Eli's Bakery! 🎂
  `;
}
