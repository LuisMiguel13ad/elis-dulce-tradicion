import express from 'express';
import db from '../db/sqlite-connection.js';
import { triggerMakeWebhook } from './webhooks.js';

const router = express.Router();

// Get all orders (with optional status filter)
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    
    let query = 'SELECT * FROM orders ORDER BY created_at DESC';
    let orders;
    
    if (status && status !== 'all') {
      query = 'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC';
      orders = db.prepare(query).all(status);
    } else {
      orders = db.prepare(query).all();
    }
    
    console.log(`📋 GET /api/orders - Returning ${orders.length} orders`);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log(`📄 GET /api/orders/${req.params.id} - Found order`);
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get order by order number
router.get('/number/:orderNumber', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(req.params.orderNumber);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log(`📄 GET /api/orders/number/${req.params.orderNumber} - Found order`);
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create new order
router.post('/', (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_language,
      date_needed,
      time_needed,
      cake_size,
      filling,
      theme,
      dedication,
      reference_image_path,
      delivery_option,
      delivery_address,
      delivery_apartment,
      total_amount,
      square_payment_id
    } = req.body;
    
    // Generate order number
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = db.prepare('SELECT COUNT(*) as count FROM orders WHERE order_number LIKE ?').get(`ORD-${date}%`).count;
    const orderNumber = `ORD-${date}-${String(count + 1).padStart(6, '0')}`;
    
    // Insert order
    const insert = db.prepare(`
      INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone, customer_language,
        date_needed, time_needed, cake_size, filling, theme, dedication, reference_image_path,
        delivery_option, delivery_address, delivery_apartment,
        square_payment_id, total_amount, status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid')
    `);
    
    const result = insert.run(
      orderNumber, customer_name, customer_email, customer_phone, customer_language || 'es',
      date_needed, time_needed, cake_size, filling, theme, dedication || '', reference_image_path || null,
      delivery_option, delivery_address || '', delivery_apartment || '',
      square_payment_id || `payment-${Date.now()}`, total_amount
    );
    
    // Get the created order
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);
    
    // Create status history
    db.prepare('INSERT INTO order_status_history (order_id, status, notes) VALUES (?, ?, ?)').run(
      order.id,
      'confirmed',
      'Order created'
    );
    
    console.log(`✅ POST /api/orders - Created order ${orderNumber}`);
    console.log(`   Customer: ${customer_name}`);
    console.log(`   Date: ${date_needed} ${time_needed}`);
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    
    // Get current order to check delivery option
    const currentOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    
    // Build update query based on status - track timestamps
    let updateQuery = "UPDATE orders SET status = ?, updated_at = datetime('now')";
    const updateParams = [status];
    
    // Add timestamp tracking for delivery statuses
    if (status === 'ready') {
      updateQuery += ", ready_at = datetime('now')";
      
      // Calculate estimated delivery time (30-45 minutes from now)
      const estimatedMinutes = 35;
      updateQuery += `, estimated_delivery_time = datetime('now', '+${estimatedMinutes} minutes')`;
    } else if (status === 'out_for_delivery') {
      updateQuery += ", out_for_delivery_at = datetime('now')";
      
      // Recalculate estimated delivery time (15-20 minutes from now)
      const estimatedMinutes = 18;
      updateQuery += `, estimated_delivery_time = datetime('now', '+${estimatedMinutes} minutes')`;
    } else if (status === 'delivered') {
      updateQuery += ", delivered_at = datetime('now')";
    }
    
    updateQuery += ' WHERE id = ?';
    updateParams.push(orderId);
    
    // Update order
    const update = db.prepare(updateQuery);
    update.run(...updateParams);
    
    // Add to history
    db.prepare('INSERT INTO order_status_history (order_id, status) VALUES (?, ?)').run(orderId, status);
    
    // Get updated order
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    
    // Log status change with details
    console.log(`🔄 PATCH /api/orders/${orderId}/status - Updated to ${status}`);
    console.log(`   Customer: ${order.customer_name} (${order.customer_phone})`);
    
    if (order.delivery_option === 'delivery') {
      console.log(`   🚗 DELIVERY to: ${order.delivery_address}`);
      if (status === 'ready') {
        console.log(`   📋 Order is ready and will be sent out soon`);
      } else if (status === 'out_for_delivery') {
        console.log(`   🚗 Order is now OUT FOR DELIVERY`);
        console.log(`   ⏰ Est. arrival: ${order.estimated_delivery_time}`);
      } else if (status === 'delivered') {
        console.log(`   ✅ Order has been DELIVERED`);
      }
    } else {
      console.log(`   📦 PICKUP order`);
    }
    
    // Send customer notifications via Make.com webhook (or fallback email)
    if (status === 'ready' || status === 'out_for_delivery' || status === 'delivered') {
      triggerMakeWebhook(`order_${status}`, order);
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;

