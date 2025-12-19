import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// In-memory storage for testing
let orders = [
  {
    id: 1,
    order_number: 'ORD-20250117-000001',
    customer_name: 'Maria González',
    customer_email: 'maria@example.com',
    customer_phone: '610-555-0101',
    date_needed: '2025-01-20',
    time_needed: '14:00',
    cake_size: '10 inches',
    filling: 'Tres Leches Vanilla',
    theme: 'Birthday',
    dedication: 'Feliz Cumpleaños María!',
    delivery_option: 'pickup',
    delivery_address: '',
    delivery_apartment: '',
    total_amount: 45.00,
    status: 'confirmed',
    payment_status: 'paid',
    square_payment_id: 'mock-payment-001',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    order_number: 'ORD-20250117-000002',
    customer_name: 'John Smith',
    customer_email: 'john@example.com',
    customer_phone: '610-555-0102',
    date_needed: '2025-01-22',
    time_needed: '16:00',
    cake_size: '8 inches',
    filling: 'Red Velvet',
    theme: 'Wedding',
    dedication: 'Congratulations!',
    delivery_option: 'delivery',
    delivery_address: '123 Main St, Bensalem, PA',
    delivery_apartment: 'Apt 2B',
    total_amount: 65.00,
    status: 'pending',
    payment_status: 'paid',
    square_payment_id: 'mock-payment-002',
    created_at: new Date().toISOString()
  }
];

let orderIdCounter = 3;

// Middleware
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok - MOCK SERVER', 
    timestamp: new Date().toISOString(),
    message: 'Running in test mode with fake data'
  });
});

// Get all orders (with optional status filter)
app.get('/api/orders', (req, res) => {
  const { status } = req.query;
  let filteredOrders = orders;
  
  if (status && status !== 'all') {
    filteredOrders = orders.filter(o => o.status === status);
  }
  
  console.log(`📋 GET /api/orders - Returning ${filteredOrders.length} orders`);
  res.json(filteredOrders);
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  console.log(`📄 GET /api/orders/${req.params.id} - Found order`);
  res.json(order);
});

// Get order by order number
app.get('/api/orders/number/:orderNumber', (req, res) => {
  const order = orders.find(o => o.order_number === req.params.orderNumber);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  console.log(`📄 GET /api/orders/number/${req.params.orderNumber} - Found order`);
  res.json(order);
});

// Create order
app.post('/api/orders', (req, res) => {
  const newOrder = {
    id: orderIdCounter++,
    order_number: `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(orderIdCounter).padStart(6, '0')}`,
    ...req.body,
    status: 'confirmed',
    payment_status: 'paid',
    square_payment_id: `mock-payment-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  
  orders.unshift(newOrder); // Add to beginning
  
  console.log(`✅ POST /api/orders - Created order ${newOrder.order_number}`);
  console.log(`   Customer: ${newOrder.customer_name}`);
  console.log(`   Date: ${newOrder.date_needed} ${newOrder.time_needed}`);
  
  res.status(201).json(newOrder);
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  orders[orderIndex].status = status;
  
  console.log(`🔄 PATCH /api/orders/${req.params.id}/status - Updated to ${status}`);
  res.json(orders[orderIndex]);
});

// Create Square checkout (mock)
app.post('/api/payments/create-checkout', (req, res) => {
  const { orderData, totalAmount } = req.body;
  
  console.log(`💳 POST /api/payments/create-checkout`);
  console.log(`   Amount: $${totalAmount}`);
  console.log(`   Customer: ${orderData.customer_name}`);
  
  // Simulate successful checkout creation
  const mockCheckoutId = `mock-checkout-${Date.now()}`;
  const mockCheckoutUrl = `http://localhost:5174/order-confirmation?mock=true&orderId=${mockCheckoutId}`;
  
  // Create order immediately (simulating successful payment)
  const newOrder = {
    id: orderIdCounter++,
    order_number: `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(orderIdCounter).padStart(6, '0')}`,
    ...orderData,
    total_amount: totalAmount,
    status: 'confirmed',
    payment_status: 'paid',
    square_payment_id: `mock-payment-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  
  orders.unshift(newOrder);
  
  console.log(`   ✅ Order created: ${newOrder.order_number}`);
  
  res.json({
    checkoutId: mockCheckoutId,
    checkoutUrl: mockCheckoutUrl,
    orderId: newOrder.id,
    orderNumber: newOrder.order_number
  });
});

// Get payment by Square ID (mock)
app.get('/api/payments/square/:paymentId', (req, res) => {
  console.log(`💰 GET /api/payments/square/${req.params.paymentId}`);
  
  res.json({
    id: req.params.paymentId,
    status: 'COMPLETED',
    amount: 45.00,
    currency: 'USD',
    created_at: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🎂 ============================================');
  console.log('   ELI\'S BAKERY - MOCK TEST SERVER');
  console.log('   ============================================');
  console.log(`   ✅ Server running at http://localhost:${PORT}`);
  console.log(`   ✅ Health check: http://localhost:${PORT}/health`);
  console.log(`   ✅ Frontend: http://localhost:5174`);
  console.log(`   ✅ Dashboard: http://localhost:5174/bakery-dashboard`);
  console.log('   ============================================');
  console.log(`   📦 Mock orders loaded: ${orders.length}`);
  console.log('   🧪 This is a TEST server - no real payments');
  console.log('   ============================================\n');
});

