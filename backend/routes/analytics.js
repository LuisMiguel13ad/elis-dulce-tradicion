import express from 'express';
import pool from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get dashboard metrics
 * GET /api/analytics/dashboard
 */
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const { dateRange = 'today' } = req.query;
    
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

    // Calculate date range
    let dateFilter = '';
    const params = [];
    
    switch (dateRange) {
      case 'today':
        dateFilter = "DATE(created_at) = CURRENT_DATE";
        break;
      case 'week':
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
    }

    // Today's orders
    const todayOrdersResult = await pool.query(
      `SELECT COUNT(*) as count, SUM(total_amount) as revenue 
       FROM orders 
       WHERE DATE(created_at) = CURRENT_DATE AND status != 'cancelled'`
    );
    const todayOrders = parseInt(todayOrdersResult.rows[0]?.count || 0);
    const todayRevenue = parseFloat(todayOrdersResult.rows[0]?.revenue || 0);

    // Pending orders
    const pendingResult = await pool.query(
      `SELECT COUNT(*) as count FROM orders WHERE status IN ('pending', 'confirmed')`
    );
    const pendingOrders = parseInt(pendingResult.rows[0]?.count || 0);

    // Capacity utilization
    const capacityResult = await pool.query(
      `SELECT 
        SUM(max_orders) as total_capacity,
        SUM(current_orders) as current_orders
       FROM daily_capacity
       WHERE date >= CURRENT_DATE AND date <= CURRENT_DATE + INTERVAL '7 days'`
    );
    const totalCapacity = parseInt(capacityResult.rows[0]?.total_capacity || 0);
    const currentOrders = parseInt(capacityResult.rows[0]?.current_orders || 0);
    const capacityUtilization = totalCapacity > 0 
      ? (currentOrders / totalCapacity) * 100 
      : 0;

    // Average order value
    const avgOrderResult = await pool.query(
      `SELECT AVG(total_amount) as avg_value 
       FROM orders 
       WHERE ${dateFilter} AND status != 'cancelled'`
    );
    const averageOrderValue = parseFloat(avgOrderResult.rows[0]?.avg_value || 0);

    // Total customers
    const customersResult = await pool.query(
      'SELECT COUNT(*) as count FROM profiles WHERE role = $1',
      ['customer']
    );
    const totalCustomers = parseInt(customersResult.rows[0]?.count || 0);

    // Low stock items
    const lowStockResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM ingredients 
       WHERE quantity <= low_stock_threshold`
    );
    const lowStockItems = parseInt(lowStockResult.rows[0]?.count || 0);

    // Today's deliveries
    const deliveriesResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM orders 
       WHERE DATE(created_at) = CURRENT_DATE 
       AND delivery_option = 'delivery' 
       AND delivery_status != 'delivered'`
    );
    const todayDeliveries = parseInt(deliveriesResult.rows[0]?.count || 0);

    res.json({
      todayOrders,
      todayRevenue,
      pendingOrders,
      capacityUtilization: Math.round(capacityUtilization * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      totalCustomers,
      lowStockItems,
      todayDeliveries,
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

/**
 * Get revenue by period
 * GET /api/analytics/revenue
 */
router.get('/revenue', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
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

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    let dateTrunc = '';
    switch (groupBy) {
      case 'day':
        dateTrunc = "DATE_TRUNC('day', created_at)";
        break;
      case 'week':
        dateTrunc = "DATE_TRUNC('week', created_at)";
        break;
      case 'month':
        dateTrunc = "DATE_TRUNC('month', created_at)";
        break;
      default:
        dateTrunc = "DATE_TRUNC('day', created_at)";
    }

    const result = await pool.query(
      `SELECT 
        ${dateTrunc} as period,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue,
        AVG(total_amount) as avg_order_value
       FROM orders
       WHERE created_at >= $1 
         AND created_at <= $2 
         AND status != 'cancelled'
       GROUP BY ${dateTrunc}
       ORDER BY period ASC`,
      [startDate, endDate]
    );

    res.json(result.rows.map(row => ({
      date: row.period.toISOString().split('T')[0],
      revenue: parseFloat(row.revenue || 0),
      orderCount: parseInt(row.order_count || 0),
      avgOrderValue: parseFloat(row.avg_order_value || 0),
    })));
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

/**
 * Get popular items
 * GET /api/analytics/popular-items
 */
router.get('/popular-items', requireAuth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
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

    let interval = '';
    switch (period) {
      case 'week':
        interval = "INTERVAL '7 days'";
        break;
      case 'month':
        interval = "INTERVAL '30 days'";
        break;
      case 'year':
        interval = "INTERVAL '365 days'";
        break;
      default:
        interval = "INTERVAL '30 days'";
    }

    const result = await pool.query(
      `SELECT * FROM v_popular_items
       WHERE order_count > 0
       ORDER BY order_count DESC
       LIMIT 20`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching popular items:', error);
    res.status(500).json({ error: 'Failed to fetch popular items' });
  }
});

/**
 * Get orders by status
 * GET /api/analytics/orders-by-status
 */
router.get('/orders-by-status', requireAuth, async (req, res) => {
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

    const result = await pool.query('SELECT * FROM v_order_status_breakdown');

    res.json(result.rows.map(row => ({
      status: row.status,
      count: parseInt(row.count || 0),
      totalRevenue: parseFloat(row.total_revenue || 0),
      percentage: parseFloat(row.percentage || 0),
    })));
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    res.status(500).json({ error: 'Failed to fetch orders by status' });
  }
});

/**
 * Get average order value
 * GET /api/analytics/average-order-value
 */
router.get('/average-order-value', requireAuth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
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

    let dateFilter = '';
    switch (period) {
      case 'today':
        dateFilter = "DATE(created_at) = CURRENT_DATE";
        break;
      case 'week':
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '30 days'";
        break;
    }

    const result = await pool.query(
      `SELECT AVG(total_amount) as avg_value 
       FROM orders 
       WHERE ${dateFilter} AND status != 'cancelled'`
    );

    res.json({ 
      averageOrderValue: parseFloat(result.rows[0]?.avg_value || 0) 
    });
  } catch (error) {
    console.error('Error fetching average order value:', error);
    res.status(500).json({ error: 'Failed to fetch average order value' });
  }
});

/**
 * Get peak ordering times
 * GET /api/analytics/peak-ordering-times
 */
router.get('/peak-ordering-times', requireAuth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
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
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue
       FROM orders
       WHERE created_at >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
       GROUP BY EXTRACT(HOUR FROM created_at)
       ORDER BY hour ASC`
    );

    res.json(result.rows.map(row => ({
      hour: parseInt(row.hour || 0),
      orderCount: parseInt(row.order_count || 0),
      revenue: parseFloat(row.revenue || 0),
    })));
  } catch (error) {
    console.error('Error fetching peak ordering times:', error);
    res.status(500).json({ error: 'Failed to fetch peak ordering times' });
  }
});

/**
 * Get capacity utilization
 * GET /api/analytics/capacity-usage
 */
router.get('/capacity-usage', requireAuth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
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
      `SELECT * FROM v_capacity_utilization
       WHERE date >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
       ORDER BY date DESC`
    );

    res.json(result.rows.map(row => ({
      date: row.date.toISOString().split('T')[0],
      maxOrders: parseInt(row.max_orders || 0),
      currentOrders: parseInt(row.current_orders || 0),
      utilizationPercentage: parseFloat(row.utilization_percentage || 0),
      capacityStatus: row.capacity_status,
    })));
  } catch (error) {
    console.error('Error fetching capacity usage:', error);
    res.status(500).json({ error: 'Failed to fetch capacity usage' });
  }
});

export default router;
