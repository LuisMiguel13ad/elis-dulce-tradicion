import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@^4.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://elisbakery.com";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "orders@elisbakery.com";
const FROM_NAME = Deno.env.get("FROM_NAME") || "Eli's Bakery";

interface OrderData {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_language?: string;
  date_needed: string;
  time_needed: string;
  cake_size: string;
  filling: string;
  theme: string;
  dedication?: string;
  delivery_option: string;
  delivery_address?: string;
  delivery_apartment?: string;
  total_amount: number;
  reference_image_path?: string;
}

Deno.serve(async (req) => {
  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const { order } = await req.json() as { order: OrderData };

    if (!order || !order.customer_email) {
      return new Response(
        JSON.stringify({ error: "Order data and customer email are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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

    const htmlContent = isSpanish
      ? generateSpanishConfirmationEmail(order, trackingUrl)
      : generateEnglishConfirmationEmail(order, trackingUrl);

    const textContent = isSpanish
      ? generateSpanishConfirmationText(order, trackingUrl)
      : generateEnglishConfirmationText(order, trackingUrl);

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
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-order-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

function generateEnglishConfirmationEmail(order: OrderData, trackingUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #fff; margin: 0; font-size: 28px;">🎂 Order Confirmed!</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${order.customer_name},</p>
    
    <p style="font-size: 16px;">Thank you for your order! We're excited to create your custom cake.</p>
    
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="color: #d4af37; margin-top: 0;">Order Details</h2>
      <p><strong>Order Number:</strong> ${order.order_number}</p>
      <p><strong>Date Needed:</strong> ${formatDate(order.date_needed)} at ${order.time_needed}</p>
      <p><strong>Cake Size:</strong> ${order.cake_size}</p>
      <p><strong>Filling:</strong> ${order.filling}</p>
      <p><strong>Theme:</strong> ${order.theme}</p>
      ${order.dedication ? `<p><strong>Dedication:</strong> "${order.dedication}"</p>` : ''}
      <p><strong>Delivery:</strong> ${order.delivery_option === 'delivery' ? 'Home Delivery' : 'Pickup'}</p>
      ${order.delivery_address ? `<p><strong>Delivery Address:</strong> ${order.delivery_address}${order.delivery_apartment ? `, ${order.delivery_apartment}` : ''}</p>` : ''}
      <p style="font-size: 20px; font-weight: bold; color: #d4af37; margin-top: 15px;">
        Total: $${order.total_amount.toFixed(2)}
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${trackingUrl}" style="background: #d4af37; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Track Your Order
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">We'll notify you when your order is ready. You can track your order status using the link above.</p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #666;">
      <strong>Contact Us:</strong><br>
      📞 Phone: (610) 279-6200<br>
      📧 Email: orders@elisbakery.com<br>
      🌐 Website: ${FRONTEND_URL}
    </p>
  </div>
</body>
</html>
  `;
}

function generateSpanishConfirmationEmail(order: OrderData, trackingUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #fff; margin: 0; font-size: 28px;">🎂 ¡Pedido Confirmado!</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Estimado/a ${order.customer_name},</p>
    
    <p style="font-size: 16px;">¡Gracias por tu pedido! Estamos emocionados de crear tu pastel personalizado.</p>
    
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="color: #d4af37; margin-top: 0;">Detalles del Pedido</h2>
      <p><strong>Número de Orden:</strong> ${order.order_number}</p>
      <p><strong>Fecha Necesaria:</strong> ${formatDate(order.date_needed)} a las ${order.time_needed}</p>
      <p><strong>Tamaño:</strong> ${order.cake_size}</p>
      <p><strong>Relleno:</strong> ${order.filling}</p>
      <p><strong>Tema:</strong> ${order.theme}</p>
      ${order.dedication ? `<p><strong>Dedicatoria:</strong> "${order.dedication}"</p>` : ''}
      <p><strong>Entrega:</strong> ${order.delivery_option === 'delivery' ? 'Entrega a Domicilio' : 'Recoger'}</p>
      ${order.delivery_address ? `<p><strong>Dirección de Entrega:</strong> ${order.delivery_address}${order.delivery_apartment ? `, ${order.delivery_apartment}` : ''}</p>` : ''}
      <p style="font-size: 20px; font-weight: bold; color: #d4af37; margin-top: 15px;">
        Total: $${order.total_amount.toFixed(2)}
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${trackingUrl}" style="background: #d4af37; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Rastrear Tu Pedido
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">Te notificaremos cuando tu pedido esté listo. Puedes rastrear el estado de tu pedido usando el enlace de arriba.</p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="font-size: 14px; color: #666;">
      <strong>Contáctanos:</strong><br>
      📞 Teléfono: (610) 279-6200<br>
      📧 Email: orders@elisbakery.com<br>
      🌐 Sitio Web: ${FRONTEND_URL}
    </p>
  </div>
</body>
</html>
  `;
}

function generateEnglishConfirmationText(order: OrderData, trackingUrl: string): string {
  return `
Order Confirmed!

Dear ${order.customer_name},

Thank you for your order! We're excited to create your custom cake.

Order Details:
- Order Number: ${order.order_number}
- Date Needed: ${formatDate(order.date_needed)} at ${order.time_needed}
- Cake Size: ${order.cake_size}
- Filling: ${order.filling}
- Theme: ${order.theme}
${order.dedication ? `- Dedication: "${order.dedication}"\n` : ''}- Delivery: ${order.delivery_option === 'delivery' ? 'Home Delivery' : 'Pickup'}
${order.delivery_address ? `- Delivery Address: ${order.delivery_address}${order.delivery_apartment ? `, ${order.delivery_apartment}` : ''}\n` : ''}- Total: $${order.total_amount.toFixed(2)}

Track your order: ${trackingUrl}

We'll notify you when your order is ready.

Contact Us:
Phone: (610) 279-6200
Email: orders@elisbakery.com
Website: ${FRONTEND_URL}
  `;
}

function generateSpanishConfirmationText(order: OrderData, trackingUrl: string): string {
  return `
¡Pedido Confirmado!

Estimado/a ${order.customer_name},

¡Gracias por tu pedido! Estamos emocionados de crear tu pastel personalizado.

Detalles del Pedido:
- Número de Orden: ${order.order_number}
- Fecha Necesaria: ${formatDate(order.date_needed)} a las ${order.time_needed}
- Tamaño: ${order.cake_size}
- Relleno: ${order.filling}
- Tema: ${order.theme}
${order.dedication ? `- Dedicatoria: "${order.dedication}"\n` : ''}- Entrega: ${order.delivery_option === 'delivery' ? 'Entrega a Domicilio' : 'Recoger'}
${order.delivery_address ? `- Dirección de Entrega: ${order.delivery_address}${order.delivery_apartment ? `, ${order.delivery_apartment}` : ''}\n` : ''}- Total: $${order.total_amount.toFixed(2)}

Rastrear tu pedido: ${trackingUrl}

Te notificaremos cuando tu pedido esté listo.

Contáctanos:
Teléfono: (610) 279-6200
Email: orders@elisbakery.com
Sitio Web: ${FRONTEND_URL}
  `;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
}
