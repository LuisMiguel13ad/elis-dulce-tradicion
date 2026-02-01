import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@^4.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "https://elisbakery.com";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "orders@elisbakery.com";
const FROM_NAME = Deno.env.get("FROM_NAME") || "Eli's Bakery";

interface StatusUpdateData {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_language?: string;
  old_status: string;
  new_status: string;
  date_needed: string;
  time_needed: string;
  delivery_option: string;
  notes?: string;
}

Deno.serve(async (req) => {
  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const { order, oldStatus } = await req.json() as { order: StatusUpdateData; oldStatus?: string };

    if (!order || !order.customer_email) {
      return new Response(
        JSON.stringify({ error: "Order data and customer email are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const isSpanish = order.customer_language === 'es' || order.customer_language === 'spanish';

    // Skip email for certain status transitions
    if (order.new_status === 'pending' || order.new_status === oldStatus) {
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "Status doesn't require notification" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check email preferences (if profile exists)
    // Note: This requires querying the database, which we'll do if needed
    // For now, we'll send emails by default and add preference checking later

    const trackingUrl = `${FRONTEND_URL}/order-tracking?orderNumber=${order.order_number}`;

    const subject = isSpanish
      ? `Actualización de Pedido #${order.order_number} - Eli's Bakery`
      : `Order Update #${order.order_number} - Eli's Bakery`;

    const htmlContent = isSpanish
      ? generateSpanishStatusUpdateEmail(order, trackingUrl)
      : generateEnglishStatusUpdateEmail(order, trackingUrl);

    const textContent = isSpanish
      ? generateSpanishStatusUpdateText(order, trackingUrl)
      : generateEnglishStatusUpdateText(order, trackingUrl);

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
    console.error("Error in send-status-update:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

function generateEnglishStatusUpdateEmail(order: StatusUpdateData, trackingUrl: string): string {
  const statusMessages: Record<string, { title: string; message: string }> = {
    confirmed: {
      title: "Order Confirmed",
      message: "Your order has been confirmed and is now in our production queue."
    },
    in_progress: {
      title: "Order In Progress",
      message: "We've started preparing your cake! Our bakers are working on it now."
    },
    ready: {
      title: "Order Ready",
      message: order.delivery_option === 'delivery' 
        ? "Your order is ready and will be delivered soon!"
        : "Your order is ready for pickup!"
    },
    out_for_delivery: {
      title: "Out for Delivery",
      message: "Your order is on its way! It should arrive soon."
    },
    delivered: {
      title: "Order Delivered",
      message: "Your order has been delivered. Thank you for choosing Eli's Bakery!"
    },
    completed: {
      title: "Order Completed",
      message: "Your order has been completed. We hope you enjoyed your cake!"
    },
    cancelled: {
      title: "Order Cancelled",
      message: "Your order has been cancelled. If you have any questions, please contact us."
    }
  };

  const statusInfo = statusMessages[order.new_status] || {
    title: "Order Status Updated",
    message: `Your order status has been updated to: ${order.new_status}`
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
    <h1 style="color: #fff; margin: 0; font-size: 28px;">📦 ${statusInfo.title}</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear ${order.customer_name},</p>
    
    <p style="font-size: 16px;">${statusInfo.message}</p>
    
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Order Number:</strong> ${order.order_number}</p>
      <p><strong>Status:</strong> <span style="color: #d4af37; font-weight: bold;">${formatStatus(order.new_status)}</span></p>
      <p><strong>Date Needed:</strong> ${formatDate(order.date_needed)} at ${order.time_needed}</p>
      ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${trackingUrl}" style="background: #d4af37; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        View Order Details
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      <strong>Contact Us:</strong><br>
      📞 Phone: (610) 279-6200<br>
      📧 Email: orders@elisbakery.com
    </p>
  </div>
</body>
</html>
  `;
}

function generateSpanishStatusUpdateEmail(order: StatusUpdateData, trackingUrl: string): string {
  const statusMessages: Record<string, { title: string; message: string }> = {
    confirmed: {
      title: "Pedido Confirmado",
      message: "Tu pedido ha sido confirmado y está ahora en nuestra cola de producción."
    },
    in_progress: {
      title: "Pedido en Progreso",
      message: "¡Hemos comenzado a preparar tu pastel! Nuestros panaderos están trabajando en él ahora."
    },
    ready: {
      title: "Pedido Listo",
      message: order.delivery_option === 'delivery'
        ? "¡Tu pedido está listo y será entregado pronto!"
        : "¡Tu pedido está listo para recoger!"
    },
    out_for_delivery: {
      title: "En Camino",
      message: "¡Tu pedido está en camino! Debería llegar pronto."
    },
    delivered: {
      title: "Pedido Entregado",
      message: "Tu pedido ha sido entregado. ¡Gracias por elegir Eli's Bakery!"
    },
    completed: {
      title: "Pedido Completado",
      message: "Tu pedido ha sido completado. ¡Esperamos que hayas disfrutado tu pastel!"
    },
    cancelled: {
      title: "Pedido Cancelado",
      message: "Tu pedido ha sido cancelado. Si tienes alguna pregunta, por favor contáctanos."
    }
  };

  const statusInfo = statusMessages[order.new_status] || {
    title: "Estado del Pedido Actualizado",
    message: `El estado de tu pedido ha sido actualizado a: ${formatStatus(order.new_status, true)}`
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
    <h1 style="color: #fff; margin: 0; font-size: 28px;">📦 ${statusInfo.title}</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Estimado/a ${order.customer_name},</p>
    
    <p style="font-size: 16px;">${statusInfo.message}</p>
    
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Número de Orden:</strong> ${order.order_number}</p>
      <p><strong>Estado:</strong> <span style="color: #d4af37; font-weight: bold;">${formatStatus(order.new_status, true)}</span></p>
      <p><strong>Fecha Necesaria:</strong> ${formatDate(order.date_needed)} a las ${order.time_needed}</p>
      ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ''}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${trackingUrl}" style="background: #d4af37; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Ver Detalles del Pedido
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666;">
      <strong>Contáctanos:</strong><br>
      📞 Teléfono: (610) 279-6200<br>
      📧 Email: orders@elisbakery.com
    </p>
  </div>
</body>
</html>
  `;
}

function generateEnglishStatusUpdateText(order: StatusUpdateData, trackingUrl: string): string {
  return `
Order Status Update

Dear ${order.customer_name},

Your order status has been updated.

Order Number: ${order.order_number}
Status: ${formatStatus(order.new_status)}
Date Needed: ${formatDate(order.date_needed)} at ${order.time_needed}
${order.notes ? `Notes: ${order.notes}\n` : ''}
View order details: ${trackingUrl}

Contact Us:
Phone: (610) 279-6200
Email: orders@elisbakery.com
  `;
}

function generateSpanishStatusUpdateText(order: StatusUpdateData, trackingUrl: string): string {
  return `
Actualización de Estado del Pedido

Estimado/a ${order.customer_name},

El estado de tu pedido ha sido actualizado.

Número de Orden: ${order.order_number}
Estado: ${formatStatus(order.new_status, true)}
Fecha Necesaria: ${formatDate(order.date_needed)} a las ${order.time_needed}
${order.notes ? `Notas: ${order.notes}\n` : ''}
Ver detalles del pedido: ${trackingUrl}

Contáctanos:
Teléfono: (610) 279-6200
Email: orders@elisbakery.com
  `;
}

function formatStatus(status: string, isSpanish = false): string {
  const statusMap: Record<string, { en: string; es: string }> = {
    pending: { en: 'Pending', es: 'Pendiente' },
    confirmed: { en: 'Confirmed', es: 'Confirmada' },
    in_progress: { en: 'In Progress', es: 'En Progreso' },
    ready: { en: 'Ready', es: 'Lista' },
    out_for_delivery: { en: 'Out for Delivery', es: 'En Camino' },
    delivered: { en: 'Delivered', es: 'Entregada' },
    completed: { en: 'Completed', es: 'Completada' },
    cancelled: { en: 'Cancelled', es: 'Cancelada' }
  };

  return statusMap[status]?.[isSpanish ? 'es' : 'en'] || status;
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
