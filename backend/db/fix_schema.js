import db from './sqlite-connection.js';

console.log('🔧 Fixing database schema...\n');

// 1. Create order_status_history if not exists
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);
  console.log('✅ Checked/Created order_status_history table');
} catch (error) {
  console.error('❌ Error creating order_status_history:', error);
}

// 2. Add missing columns to orders table
const columnsToAdd = [
  { name: 'ready_at', type: 'TEXT' },
  { name: 'out_for_delivery_at', type: 'TEXT' },
  { name: 'delivered_at', type: 'TEXT' },
  { name: 'estimated_delivery_time', type: 'TEXT' }
];

for (const col of columnsToAdd) {
  try {
    // Check if column exists
    const columnExists = db.prepare(`SELECT COUNT(*) as count FROM pragma_table_info('orders') WHERE name = ?`).get(col.name).count > 0;
    
    if (!columnExists) {
      db.exec(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.type}`);
      console.log(`✅ Added column: ${col.name}`);
    } else {
      console.log(`ℹ️  Column ${col.name} already exists`);
    }
  } catch (error) {
    console.error(`❌ Error adding column ${col.name}:`, error);
  }
}

console.log('\n✅ Schema fix complete!');

