import express from 'express';
import crypto from 'crypto';
import pool from '../db/connection.js';

const router = express.Router();

// Middleware to verify Square webhook signature
function verifySquareWebhook(req, res, next) {
  const signature = req.headers['x-square-signature'];
  const webhookSecret = process.env.SQUARE_WEBHOOK_SECRET;
  
  if (!signature || !webhookSecret) {
    console.warn('Missing webhook signature or secret');
    return next(); // Continue but log warning
  }
  
  // Square webhook signature verification
  // Note: Square uses HMAC-SHA256 with the webhook secret
  const payload = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', webhookSecret);
  hmac.update(payload);
  const calculatedSignature = hmac.digest('base64');
  
  if (signature !== calculatedSignature) {
    console.error('Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
}

// Email fallback using Nodemailer
async function sendEmailFallback(data, subject) {
  try {
    // Dynamically import nodemailer to avoid crash if not installed
    // User MUST install nodemailer: npm install nodemailer
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Eli's Bakery" <${process.env.SMTP_USER}>`,
      to: data.customer_email,
      subject: subject || `Order Confirmation: ${data.order_number}`,
      text: `Thank you for your order!\n\nOrder Number: ${data.order_number}\nCustomer: ${data.customer_name}\nDate Needed: ${data.date_needed} ${data.time_needed}\n\nWe will notify you when it's ready!`,
      html: `
        <h1>Thank you for your order!</h1>
        <p><strong>Order Number:</strong> ${data.order_number}</p>
        <p><strong>Customer:</strong> ${data.customer_name}</p>
        <p><strong>Date Needed:</strong> ${data.date_needed} ${data.time_needed}</p>
        <hr>
        <h3>Order Details:</h3>
        <ul>
          <li><strong>Size:</strong> ${data.cake_size}</li>
          <li><strong>Flavor:</strong> ${data.filling}</li>
          <li><strong>Theme:</strong> ${data.theme}</li>
        </ul>
        <p>We will notify you when it's ready!</p>
      `,
    });

    console.log('Fallback email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Email fallback failed (Nodemailer not installed or config missing):', error.message);
    return false;
  }
}

// Make.com webhook trigger helper
async function triggerMakeWebhook(scenario, data) {
  const webhookUrl = process.env.MAKE_COM_WEBHOOK_URL;
  const whatsappWebhookUrl = process.env.MAKE_COM_WHATSAPP_WEBHOOK;
  
  // Attempt Make.com Webhook first
  if (webhookUrl) {
    try {
      const emailResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: 'order_confirmation',
          event: scenario,
          order: {
            order_number: data.order_number,
            customer_name: data.customer_name,
            customer_email: data.customer_email,
            customer_phone: data.customer_phone,
            date_needed: data.date_needed,
            time_needed: data.time_needed,
            cake_size: data.cake_size,
            filling: data.filling,
            theme: data.theme,
            dedication: data.dedication,
            delivery_option: data.delivery_option,
            delivery_address: data.delivery_address,
            delivery_apartment: data.delivery_apartment,
            total_amount: data.total_amount,
            status: data.status
          },
          timestamp: new Date().toISOString()
        })
      });
      
      if (emailResponse.ok) {
        console.log('Make.com email webhook success');
        // Check for WhatsApp only if email succeeded
        if (whatsappWebhookUrl && scenario === 'order_confirmation') {
           // ... WhatsApp logic (kept same) ...
           try {
             await fetch(whatsappWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  scenario: 'bakery_notification',
                  order: data,
                  message: `Nueva orden: ${data.order_number}`,
                  timestamp: new Date().toISOString()
                })
             });
           } catch (e) { console.error('WhatsApp webhook failed', e); }
        }
        return; // Success, exit function
      } else {
        console.error('Make.com email webhook failed:', emailResponse.statusText);
      }
    } catch (error) {
      console.error('Error triggering Make.com webhook:', error);
    }
  } else {
    console.warn('Make.com webhook URL not configured - attempting fallback');
  }

  // Fallback: Direct Email (if Make.com failed or not configured)
  console.log('Attempting direct email fallback...');
  await sendEmailFallback(data);
}

// Square webhook handler
router.post('/square', verifySquareWebhook, async (req, res) => {
  try {
    const { type, data } = req.body;
    
    console.log('Square webhook received:', type);
    
    // Handle payment.created and payment.updated events
    if (type === 'payment.created' || type === 'payment.updated') {
      const payment = data.object?.payment;
      
      if (!payment) {
        return res.status(400).json({ error: 'Invalid webhook payload' });
      }
      
      const squarePaymentId = payment.id;
      const amount = payment.amountMoney?.amount 
        ? parseFloat(payment.amountMoney.amount.toString()) / 100 
        : null;
      const status = payment.status;
      const orderId = payment.orderId; // Square order ID (may be null for Web Payments SDK)
      
      // Check if order already exists in our database
      const existingOrderResult = await pool.query(
        'SELECT * FROM orders WHERE square_payment_id = $1',
        [squarePaymentId]
      );

      if (existingOrderResult.rows.length > 0) {
        // Order already exists - update payment status
        const order = existingOrderResult.rows[0];
        
        // Update order payment status
        await pool.query(
          `UPDATE orders 
           SET payment_status = $1, status = CASE 
             WHEN $1 = 'paid' AND status = 'pending' THEN 'confirmed'
             ELSE status
           END
           WHERE id = $2`,
          [status === 'COMPLETED' ? 'paid' : status.toLowerCase(), order.id]
        );

        // Update payment record
        await pool.query(
          `UPDATE payments 
           SET status = $1, updated_at = CURRENT_TIMESTAMP
           WHERE square_payment_id = $2`,
          [status, squarePaymentId]
        );

        // Insert status history if status changed
        if (status === 'COMPLETED' && order.status !== 'confirmed') {
          await pool.query(
            `INSERT INTO order_status_history (order_id, status, notes)
             VALUES ($1, 'confirmed', 'Payment confirmed via webhook')`,
            [order.id]
          );

          // Send confirmation email
          try {
            const { sendOrderConfirmationEmail } = await import('../utils/edgeFunctions.js');
            sendOrderConfirmationEmail(order).catch((err) => {
              console.error('Error sending order confirmation email:', err);
            });
          } catch (err) {
            console.error('Error importing edge function utility:', err);
          }
        }

        console.log(`✅ Updated order ${order.order_number} payment status to ${status}`);
        return res.status(200).json({ received: true, action: 'updated' });
      }
      
      // Order doesn't exist - try to get order data from Square order metadata
      // (This is for legacy checkout flow, Web Payments SDK creates order before payment)
      let orderData = null;
      if (orderId) {
        try {
          const { Client, Environment } = await import('square');
          const squareClient = new Client({
            accessToken: process.env.SQUARE_ACCESS_TOKEN,
            environment: process.env.SQUARE_ENVIRONMENT === 'production' 
              ? Environment.Production 
              : Environment.Sandbox,
          });
          
          const orderResponse = await squareClient.ordersApi.retrieveOrder(orderId);
          if (orderResponse.result.order?.metadata?.order_data) {
            orderData = JSON.parse(orderResponse.result.order.metadata.order_data);
          }
        } catch (err) {
          console.error('Error fetching Square order:', err);
        }
      }
      
      // If payment is completed and we have order data, create the order
      // (Legacy flow - Web Payments SDK should create order before payment)
      if (status === 'COMPLETED' && orderData) {
        // Check if order already exists
        const existingOrder = await pool.query(
          'SELECT * FROM orders WHERE square_payment_id = $1',
          [squarePaymentId]
        );
        
        if (existingOrder.rows.length === 0) {
          // Generate order number
          const orderNumberResult = await pool.query(
            "SELECT 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(COALESCE(MAX(CAST(SUBSTRING(order_number FROM '\\d+$') AS INTEGER)), 0) + 1, 6, '0') as next_order_number FROM orders WHERE order_number LIKE 'ORD-%'"
          );
          const orderNumber = orderNumberResult.rows[0]?.next_order_number || `ORD-${Date.now()}`;
          
          // Create new order
          const orderResult = await pool.query(
            `INSERT INTO orders (
              order_number, customer_name, customer_email, customer_phone, customer_language,
              date_needed, time_needed, cake_size, filling, theme, dedication,
              delivery_option, delivery_address, delivery_apartment,
              square_payment_id, total_amount, status, payment_status
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'confirmed', 'paid'
            ) RETURNING *`,
            [
              orderNumber,
              orderData.customer_name,
              orderData.customer_email,
              orderData.customer_phone,
              orderData.customer_language || 'en',
              orderData.date_needed,
              orderData.time_needed,
              orderData.cake_size,
              orderData.filling,
              orderData.theme,
              orderData.dedication || '',
              orderData.delivery_option,
              orderData.delivery_address || '',
              orderData.delivery_apartment || '',
              squarePaymentId,
              orderData.total_amount || amount
            ]
          );
          
          const order = orderResult.rows[0];
          
          // Create payment record
          await pool.query(
            `INSERT INTO payments (order_id, square_payment_id, amount, status, currency)
             VALUES ($1, $2, $3, 'COMPLETED', 'USD')
             ON CONFLICT (square_payment_id) DO NOTHING`,
            [order.id, squarePaymentId, amount || orderData.total_amount]
          );
          
          // Insert status history
          await pool.query(
            `INSERT INTO order_status_history (order_id, status, notes)
             VALUES ($1, 'confirmed', 'Order created from payment')`,
            [order.id]
          );
          
          // Send order confirmation email via Edge Function
          try {
            const { sendOrderConfirmationEmail } = await import('../utils/edgeFunctions.js');
            sendOrderConfirmationEmail(order).catch((err) => {
              console.error('Error sending order confirmation email:', err);
            });
          } catch (err) {
            console.error('Error importing edge function utility:', err);
          }
          
          // Legacy: Trigger Make.com webhook (keep for backward compatibility)
          await triggerMakeWebhook('order_confirmation', order);
        }
      } else if (status === 'COMPLETED' && !orderData) {
        // Payment completed but no order data - this shouldn't happen with Web Payments SDK
        // Log for investigation
        console.warn(`⚠️ Payment ${squarePaymentId} completed but no order found or order data missing`);
      } else if (status === 'FAILED' || status === 'CANCELED') {
        // Log failed/cancelled payments
        console.error(`❌ Payment ${squarePaymentId} ${status.toLowerCase()}`);
        // Could update order status to 'payment_failed' if needed
      }
    }
    
    // Handle refund events
    if (type === 'refund.created' || type === 'refund.updated') {
      const refund = data.object?.refund;
      
      if (!refund) {
        return res.status(400).json({ error: 'Invalid webhook payload' });
      }

      const paymentId = refund.paymentId;
      const refundAmount = refund.amountMoney?.amount 
        ? parseFloat(refund.amountMoney.amount.toString()) / 100 
        : null;

      // Update payment record
      await pool.query(
        `UPDATE payments 
         SET refunded_amount = COALESCE(refunded_amount, 0) + $1,
             refund_status = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE square_payment_id = $3`,
        [refundAmount, refund.status, paymentId]
      );

      // If full refund, update order status
      const paymentResult = await pool.query(
        'SELECT * FROM payments WHERE square_payment_id = $1',
        [paymentId]
      );

      if (paymentResult.rows.length > 0) {
        const payment = paymentResult.rows[0];
        const totalRefunded = parseFloat(payment.refunded_amount || 0) + refundAmount;
        const paymentAmount = parseFloat(payment.amount);

        if (totalRefunded >= paymentAmount) {
          // Full refund - cancel order
          await pool.query(
            `UPDATE orders 
             SET status = 'cancelled', payment_status = 'refunded'
             WHERE id = $1`,
            [payment.order_id]
          );

          await pool.query(
            `INSERT INTO order_status_history (order_id, status, notes)
             VALUES ($1, 'cancelled', 'Order cancelled due to refund')`,
            [payment.order_id]
          );
        }
      }

      console.log(`✅ Refund processed for payment ${paymentId}: $${refundAmount}`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing Square webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Manual webhook trigger endpoint (for testing or manual triggers)
router.post('/make-com/:scenario', async (req, res) => {
  try {
    const { scenario } = req.params;
    const { orderId, orderNumber } = req.body;
    
    let order;
    if (orderId) {
      const result = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
      order = result.rows[0];
    } else if (orderNumber) {
      const result = await pool.query('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);
      order = result.rows[0];
    } else {
      return res.status(400).json({ error: 'orderId or orderNumber required' });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (scenario === 'ready_notification') {
      // Trigger ready-for-pickup notification
      const webhookUrl = process.env.MAKE_COM_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenario: 'ready_for_pickup',
            order: order,
            timestamp: new Date().toISOString()
          })
        });
      }
    } else {
      await triggerMakeWebhook(scenario, order);
    }
    
    res.json({ success: true, message: `Webhook triggered for scenario: ${scenario}` });
  } catch (error) {
    console.error('Error triggering webhook:', error);
    res.status(500).json({ error: 'Failed to trigger webhook' });
  }
});

export default router;
export { triggerMakeWebhook };
