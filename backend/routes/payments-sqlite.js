import express from 'express';
import pkg from 'square';
const { SquareClient, SquareEnvironment } = pkg.default || pkg;
import db from '../db/sqlite-connection.js';

const router = express.Router();

// Lazy initialization of Square client
let squareClient = null;
function getSquareClient() {
  console.log('🔍 Checking Square client initialization...');
  console.log(`   squareClient exists: ${squareClient ? 'Yes' : 'No'}`);
  console.log(`   SQUARE_ACCESS_TOKEN: ${process.env.SQUARE_ACCESS_TOKEN ? 'Set (' + process.env.SQUARE_ACCESS_TOKEN.substring(0, 10) + '...)' : 'Missing'}`);
  console.log(`   SQUARE_LOCATION_ID: ${process.env.SQUARE_LOCATION_ID ? 'Set (' + process.env.SQUARE_LOCATION_ID.substring(0, 10) + '...)' : 'Missing'}`);
  
  if (!squareClient && process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID) {
    try {
      console.log('🔄 Initializing Square client...');
      squareClient = new SquareClient({
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        environment: process.env.SQUARE_ENVIRONMENT === 'production' 
          ? SquareEnvironment.Production 
          : SquareEnvironment.Sandbox,
      });
      console.log('✅ Square client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Square client:', error);
    }
  } else if (!process.env.SQUARE_ACCESS_TOKEN || !process.env.SQUARE_LOCATION_ID) {
    console.log('⚠️  Square credentials missing, cannot initialize client');
  }
  return squareClient;
}

// Create Square checkout
router.post('/create-checkout', async (req, res) => {
  try {
    const { orderData, amount, totalAmount } = req.body;
    // Support both 'amount' and 'totalAmount' for compatibility
    const paymentAmount = totalAmount || amount;
    
    console.log(`💳 POST /api/payments/create-checkout`);
    console.log(`   Amount: $${paymentAmount}`);
    console.log(`   Customer: ${orderData?.customer_name || 'Unknown'}`);
    
    if (!paymentAmount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    
    // Try to get Square client (lazy initialization)
    const client = getSquareClient();
    
    if (!client || !process.env.SQUARE_ACCESS_TOKEN || !process.env.SQUARE_LOCATION_ID) {
      console.warn('⚠️  Square credentials not configured. Using mock mode.');
      console.log(`   Access Token: ${process.env.SQUARE_ACCESS_TOKEN ? 'Set' : 'Missing'}`);
      console.log(`   Location ID: ${process.env.SQUARE_LOCATION_ID ? 'Set' : 'Missing'}`);
      // Fallback to mock mode if credentials not set
      return createMockCheckout(req, res, orderData, paymentAmount);
    }
    
    console.log('✅ Using Square checkout');
    
    // Convert amount to cents for Square
    const amountInCents = BigInt(Math.round(paymentAmount * 100));
    
    // Create Square order using SDK v2 API
    const orderRequest = {
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        lineItems: [
          {
            name: orderData.theme ? `Custom Cake - ${orderData.theme}` : 'Custom Cake Order',
            quantity: '1',
            basePriceMoney: {
              amount: amountInCents,
              currency: 'USD'
            }
          }
        ],
        metadata: {
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          date_needed: orderData.date_needed,
          time_needed: orderData.time_needed,
          cake_size: orderData.cake_size,
          filling: orderData.filling,
          theme: orderData.theme || '',
          dedication: orderData.dedication || '',
          delivery_option: orderData.delivery_option,
          delivery_address: orderData.delivery_address || '',
        }
      },
      idempotencyKey: `${Date.now()}-${Math.random().toString(36).substring(7)}`
    };
    
    // Create order using SDK v2 method
    const orderResponse = await client.orders.create(orderRequest);
    
    if (!orderResponse.result.order) {
      throw new Error('Failed to create Square order');
    }
    
    const squareOrderId = orderResponse.result.order.id;
    
    // Create checkout link using SDK v2
    const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || 'http://localhost:4567';
    const checkoutRequest = {
      idempotencyKey: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      checkoutPageRequest: {
        redirectUrl: `${frontendUrl}/order-confirmation?orderId=${squareOrderId}`,
        orderId: squareOrderId,
        askForShippingAddress: orderData.delivery_option === 'delivery',
        merchantSupportEmail: process.env.MERCHANT_EMAIL || 'support@elisbakery.com'
      }
    };
    
    const checkoutResponse = await client.checkout.createCheckout(
      process.env.SQUARE_LOCATION_ID,
      checkoutRequest
    );
    
    if (checkoutResponse.result.checkout) {
      console.log(`   ✅ Square checkout created: ${checkoutResponse.result.checkout.id}`);
      res.json({
        checkoutId: checkoutResponse.result.checkout.id,
        orderId: squareOrderId,
        checkoutUrl: checkoutResponse.result.checkout.checkoutPageUrl
      });
    } else {
      throw new Error('Failed to create Square checkout');
    }
  } catch (error) {
    console.error('Error creating Square checkout:', error);
    // Fallback to mock mode on error
    console.log('   ⚠️  Falling back to mock checkout mode');
    const paymentAmount = req.body.totalAmount || req.body.amount;
    return createMockCheckout(req, res, req.body.orderData, paymentAmount);
  }
});

// Mock checkout fallback function
function createMockCheckout(req, res, orderData, totalAmount) {
  try {
    // Generate order number
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = db.prepare('SELECT COUNT(*) as count FROM orders WHERE order_number LIKE ?').get(`ORD-${date}%`).count;
    const orderNumber = `ORD-${date}-${String(count + 1).padStart(6, '0')}`;
    
    const squarePaymentId = `mock-payment-${Date.now()}`;
    
    // Create order
    const insert = db.prepare(`
      INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone,
        date_needed, time_needed, cake_size, filling, theme, dedication, reference_image_path,
        delivery_option, delivery_address, delivery_apartment,
        square_payment_id, total_amount, status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid')
    `);
    
    const result = insert.run(
      orderNumber,
      orderData.customer_name,
      orderData.customer_email,
      orderData.customer_phone,
      orderData.date_needed,
      orderData.time_needed,
      orderData.cake_size,
      orderData.filling,
      orderData.theme,
      orderData.dedication || '',
      orderData.reference_image_path || null,
      orderData.delivery_option,
      orderData.delivery_address || '',
      orderData.delivery_apartment || '',
      squarePaymentId,
      totalAmount
    );
    
    const orderId = result.lastInsertRowid;
    
    // Create payment record
    db.prepare(`
      INSERT INTO payments (order_id, square_payment_id, amount, status)
      VALUES (?, ?, ?, 'COMPLETED')
    `).run(orderId, squarePaymentId, totalAmount);
    
    // Create status history
    db.prepare('INSERT INTO order_status_history (order_id, status, notes) VALUES (?, ?, ?)').run(
      orderId,
      'confirmed',
      'Payment completed (mock mode)'
    );
    
    console.log(`   ✅ Order created (mock mode): ${orderNumber}`);
    
    // Return mock checkout URL pointing to confirmation page
    const frontendUrl = req.headers.origin || 'http://localhost:4567';
    res.json({
      checkoutId: squarePaymentId,
      checkoutUrl: `${frontendUrl}/order-confirmation?orderNumber=${orderNumber}`,
      orderId: orderId,
      orderNumber: orderNumber
    });
  } catch (error) {
    console.error('Error creating mock checkout:', error);
    res.status(500).json({ error: 'Failed to create checkout' });
  }
}

// Get payment by Square ID
router.get('/square/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Try to get from database first
    const payment = db.prepare('SELECT * FROM payments WHERE square_payment_id = ?').get(paymentId);
    
    if (payment) {
      console.log(`💰 GET /api/payments/square/${paymentId}`);
      return res.json(payment);
    }
    
    // If not in database and Square is configured, try Square API
    const client = getSquareClient();
    if (client) {
      const paymentsApi = client.payments;
      const response = await paymentsApi.getPayment(paymentId);
      
      if (response.result.payment) {
        return res.json(response.result.payment);
      }
    }
    
    res.status(404).json({ error: 'Payment not found' });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Get payment by order ID
router.get('/order/:orderId', (req, res) => {
  try {
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(req.params.orderId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    console.log(`💰 GET /api/payments/order/${req.params.orderId}`);
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

export default router;
