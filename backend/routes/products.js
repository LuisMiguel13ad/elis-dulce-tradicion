import express from 'express';
import db from '../db/sqlite-connection.js';

const router = express.Router();

// GET all products
router.get('/', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY category, name_en').all();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST create product
router.post('/', (req, res) => {
  try {
    const { name_es, name_en, description_es, description_en, price, image_url, category } = req.body;
    
    const insert = db.prepare(`
      INSERT INTO products (name_es, name_en, description_es, description_en, price, image_url, category)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(name_es, name_en, description_es, description_en, price, image_url, category);
    
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PATCH update product
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Construct dynamic update query
    const keys = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
    if (keys.length === 0) return res.status(400).json({ error: 'No fields to update' });
    
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => updates[key]);
    
    const update = db.prepare(`UPDATE products SET ${setClause}, updated_at = datetime('now') WHERE id = ?`);
    update.run(...values, id);
    
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE (soft delete) product
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const update = db.prepare("UPDATE products SET is_active = 0, updated_at = datetime('now') WHERE id = ?");
    update.run(id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;

