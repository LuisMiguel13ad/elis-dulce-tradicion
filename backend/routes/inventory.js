import express from 'express';
import pool from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get all ingredients (admin only)
 * GET /api/inventory
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    // Verify user is admin
    const userResult = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [req.user?.id]
    );

    if (userResult.rows.length === 0 || !['owner', 'baker'].includes(userResult.rows[0].role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      'SELECT * FROM ingredients ORDER BY category, name'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

/**
 * Get low stock items (admin only)
 * GET /api/inventory/low-stock
 */
router.get('/low-stock', requireAuth, async (req, res) => {
  try {
    // Verify user is admin
    const userResult = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [req.user?.id]
    );

    if (userResult.rows.length === 0 || !['owner', 'baker'].includes(userResult.rows[0].role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT * FROM ingredients 
       WHERE quantity <= low_stock_threshold 
       ORDER BY (quantity / NULLIF(low_stock_threshold, 0)) ASC, name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

/**
 * Update ingredient quantity (admin only)
 * PATCH /api/inventory/:id
 */
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, notes } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ error: 'Quantity is required' });
    }

    // Verify user is admin
    const userResult = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [req.user?.id]
    );

    if (userResult.rows.length === 0 || !['owner', 'baker'].includes(userResult.rows[0].role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `UPDATE ingredients 
       SET quantity = $1, 
           last_updated = CURRENT_TIMESTAMP,
           updated_by = $2
       WHERE id = $3
       RETURNING *`,
      [quantity, req.user?.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

/**
 * Log ingredient usage (admin only)
 * POST /api/inventory/usage
 */
router.post('/usage', requireAuth, async (req, res) => {
  try {
    const { ingredient_id, quantity_used, order_id, notes } = req.body;

    if (!ingredient_id || !quantity_used) {
      return res.status(400).json({ error: 'ingredient_id and quantity_used are required' });
    }

    // Verify user is admin
    const userResult = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [req.user?.id]
    );

    if (userResult.rows.length === 0 || !['owner', 'baker'].includes(userResult.rows[0].role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Insert usage log
    const usageResult = await pool.query(
      `INSERT INTO ingredient_usage (ingredient_id, quantity_used, order_id, notes, used_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [ingredient_id, quantity_used, order_id || null, notes || null, req.user?.id]
    );

    // Update ingredient quantity
    await pool.query(
      `UPDATE ingredients 
       SET quantity = GREATEST(0, quantity - $1),
           last_updated = CURRENT_TIMESTAMP,
           updated_by = $2
       WHERE id = $3`,
      [quantity_used, req.user?.id, ingredient_id]
    );

    res.json(usageResult.rows[0]);
  } catch (error) {
    console.error('Error logging ingredient usage:', error);
    res.status(500).json({ error: 'Failed to log ingredient usage' });
  }
});

/**
 * Get ingredient usage report (admin only)
 * GET /api/inventory/usage-report?ingredient_id=1&days=30
 */
router.get('/usage-report', requireAuth, async (req, res) => {
  try {
    const { ingredient_id, days = 30 } = req.query;

    // Verify user is admin
    const userResult = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [req.user?.id]
    );

    if (userResult.rows.length === 0 || !['owner', 'baker'].includes(userResult.rows[0].role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let query = `
      SELECT 
        iu.*,
        i.name as ingredient_name,
        i.unit,
        o.order_number,
        p.full_name as used_by_name
      FROM ingredient_usage iu
      JOIN ingredients i ON iu.ingredient_id = i.id
      LEFT JOIN orders o ON iu.order_id = o.id
      LEFT JOIN profiles p ON iu.used_by = p.id
      WHERE iu.created_at >= CURRENT_DATE - INTERVAL '${days} days'
    `;

    const params = [];
    if (ingredient_id) {
      query += ' AND iu.ingredient_id = $1';
      params.push(ingredient_id);
    }

    query += ' ORDER BY iu.created_at DESC';

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching usage report:', error);
    res.status(500).json({ error: 'Failed to fetch usage report' });
  }
});

export default router;
