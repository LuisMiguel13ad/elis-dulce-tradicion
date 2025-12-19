import express from 'express';
import pool from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Generate daily sales report (CSV)
 * GET /api/reports/daily-sales
 */
router.get('/daily-sales', requireAuth, async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date || new Date().toISOString().split('T')[0];
    
    // Verify user is owner (if user.id exists, otherwise check API key)
    if (req.user?.id) {
      const userCheck = await pool.query(
        'SELECT role FROM profiles WHERE id = $1',
        [req.user.id]
      );
      
      if (userCheck.rows[0]?.role !== 'owner') {
        return res.status(403).json({ error: 'Forbidden: Owner access required' });
      }
    } else if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Owner access required' });
    }

    const result = await pool.query(
      `SELECT 
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        date_needed,
        time_needed,
        cake_size,
        filling,
        theme,
        total_amount,
        status,
        delivery_option,
        created_at
       FROM orders
       WHERE DATE(created_at) = $1
       ORDER BY created_at ASC`,
      [reportDate]
    );

    // Generate CSV
    const headers = [
      'Order Number',
      'Customer Name',
      'Email',
      'Phone',
      'Date Needed',
      'Time Needed',
      'Size',
      'Filling',
      'Theme',
      'Total Amount',
      'Status',
      'Delivery Option',
      'Created At'
    ];

    const rows = result.rows.map(order => [
      order.order_number,
      order.customer_name,
      order.customer_email,
      order.customer_phone,
      order.date_needed,
      order.time_needed,
      order.cake_size,
      order.filling,
      order.theme,
      order.total_amount,
      order.status,
      order.delivery_option,
      order.created_at
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="daily-sales-${reportDate}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error generating daily sales report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

/**
 * Generate inventory usage report (CSV)
 * GET /api/reports/inventory
 */
router.get('/inventory', requireAuth, async (req, res) => {
  try {
    // Verify user is owner (if user.id exists, otherwise check API key)
    if (req.user?.id) {
      const userCheck = await pool.query(
        'SELECT role FROM profiles WHERE id = $1',
        [req.user.id]
      );
      
      if (userCheck.rows[0]?.role !== 'owner') {
        return res.status(403).json({ error: 'Forbidden: Owner access required' });
      }
    } else if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Owner access required' });
    }

    const result = await pool.query(
      `SELECT 
        i.name,
        i.quantity,
        i.unit,
        i.low_stock_threshold,
        CASE 
          WHEN i.quantity <= i.low_stock_threshold THEN 'Yes'
          ELSE 'No'
        END as is_low_stock,
        COALESCE(SUM(iu.quantity_used), 0) as total_used,
        i.last_updated
       FROM ingredients i
       LEFT JOIN ingredient_usage iu ON i.id = iu.ingredient_id
       WHERE iu.used_at >= CURRENT_DATE - INTERVAL '30 days' OR iu.used_at IS NULL
       GROUP BY i.id, i.name, i.quantity, i.unit, i.low_stock_threshold, i.last_updated
       ORDER BY i.name ASC`
    );

    // Generate CSV
    const headers = [
      'Ingredient Name',
      'Current Quantity',
      'Unit',
      'Low Stock Threshold',
      'Is Low Stock',
      'Total Used (30 days)',
      'Last Updated'
    ];

    const rows = result.rows.map(item => [
      item.name,
      item.quantity,
      item.unit,
      item.low_stock_threshold,
      item.is_low_stock,
      item.total_used,
      item.last_updated
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="inventory-report-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

/**
 * Generate customer activity report (CSV)
 * GET /api/reports/customer-activity
 */
router.get('/customer-activity', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    
    // Verify user is owner (if user.id exists, otherwise check API key)
    if (req.user?.id) {
      const userCheck = await pool.query(
        'SELECT role FROM profiles WHERE id = $1',
        [req.user.id]
      );
      
      if (userCheck.rows[0]?.role !== 'owner') {
        return res.status(403).json({ error: 'Forbidden: Owner access required' });
      }
    } else if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Owner access required' });
    }

    const result = await pool.query(
      `SELECT 
        p.full_name,
        p.email,
        p.phone,
        COUNT(DISTINCT o.id) as total_orders,
        SUM(o.total_amount) as total_spent,
        AVG(o.total_amount) as average_order_value,
        MAX(o.created_at) as last_order_date,
        MIN(o.created_at) as first_order_date,
        p.loyalty_points
       FROM profiles p
       LEFT JOIN orders o ON p.id = o.user_id 
         AND o.created_at >= $1 
         AND o.created_at <= $2
         AND o.status != 'cancelled'
       WHERE p.role = 'customer'
       GROUP BY p.id, p.full_name, p.email, p.phone, p.loyalty_points
       ORDER BY total_spent DESC`,
      [startDate, endDate]
    );

    // Generate CSV
    const headers = [
      'Customer Name',
      'Email',
      'Phone',
      'Total Orders',
      'Total Spent',
      'Average Order Value',
      'First Order Date',
      'Last Order Date',
      'Loyalty Points'
    ];

    const rows = result.rows.map(customer => [
      customer.full_name,
      customer.email,
      customer.phone,
      customer.total_orders,
      customer.total_spent,
      customer.average_order_value,
      customer.first_order_date,
      customer.last_order_date,
      customer.loyalty_points
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="customer-activity-${startDate}-to-${endDate}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error generating customer activity report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;
