import express from 'express';
import pool from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { cacheMiddleware, cacheKeys } from '../middleware/cache.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * Get all current active pricing
 * GET /api/pricing/current
 * Cached for 1 hour (pricing rarely changes)
 */
router.get('/current', cacheMiddleware(3600, () => cacheKeys.pricing.current()), async (req, res) => {
  try {
    const [cakePricing, fillingPricing, themePricing, deliveryZones, taxRates] = await Promise.all([
      pool.query('SELECT size, base_price FROM cake_pricing WHERE active = true ORDER BY base_price'),
      pool.query('SELECT name, additional_cost FROM filling_pricing WHERE active = true ORDER BY name'),
      pool.query('SELECT name, additional_cost FROM theme_pricing WHERE active = true ORDER BY name'),
      pool.query('SELECT zone_name, base_fee, per_mile_rate, max_distance, zip_codes FROM delivery_zones WHERE active = true ORDER BY base_fee'),
      pool.query('SELECT state, county, rate FROM tax_rates WHERE active = true ORDER BY state, county NULLS LAST'),
    ]);

    res.json({
      cakePricing: cakePricing.rows,
      fillingPricing: fillingPricing.rows,
      themePricing: themePricing.rows,
      deliveryZones: deliveryZones.rows,
      taxRates: taxRates.rows,
    });
  } catch (error) {
    console.error('Error fetching current pricing:', error);
    res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

/**
 * Calculate pricing for order details
 * POST /api/pricing/calculate
 */
router.post('/calculate', async (req, res) => {
  try {
    const { size, filling, theme, deliveryOption, deliveryAddress, zipCode, promoCode } = req.body;

    if (!size || !filling || !theme) {
      return res.status(400).json({ error: 'Size, filling, and theme are required' });
    }

    // Get pricing
    const [cakeResult, fillingResult, themeResult] = await Promise.all([
      pool.query('SELECT base_price FROM cake_pricing WHERE size = $1 AND active = true', [size]),
      pool.query('SELECT additional_cost FROM filling_pricing WHERE name = $1 AND active = true', [filling]),
      pool.query('SELECT additional_cost FROM theme_pricing WHERE name = $1 AND active = true', [theme]),
    ]);

    const basePrice = cakeResult.rows[0]?.base_price || 0;
    const fillingCost = fillingResult.rows[0]?.additional_cost || 0;
    const themeCost = themeResult.rows[0]?.additional_cost || 0;

    const subtotal = parseFloat(basePrice) + parseFloat(fillingCost) + parseFloat(themeCost);

    // Calculate delivery fee
    let deliveryFee = 0;
    if (deliveryOption === 'delivery' && zipCode) {
      const zoneResult = await pool.query(
        'SELECT base_fee, per_mile_rate, max_distance FROM delivery_zones WHERE $1 = ANY(zip_codes) AND active = true ORDER BY base_fee LIMIT 1',
        [zipCode]
      );

      if (zoneResult.rows.length > 0) {
        const zone = zoneResult.rows[0];
        deliveryFee = parseFloat(zone.base_fee);
        // Note: Distance calculation would be done client-side with Google Maps
        // For now, use base fee
      } else {
        // Default delivery fee
        deliveryFee = 15.00;
      }
    }

    // Calculate tax
    const taxableAmount = subtotal + deliveryFee;
    const taxRateResult = await pool.query(
      'SELECT rate FROM tax_rates WHERE state = $1 AND active = true ORDER BY county NULLS LAST LIMIT 1',
      ['CA']
    );
    const taxRate = taxRateResult.rows[0]?.rate || 0.08; // Default 8%
    const tax = taxableAmount * parseFloat(taxRate);

    // Apply promo code if provided
    let discount = 0;
    if (promoCode) {
      const promoResult = await pool.query(
        `SELECT discount_type, discount_value, max_discount_amount, min_order_amount 
         FROM promo_codes 
         WHERE code = $1 
           AND active = true 
           AND valid_from <= CURRENT_TIMESTAMP 
           AND valid_until >= CURRENT_TIMESTAMP
           AND (usage_limit IS NULL OR usage_count < usage_limit)`,
        [promoCode.toUpperCase()]
      );

      if (promoResult.rows.length > 0) {
        const promo = promoResult.rows[0];
        const orderTotal = taxableAmount + tax;

        if (orderTotal >= parseFloat(promo.min_order_amount || 0)) {
          if (promo.discount_type === 'percentage') {
            discount = orderTotal * (parseFloat(promo.discount_value) / 100);
            if (promo.max_discount_amount) {
              discount = Math.min(discount, parseFloat(promo.max_discount_amount));
            }
          } else {
            discount = Math.min(parseFloat(promo.discount_value), orderTotal);
          }
        }
      }
    }

    const total = taxableAmount + tax - discount;

    res.json({
      basePrice: parseFloat(basePrice),
      fillingCost: parseFloat(fillingCost),
      themeCost: parseFloat(themeCost),
      deliveryFee,
      tax,
      subtotal,
      discount,
      total: Math.max(0, total),
    });
  } catch (error) {
    console.error('Error calculating pricing:', error);
    res.status(500).json({ error: 'Failed to calculate pricing' });
  }
});

/**
 * Validate promo code
 * POST /api/pricing/promo-code/validate
 */
router.post('/promo-code/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.json({ valid: false, message: 'Promo code is required' });
    }

    const result = await pool.query(
      `SELECT discount_type, discount_value, max_discount_amount, min_order_amount, usage_limit, usage_count
       FROM promo_codes
       WHERE code = $1 
         AND active = true 
         AND valid_from <= CURRENT_TIMESTAMP 
         AND valid_until >= CURRENT_TIMESTAMP
         AND (usage_limit IS NULL OR usage_count < usage_limit)`,
      [code.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.json({ valid: false, message: 'Invalid or expired promo code' });
    }

    const promo = result.rows[0];

    if (subtotal < parseFloat(promo.min_order_amount || 0)) {
      return res.json({
        valid: false,
        message: `Minimum order amount of $${parseFloat(promo.min_order_amount)} required`,
      });
    }

    res.json({
      valid: true,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      max_discount_amount: promo.max_discount_amount,
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.json({ valid: false, message: 'Error validating promo code' });
  }
});

/**
 * Update pricing (admin only)
 * PATCH /api/pricing/:type/:id
 */
router.patch('/:type/:id', requireAuth, async (req, res) => {
  try {
    const { type, id } = req.params;
    const updates = req.body;

    // Verify user is admin/owner
    const userResult = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [req.user?.id]
    );

    if (userResult.rows.length === 0 || !['owner', 'baker'].includes(userResult.rows[0].role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let tableName;
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    switch (type) {
      case 'cake':
        tableName = 'cake_pricing';
        if (updates.base_price !== undefined) {
          updateFields.push(`base_price = $${paramCount++}`);
          values.push(updates.base_price);
        }
        if (updates.description !== undefined) {
          updateFields.push(`description = $${paramCount++}`);
          values.push(updates.description);
        }
        if (updates.active !== undefined) {
          updateFields.push(`active = $${paramCount++}`);
          values.push(updates.active);
        }
        break;

      case 'filling':
        tableName = 'filling_pricing';
        if (updates.additional_cost !== undefined) {
          updateFields.push(`additional_cost = $${paramCount++}`);
          values.push(updates.additional_cost);
        }
        if (updates.description !== undefined) {
          updateFields.push(`description = $${paramCount++}`);
          values.push(updates.description);
        }
        if (updates.active !== undefined) {
          updateFields.push(`active = $${paramCount++}`);
          values.push(updates.active);
        }
        break;

      case 'theme':
        tableName = 'theme_pricing';
        if (updates.additional_cost !== undefined) {
          updateFields.push(`additional_cost = $${paramCount++}`);
          values.push(updates.additional_cost);
        }
        if (updates.description !== undefined) {
          updateFields.push(`description = $${paramCount++}`);
          values.push(updates.description);
        }
        if (updates.active !== undefined) {
          updateFields.push(`active = $${paramCount++}`);
          values.push(updates.active);
        }
        break;

      case 'delivery':
        tableName = 'delivery_zones';
        if (updates.base_fee !== undefined) {
          updateFields.push(`base_fee = $${paramCount++}`);
          values.push(updates.base_fee);
        }
        if (updates.per_mile_rate !== undefined) {
          updateFields.push(`per_mile_rate = $${paramCount++}`);
          values.push(updates.per_mile_rate);
        }
        if (updates.max_distance !== undefined) {
          updateFields.push(`max_distance = $${paramCount++}`);
          values.push(updates.max_distance);
        }
        if (updates.zip_codes !== undefined) {
          updateFields.push(`zip_codes = $${paramCount++}`);
          values.push(updates.zip_codes);
        }
        if (updates.active !== undefined) {
          updateFields.push(`active = $${paramCount++}`);
          values.push(updates.active);
        }
        break;

      case 'tax':
        tableName = 'tax_rates';
        if (updates.rate !== undefined) {
          updateFields.push(`rate = $${paramCount++}`);
          values.push(updates.rate);
        }
        if (updates.active !== undefined) {
          updateFields.push(`active = $${paramCount++}`);
          values.push(updates.active);
        }
        break;

      default:
        return res.status(400).json({ error: 'Invalid pricing type' });
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);
    const query = `UPDATE ${tableName} SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pricing not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating pricing:', error);
    res.status(500).json({ error: 'Failed to update pricing' });
  }
});

/**
 * Create new pricing entry (admin only)
 * POST /api/pricing/:type
 */
router.post('/:type', requireAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const data = req.body;

    // Verify user is admin/owner
    const userResult = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [req.user?.id]
    );

    if (userResult.rows.length === 0 || !['owner', 'baker'].includes(userResult.rows[0].role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let tableName;
    let fields = [];
    let values = [];
    let paramCount = 1;

    switch (type) {
      case 'cake':
        tableName = 'cake_pricing';
        fields = ['size', 'base_price', 'description', 'active'];
        values = [data.size, data.base_price, data.description || null, data.active !== false];
        break;

      case 'filling':
        tableName = 'filling_pricing';
        fields = ['name', 'additional_cost', 'description', 'active'];
        values = [data.name, data.additional_cost || 0, data.description || null, data.active !== false];
        break;

      case 'theme':
        tableName = 'theme_pricing';
        fields = ['name', 'additional_cost', 'description', 'active'];
        values = [data.name, data.additional_cost || 0, data.description || null, data.active !== false];
        break;

      case 'delivery':
        tableName = 'delivery_zones';
        fields = ['zone_name', 'base_fee', 'per_mile_rate', 'max_distance', 'zip_codes', 'active'];
        values = [
          data.zone_name,
          data.base_fee || 0,
          data.per_mile_rate || 0,
          data.max_distance || null,
          data.zip_codes || [],
          data.active !== false,
        ];
        break;

      case 'tax':
        tableName = 'tax_rates';
        fields = ['state', 'county', 'rate', 'effective_date', 'active'];
        values = [
          data.state,
          data.county || null,
          data.rate,
          data.effective_date || new Date().toISOString().split('T')[0],
          data.active !== false,
        ];
        break;

      case 'promo':
        tableName = 'promo_codes';
        fields = [
          'code',
          'discount_type',
          'discount_value',
          'min_order_amount',
          'max_discount_amount',
          'valid_from',
          'valid_until',
          'usage_limit',
          'active',
          'description',
        ];
        values = [
          data.code.toUpperCase(),
          data.discount_type,
          data.discount_value,
          data.min_order_amount || 0,
          data.max_discount_amount || null,
          data.valid_from,
          data.valid_until,
          data.usage_limit || null,
          data.active !== false,
          data.description || null,
        ];
        break;

      default:
        return res.status(400).json({ error: 'Invalid pricing type' });
    }

    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`;

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating pricing:', error);
    if (error.code === '23505') {
      // Unique constraint violation
      return res.status(409).json({ error: 'Pricing entry already exists' });
    }
    res.status(500).json({ error: 'Failed to create pricing' });
  }
});

/**
 * Delete pricing entry (admin only)
 * DELETE /api/pricing/:type/:id
 */
router.delete('/:type/:id', requireAuth, async (req, res) => {
  try {
    const { type, id } = req.params;

    // Verify user is admin/owner
    const userResult = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [req.user?.id]
    );

    if (userResult.rows.length === 0 || !['owner', 'baker'].includes(userResult.rows[0].role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const tableMap = {
      cake: 'cake_pricing',
      filling: 'filling_pricing',
      theme: 'theme_pricing',
      delivery: 'delivery_zones',
      tax: 'tax_rates',
      promo: 'promo_codes',
    };

    const tableName = tableMap[type];
    if (!tableName) {
      return res.status(400).json({ error: 'Invalid pricing type' });
    }

    // Soft delete by setting active = false
    const result = await pool.query(
      `UPDATE ${tableName} SET active = false WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pricing not found' });
    }

    res.json({ message: 'Pricing deactivated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting pricing:', error);
    res.status(500).json({ error: 'Failed to delete pricing' });
  }
});

/**
 * Get price history (admin only)
 * GET /api/pricing/:type/:id/history
 */
router.get('/:type/:id/history', requireAuth, async (req, res) => {
  try {
    const { type, id } = req.params;

    // Verify user is admin/owner
    const userResult = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [req.user?.id]
    );

    if (userResult.rows.length === 0 || !['owner', 'baker'].includes(userResult.rows[0].role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const tableMap = {
      cake: 'cake_pricing',
      filling: 'filling_pricing',
      theme: 'theme_pricing',
      delivery: 'delivery_zones',
      tax: 'tax_rates',
    };

    const pricingType = tableMap[type] || type;

    const result = await pool.query(
      `SELECT ph.*, p.full_name as changed_by_name
       FROM price_history ph
       LEFT JOIN profiles p ON ph.changed_by = p.id
       WHERE ph.pricing_type = $1 AND ph.pricing_id = $2
       ORDER BY ph.created_at DESC`,
      [pricingType, id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: 'Failed to fetch price history' });
  }
});

export default router;
