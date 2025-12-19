import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// GET all configuration attributes and options
router.get('/attributes', async (req, res) => {
  try {
    // Basic mock response for now since tables might not exist in Supabase yet
    // In a full migration, we would create these tables too
    res.json({
      attributes: [],
      rules: []
    });
  } catch (error) {
    console.error('Error fetching attributes:', error);
    res.status(500).json({ error: 'Failed to fetch attributes' });
  }
});

// GET available capacity for a date range
router.get('/capacity', async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter required' });
    }

    // Simplified capacity check for now
    const result = await pool.query(
      'SELECT time_needed, COUNT(*) as count FROM orders WHERE date_needed = $1 GROUP BY time_needed',
      [date]
    );

    // Mock slots structure
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      const usage = result.rows.find(r => r.time_needed.startsWith(`${hour}:`))?.count || 0;
      slots.push({
        hour_start: hour,
        max_capacity: 5,
        current_usage: usage,
        remaining_capacity: 5 - usage,
        is_available: usage < 5
      });
    }

    res.json(slots);
  } catch (error) {
    console.error('Error checking capacity:', error);
    res.status(500).json({ error: 'Failed to check capacity' });
  }
});

// GENERATE Baker Ticket
router.get('/ticket/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      order: result.rows[0],
      items: [], // Add items query if table exists
      ticket_generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating ticket:', error);
    res.status(500).json({ error: 'Failed to generate ticket' });
  }
});

export default router;
