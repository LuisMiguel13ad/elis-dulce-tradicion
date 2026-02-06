import express from 'express';
import { SquareClient, SquareEnvironment } from 'square';
import pool from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Initialize Square client
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production'
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox,
});

const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;

if (!SQUARE_ACCESS_TOKEN || !SQUARE_LOCATION_ID) {
  console.warn('⚠️ Square credentials not configured. Payment features will not work.');
}

/**
 * Generate unique order number
 */
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Create payment (process Square payment)
 * POST /api/payments/create-payment
 */
router.post('/create-payment', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { sourceId, amount, orderData, idempotencyKey } = req.body;

    if (!sourceId || !amount || !orderData) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: sourceId, amount, orderData' 
      });
    }

    // Validate amount matches order total
    const expectedAmount = Math.round(parseFloat(orderData.total_amount) * 100);
    if (amount !== expectedAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: 'Payment amount does not match order total' 
      });
    }

    // Check for duplicate payment (idempotency)
    if (idempotencyKey) {
      const existingPayment = await client.query(
        'SELECT * FROM payments WHERE idempotency_key = $1',
        [idempotencyKey]
      );
      
      if (existingPayment.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ 
          success: false,
          error: 'Duplicate payment request',
          paymentId: existingPayment.rows[0].square_payment_id
        });
      }
    }

    // Create Square payment
    const paymentsApi = squareClient.paymentsApi;
    const paymentRequest = {
      sourceId: sourceId,
      amountMoney: {
        amount: BigInt(amount),
        currency: 'USD',
      },
      idempotencyKey: idempotencyKey || `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      note: `Order: ${orderData.customer_name} - ${orderData.cake_size} ${orderData.filling}`,
      autocomplete: true, // Auto-complete payment
    };

    const paymentResponse = await paymentsApi.createPayment(paymentRequest);

    if (paymentResponse.result.errors && paymentResponse.result.errors.length > 0) {
      await client.query('ROLLBACK');
      const error = paymentResponse.result.errors[0];
      console.error('Square payment error:', error);
      
      // Log failed payment
      await logFailedPayment(client, {
        amount,
        orderData,
        error: error.detail || error.code,
        idempotencyKey,
      });

      return res.status(400).json({ 
        success: false,
        error: error.detail || 'Payment failed',
        code: error.code
      });
    }

    const payment = paymentResponse.result.payment;
    const squarePaymentId = payment.id;
    const paymentStatus = payment.status;

    // Create order in database
    const orderNumber = generateOrderNumber();
    const orderResult = await client.query(
      `INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone, customer_language,
        date_needed, time_needed, cake_size, filling, theme, dedication,
        delivery_option, delivery_address, delivery_apartment,
        reference_image_path, square_payment_id, total_amount, status, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
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
        orderData.reference_image_path || '',
        squarePaymentId,
        orderData.total_amount,
        paymentStatus === 'COMPLETED' ? 'confirmed' : 'pending',
        paymentStatus === 'COMPLETED' ? 'paid' : 'pending',
      ]
    );

    const order = orderResult.rows[0];

    // Create payment record
    await client.query(
      `INSERT INTO payments (
        order_id, square_payment_id, amount, status, currency, idempotency_key
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (square_payment_id) DO NOTHING`,
      [
        order.id,
        squarePaymentId,
        amount / 100, // Convert cents to dollars
        paymentStatus,
        'USD',
        idempotencyKey || null,
      ]
    );

    // Insert status history
    await client.query(
      `INSERT INTO order_status_history (order_id, status, notes)
       VALUES ($1, $2, $3)`,
      [order.id, order.status, 'Order created from payment']
    );

    await client.query('COMMIT');

    // Send webhook notification (async, don't block response)
    try {
      const { sendOrderWebhook } = await import('../utils/webhook.js');
      sendOrderWebhook(order).catch((err) => {
        console.error('Error sending order webhook:', err);
        // Don't throw - webhook failures shouldn't block order creation
      });
    } catch (err) {
      console.error('Error importing webhook utility:', err);
    }

    // Send order confirmation email (async, don't block response)
    try {
      const { sendOrderConfirmationEmail } = await import('../utils/edgeFunctions.js');
      sendOrderConfirmationEmail(order).catch((err) => {
        console.error('Error sending order confirmation email:', err);
        // Don't throw - email failures shouldn't block order creation
      });
    } catch (err) {
      console.error('Error importing edge function utility:', err);
    }

    res.json({
      success: true,
      paymentId: squarePaymentId,
      orderId: order.id,
      orderNumber: order.order_number,
      status: paymentStatus,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating payment:', error);
    
    // Log failed payment
    try {
      await logFailedPayment(client, {
        amount: req.body.amount,
        orderData: req.body.orderData,
        error: error.message,
        idempotencyKey: req.body.idempotencyKey,
      });
    } catch (logError) {
      console.error('Error logging failed payment:', logError);
    }

    res.status(500).json({ 
      success: false,
      error: 'Failed to process payment',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

/**
 * Verify payment
 * POST /api/payments/verify
 */
router.post('/verify', async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ 
        verified: false,
        error: 'Payment ID is required' 
      });
    }

    // Get payment from Square
    const paymentsApi = squareClient.paymentsApi;
    const paymentResponse = await paymentsApi.getPayment(paymentId);

    if (paymentResponse.result.errors && paymentResponse.result.errors.length > 0) {
      return res.status(404).json({ 
        verified: false,
        error: 'Payment not found' 
      });
    }

    const payment = paymentResponse.result.payment;
    const isVerified = payment.status === 'COMPLETED';

    // Get order from database
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE square_payment_id = $1',
      [paymentId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ 
        verified: false,
        error: 'Order not found for this payment' 
      });
    }

    const order = orderResult.rows[0];

    // Verify amount matches
    const paymentAmount = parseFloat(payment.amountMoney.amount.toString()) / 100;
    const orderAmount = parseFloat(order.total_amount);
    const amountMatches = Math.abs(paymentAmount - orderAmount) < 0.01;

    if (!amountMatches) {
      console.error(`Amount mismatch: payment=${paymentAmount}, order=${orderAmount}`);
      return res.json({ 
        verified: false,
        error: 'Payment amount does not match order total',
        paymentAmount,
        orderAmount,
      });
    }

    res.json({
      verified: isVerified && amountMatches,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: paymentAmount,
      },
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      verified: false,
      error: 'Failed to verify payment' 
    });
  }
});

/**
 * Get payment by Square payment ID
 * GET /api/payments/square/:paymentId
 */
router.get('/square/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const paymentsApi = squareClient.paymentsApi;
    const response = await paymentsApi.getPayment(paymentId);
    
    if (response.result.errors && response.result.errors.length > 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(response.result.payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

/**
 * Get payment by order ID
 * GET /api/payments/order/:orderId
 */
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1',
      [orderId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

/**
 * Refund payment
 * POST /api/payments/:paymentId/refund
 * Requires authentication
 */
router.post('/:paymentId/refund', requireAuth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    // Get payment from database
    const paymentResult = await client.query(
      'SELECT * FROM payments WHERE square_payment_id = $1',
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Get payment from Square
    const paymentsApi = squareClient.paymentsApi;
    const squarePaymentResponse = await paymentsApi.getPayment(paymentId);

    if (squarePaymentResponse.result.errors && squarePaymentResponse.result.errors.length > 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Payment not found in Square' });
    }

    const squarePayment = squarePaymentResponse.result.payment;

    // Check if payment can be refunded
    if (squarePayment.status !== 'COMPLETED') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Payment must be completed to refund',
        status: squarePayment.status
      });
    }

    // Calculate refund amount (full or partial)
    const refundAmount = amount 
      ? BigInt(Math.round(amount * 100))
      : squarePayment.amountMoney.amount;

    // Create refund
    const refundsApi = squareClient.refundsApi;
    const refundRequest = {
      idempotencyKey: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      amountMoney: {
        amount: refundAmount,
        currency: 'USD',
      },
      paymentId: paymentId,
      reason: reason || 'Customer request',
    };

    const refundResponse = await refundsApi.refundPayment(refundRequest);

    if (refundResponse.result.errors && refundResponse.result.errors.length > 0) {
      await client.query('ROLLBACK');
      const error = refundResponse.result.errors[0];
      return res.status(400).json({ 
        error: error.detail || 'Refund failed',
        code: error.code
      });
    }

    const refund = refundResponse.result.refund;

    // Update payment status
    await client.query(
      `UPDATE payments 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE square_payment_id = $2`,
      ['REFUNDED', paymentId]
    );

    // Update order status if full refund
    if (!amount || refundAmount === squarePayment.amountMoney.amount) {
      await client.query(
        `UPDATE orders 
         SET status = 'cancelled', payment_status = 'refunded'
         WHERE id = $1`,
        [payment.order_id]
      );

      // Insert status history
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes)
         VALUES ($1, 'cancelled', 'Order cancelled due to refund')`,
        [payment.order_id]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      refund: {
        id: refund.id,
        status: refund.status,
        amount: parseFloat(refund.amountMoney.amount.toString()) / 100,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing refund:', error);
    res.status(500).json({ 
      error: 'Failed to process refund',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

/**
 * Log failed payment for admin review
 */
async function logFailedPayment(client, { amount, orderData, error, idempotencyKey }) {
  try {
    // Insert into failed_payments table
    await client.query(
      `INSERT INTO failed_payments (
        amount, customer_name, customer_email, order_data, error_message, idempotency_key
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        amount / 100,
        orderData.customer_name,
        orderData.customer_email,
        JSON.stringify(orderData),
        error,
        idempotencyKey || null,
      ]
    );

    console.error('❌ Failed Payment logged:', {
      amount: amount / 100,
      customer: orderData.customer_name,
      email: orderData.customer_email,
      error,
    });

    // Send notification to admin
    try {
      const { sendFailedPaymentNotification } = await import('../utils/edgeFunctions.js');
      await sendFailedPaymentNotification({
        amount: amount / 100,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        error_message: error,
        idempotency_key: idempotencyKey,
      });
      console.log('✅ Admin notified of failed payment');
    } catch (notifyErr) {
      console.error('⚠️ Failed to send admin notification:', notifyErr);
      // Don't throw - notification failure shouldn't break payment flow
    }
  } catch (err) {
    console.error('Error logging failed payment:', err);
    // Don't throw - logging failure shouldn't break payment flow
  }
}

/**
 * Legacy: Create checkout (for backward compatibility)
 * POST /api/payments/create-checkout
 */
router.post('/create-checkout', async (req, res) => {
  try {
    const {
      amount,
      orderData,
      returnUrl,
      cancelUrl
    } = req.body;
    
    if (!amount || !orderData) {
      return res.status(400).json({ error: 'Amount and order data are required' });
    }
    
    // For Web Payments SDK, we don't need to create a checkout link
    // Instead, return the order data needed for client-side payment
    res.json({
      checkoutId: null,
      orderId: null,
      checkoutUrl: null,
      amount,
      orderData,
      message: 'Use Web Payments SDK for embedded payment form',
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    res.status(500).json({ 
      error: 'Failed to create payment checkout',
      details: error.message 
    });
  }
});

export default router;
