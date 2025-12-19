import express from 'express';
import pool from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Reorder a previous order
 * POST /api/orders/:id/reorder
 */
router.post('/:id/reorder', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the original order
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)',
      [id, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const originalOrder = orderResult.rows[0];

    // Return order data for pre-filling the order form
    res.json({
      success: true,
      orderData: {
        size: originalOrder.cake_size,
        filling: originalOrder.filling,
        theme: originalOrder.theme,
        dedication: originalOrder.dedication,
        delivery_option: originalOrder.delivery_option,
        delivery_address: originalOrder.delivery_address,
        delivery_apartment: originalOrder.delivery_apartment,
      },
    });
  } catch (error) {
    console.error('Error reordering:', error);
    res.status(500).json({ error: 'Failed to reorder' });
  }
});

export default router;
