import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@^4.0.0";

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

Deno.serve(async (req) => {
  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const { order } = await req.json() as { order: ReadyNotificationData };

    if (!order || !order.customer_email) {
      return new Response(
        JSON.stringify({ error: "Order data and customer email are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const isSpanish = order.customer_language === 'es' || order.customer_language === 'spanish';

    const trackingUrl = `${FRONTEND_URL}/order-tracking?orderNumber=${order.order_number}`;

    const subject = isSpanish
      ? `¡Tu Pedido #${order.order_number} Está Listo! - Eli's Bakery`
      : `Your Order #${order.order_number} is Ready! - Eli's Bakery`;

    const htmlContent = isSpanish
      ? generateSpanishReadyEmail(order, trackingUrl)
      : generateEnglishReadyEmail(order, trackingUrl);

    const textContent = isSpanish
      ? generateSpanishReadyText(order, trackingUrl)
      : generateEnglishReadyText(order, trackingUrl);

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
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-ready-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

function generateEnglishReadyEmail(order: ReadyNotificationData, trackingUrl: string): string {
  const isDelivery = order.delivery_option === 'delivery';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #fff; margin: 0; font-size: 32px;">🎉 Your Order is Ready!</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; font-weight: bold;">Dear ${order.customer_name},</p>
    
    <p style="font-size: 16px;">Great news! Your custom cake order is ready!</p>
    
    <div style="background: #f0f9ff; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <h2 style="color: #28a745; margin-top: 0;">${isDelivery ? '🚗 Delivery Information' : '📍 Pickup Information'}</h2>
      <p><strong>Order Number:</strong> ${order.order_number}</p>
      ${isDelivery ? `
        <p><strong>Delivery Address:</strong> ${order.delivery_address}${order.delivery_apartment ? `, ${order.delivery_apartment}` : ''}</p>
        <p style="color: #666; font-size: 14px;">Your order will be delivered soon. Please ensure someone is available to receive it.</p>
      ` : `
        <p style="color: #666; font-size: 14px;">You can pick up your order at our bakery location. Please bring a valid ID.</p>
        <p><strong>Pickup Location:</strong><br>
        Eli's Bakery<br>
        [Your Address Here]<br>
        Phone: (610) 910-9067</p>
      `}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${trackingUrl}" style="background: #28a745; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        View Order Details
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      <strong>Questions?</strong> Contact us at (610) 910-9067 or orders@elisbakery.com
    </p>
    
    <p style="font-size: 16px; font-weight: bold; color: #28a745; text-align: center; margin-top: 30px;">
      Thank you for choosing Eli's Bakery! 🎂
    </p>
  </div>
</body>
</html>
  `;
}

function generateSpanishReadyEmail(order: ReadyNotificationData, trackingUrl: string): string {
  const isDelivery = order.delivery_option === 'delivery';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #fff; margin: 0; font-size: 32px;">🎉 ¡Tu Pedido Está Listo!</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; font-weight: bold;">Estimado/a ${order.customer_name},</p>
    
    <p style="font-size: 16px;">¡Buenas noticias! ¡Tu pedido de pastel personalizado está listo!</p>
    
    <div style="background: #f0f9ff; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <h2 style="color: #28a745; margin-top: 0;">${isDelivery ? '🚗 Información de Entrega' : '📍 Información de Recogida'}</h2>
      <p><strong>Número de Orden:</strong> ${order.order_number}</p>
      ${isDelivery ? `
        <p><strong>Dirección de Entrega:</strong> ${order.delivery_address}${order.delivery_apartment ? `, ${order.delivery_apartment}` : ''}</p>
        <p style="color: #666; font-size: 14px;">Tu pedido será entregado pronto. Por favor asegúrate de que haya alguien disponible para recibirlo.</p>
      ` : `
        <p style="color: #666; font-size: 14px;">Puedes recoger tu pedido en nuestra panadería. Por favor trae una identificación válida.</p>
        <p><strong>Ubicación de Recogida:</strong><br>
        Eli's Bakery<br>
        [Tu Dirección Aquí]<br>
        Teléfono: (610) 910-9067</p>
      `}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${trackingUrl}" style="background: #28a745; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Ver Detalles del Pedido
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      <strong>¿Preguntas?</strong> Contáctanos al (610) 910-9067 o orders@elisbakery.com
    </p>
    
    <p style="font-size: 16px; font-weight: bold; color: #28a745; text-align: center; margin-top: 30px;">
      ¡Gracias por elegir Eli's Bakery! 🎂
    </p>
  </div>
</body>
</html>
  `;
}

function generateEnglishReadyText(order: ReadyNotificationData, trackingUrl: string): string {
  const isDelivery = order.delivery_option === 'delivery';
  
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
- Location: [Your Address Here]
- Phone: (610) 910-9067
`}

View order details: ${trackingUrl}

Questions? Contact us at (610) 910-9067 or orders@elisbakery.com

Thank you for choosing Eli's Bakery! 🎂
  `;
}

function generateSpanishReadyText(order: ReadyNotificationData, trackingUrl: string): string {
  const isDelivery = order.delivery_option === 'delivery';
  
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
- Ubicación: [Tu Dirección Aquí]
- Teléfono: (610) 910-9067
`}

Ver detalles del pedido: ${trackingUrl}

¿Preguntas? Contáctanos al (610) 910-9067 o orders@elisbakery.com

¡Gracias por elegir Eli's Bakery! 🎂
  `;
}
