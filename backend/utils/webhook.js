/**
 * Webhook Utility
 * Sends order notifications to external webhooks
 */

/**
 * Send order notification to webhook
 * @param {Object} order - The order object
 * @returns {Promise<boolean>} - Success status
 */
export async function sendOrderWebhook(order) {
  const webhookUrl = process.env.ORDER_WEBHOOK_URL || 'https://n8nlocal.neurovaiagents.uk/webhook-test/order-notifications';
  
  if (!webhookUrl) {
    console.log('No webhook URL configured, skipping webhook notification');
    return false;
  }

  try {
    const payload = {
      event: 'order.created',
      timestamp: new Date().toISOString(),
      order: {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        customer_language: order.customer_language,
        date_needed: order.date_needed,
        time_needed: order.time_needed,
        cake_size: order.cake_size,
        filling: order.filling,
        theme: order.theme,
        dedication: order.dedication,
        delivery_option: order.delivery_option,
        delivery_address: order.delivery_address,
        delivery_apartment: order.delivery_apartment,
        delivery_zone: order.delivery_zone,
        total_amount: order.total_amount,
        status: order.status,
        payment_status: order.payment_status,
        created_at: order.created_at,
      },
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ElisBakery-Webhook/1.0',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    console.log(`✅ Order webhook sent successfully for order #${order.order_number}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending order webhook:', error.message);
    // Don't throw - webhook failures shouldn't block order creation
    return false;
  }
}

