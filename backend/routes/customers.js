import express from 'express';
import pool from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get current customer profile
 * GET /api/customers/me
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT 
        p.*,
        u.email
       FROM profiles p
       JOIN auth.users u ON p.id = u.id
       WHERE p.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * Get customer order history
 * GET /api/customers/me/orders
 */
router.get('/me/orders', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { status, date_from, date_to } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let query = `
      SELECT * FROM orders
      WHERE user_id = $1
    `;
    const params = [userId];

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    if (date_from) {
      query += ` AND date_needed >= $${params.length + 1}`;
      params.push(date_from);
    }

    if (date_to) {
      query += ` AND date_needed <= $${params.length + 1}`;
      params.push(date_to);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * Get customer saved addresses
 * GET /api/customers/me/addresses
 */
router.get('/me/addresses', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      'SELECT * FROM customer_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

/**
 * Create customer address
 * POST /api/customers/me/addresses
 */
router.post('/me/addresses', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { label, address, apartment, city, state, zip_code, is_default } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!label || !address) {
      return res.status(400).json({ error: 'Label and address are required' });
    }

    const result = await pool.query(
      `INSERT INTO customer_addresses (user_id, label, address, apartment, city, state, zip_code, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, label, address, apartment || null, city || null, state || null, zip_code || null, is_default || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating address:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Address with this label already exists' });
    }
    res.status(500).json({ error: 'Failed to create address' });
  }
});

/**
 * Update customer address
 * PATCH /api/customers/me/addresses/:id
 */
router.patch('/me/addresses/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { label, address, apartment, city, state, zip_code, is_default } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify address belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM customer_addresses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (label !== undefined) {
      updateFields.push(`label = $${paramCount++}`);
      values.push(label);
    }
    if (address !== undefined) {
      updateFields.push(`address = $${paramCount++}`);
      values.push(address);
    }
    if (apartment !== undefined) {
      updateFields.push(`apartment = $${paramCount++}`);
      values.push(apartment);
    }
    if (city !== undefined) {
      updateFields.push(`city = $${paramCount++}`);
      values.push(city);
    }
    if (state !== undefined) {
      updateFields.push(`state = $${paramCount++}`);
      values.push(state);
    }
    if (zip_code !== undefined) {
      updateFields.push(`zip_code = $${paramCount++}`);
      values.push(zip_code);
    }
    if (is_default !== undefined) {
      updateFields.push(`is_default = $${paramCount++}`);
      values.push(is_default);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id, userId);
    const query = `UPDATE customer_addresses 
                   SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                   WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
                   RETURNING *`;

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

/**
 * Delete customer address
 * DELETE /api/customers/me/addresses/:id
 */
router.delete('/me/addresses/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify address belongs to user
    const result = await pool.query(
      'DELETE FROM customer_addresses WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

/**
 * Update customer preferences
 * PATCH /api/customers/me/preferences
 */
router.patch('/me/preferences', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      favorite_cake_size,
      favorite_filling,
      favorite_theme,
      email_notifications_enabled,
      sms_notifications_enabled,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (favorite_cake_size !== undefined) {
      updateFields.push(`favorite_cake_size = $${paramCount++}`);
      values.push(favorite_cake_size);
    }
    if (favorite_filling !== undefined) {
      updateFields.push(`favorite_filling = $${paramCount++}`);
      values.push(favorite_filling);
    }
    if (favorite_theme !== undefined) {
      updateFields.push(`favorite_theme = $${paramCount++}`);
      values.push(favorite_theme);
    }
    if (email_notifications_enabled !== undefined) {
      updateFields.push(`email_notifications_enabled = $${paramCount++}`);
      values.push(email_notifications_enabled);
    }
    if (sms_notifications_enabled !== undefined) {
      updateFields.push(`sms_notifications_enabled = $${paramCount++}`);
      values.push(sms_notifications_enabled);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);
    const query = `UPDATE profiles 
                   SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
                   WHERE id = $${paramCount}
                   RETURNING *`;

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default router;
