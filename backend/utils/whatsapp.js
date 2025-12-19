// WhatsApp integration utilities
// Can be used with Make.com or direct WhatsApp Business API

/**
 * Format order data for WhatsApp message
 */
export function formatOrderForWhatsApp(order) {
  const deliveryInfo = order.delivery_option === 'delivery' 
    ? `Entrega\nDirección: ${order.delivery_address}${order.delivery_apartment ? `\nApartamento: ${order.delivery_apartment}` : ''}`
    : 'Recoger en tienda';
  
  return `
*Nueva Orden de Pastel - ${order.order_number}*
━━━━━━━━━━━━━━━━━━━━
📅 Fecha: ${order.date_needed} ${order.time_needed}
👤 Cliente: ${order.customer_name}
📞 Teléfono: ${order.customer_phone}
📧 Email: ${order.customer_email}
━━━━━━━━━━━━━━━━━━━━
🎂 Tamaño: ${order.cake_size}
🍰 Relleno: ${order.filling}
🎨 Tema: ${order.theme}
${order.dedication ? `💝 Dedicatoria: ${order.dedication}` : ''}
━━━━━━━━━━━━━━━━━━━━
🚚 ${deliveryInfo}
💰 Total: $${order.total_amount}
━━━━━━━━━━━━━━━━━━━━
Estado: ${order.status}
`.trim();
}

/**
 * Format ready notification for customer
 */
export function formatReadyNotification(order) {
  return `
🎉 *¡Tu pastel está listo!*

Orden: ${order.order_number}
Cliente: ${order.customer_name}

Tu pastel personalizado está listo para recoger.

${order.delivery_option === 'pickup' 
  ? '📍 Puedes venir a recogerlo en nuestra tienda.' 
  : '🚚 Estaremos entregando tu pedido pronto.'}

Gracias por elegirnos! 🙏
`.trim();
}

/**
 * Send WhatsApp message via Make.com webhook
 */
export async function sendWhatsAppViaMake(phoneNumber, message, webhookUrl) {
  if (!webhookUrl) {
    console.warn('WhatsApp webhook URL not configured');
    return false;
  }
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phoneNumber,
        message: message,
        timestamp: new Date().toISOString()
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error sending WhatsApp via Make.com:', error);
    return false;
  }
}



