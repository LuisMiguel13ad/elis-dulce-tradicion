import db from './sqlite-connection.js';

console.log('🔧 Initializing SQLite database...\n');

// Create orders table
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    date_needed TEXT NOT NULL,
    time_needed TEXT NOT NULL,
    cake_size TEXT NOT NULL,
    filling TEXT NOT NULL,
    theme TEXT NOT NULL,
    dedication TEXT,
    reference_image_path TEXT,
    delivery_option TEXT NOT NULL,
    delivery_address TEXT,
    delivery_apartment TEXT,
    square_payment_id TEXT,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

console.log('✅ Orders table created');

// Create payments table
db.exec(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    square_payment_id TEXT UNIQUE NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL,
    currency TEXT DEFAULT 'USD',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id)
  )
`);

console.log('✅ Payments table created');

// Create order status history table
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

console.log('✅ Order status history table created');

// Insert test data
console.log('\n📦 Adding test data...\n');

const testOrders = [
  {
    order_number: 'ORD-20250117-000001',
    customer_name: 'María González',
    customer_email: 'maria@example.com',
    customer_phone: '610-555-0101',
    date_needed: '2025-01-20',
    time_needed: '14:00',
    cake_size: '10 inches',
    filling: 'Tres Leches Vanilla',
    theme: 'Birthday',
    dedication: '¡Feliz Cumpleaños María!',
    delivery_option: 'pickup',
    delivery_address: '',
    delivery_apartment: '',
    total_amount: 45.00,
    status: 'confirmed',
    payment_status: 'paid',
    square_payment_id: 'test-payment-001'
  },
  {
    order_number: 'ORD-20250117-000002',
    customer_name: 'John Smith',
    customer_email: 'john@example.com',
    customer_phone: '610-555-0102',
    date_needed: '2025-01-22',
    time_needed: '16:00',
    cake_size: '8 inches',
    filling: 'Red Velvet',
    theme: 'Wedding',
    dedication: 'Congratulations!',
    delivery_option: 'delivery',
    delivery_address: '123 Main St, Bensalem, PA',
    delivery_apartment: 'Apt 2B',
    total_amount: 65.00,
    status: 'pending',
    payment_status: 'paid',
    square_payment_id: 'test-payment-002'
  },
  {
    order_number: 'ORD-20250117-000003',
    customer_name: 'Ana Rodriguez',
    customer_email: 'ana@example.com',
    customer_phone: '610-555-0103',
    date_needed: '2025-01-25',
    time_needed: '18:00',
    cake_size: '12 inches',
    filling: 'Chocolate',
    theme: 'Quinceañera',
    dedication: 'Felices 15 años',
    delivery_option: 'pickup',
    delivery_address: '',
    delivery_apartment: '',
    total_amount: 95.00,
    status: 'in_progress',
    payment_status: 'paid',
    square_payment_id: 'test-payment-003'
  }
];

const insertOrder = db.prepare(`
  INSERT INTO orders (
    order_number, customer_name, customer_email, customer_phone,
    date_needed, time_needed, cake_size, filling, theme, dedication,
    delivery_option, delivery_address, delivery_apartment,
    square_payment_id, total_amount, status, payment_status
  ) VALUES (
    @order_number, @customer_name, @customer_email, @customer_phone,
    @date_needed, @time_needed, @cake_size, @filling, @theme, @dedication,
    @delivery_option, @delivery_address, @delivery_apartment,
    @square_payment_id, @total_amount, @status, @payment_status
  )
`);

try {
  for (const order of testOrders) {
    insertOrder.run(order);
    console.log(`✅ Added order: ${order.order_number} - ${order.customer_name}`);
  }
} catch (error) {
  if (error.message.includes('UNIQUE constraint failed')) {
    console.log('ℹ️  Test orders already exist, skipping...');
  } else {
    console.error('Error adding test data:', error);
  }
}

console.log('\n✅ Database initialization complete!');
console.log(`📊 Database location: ${db.name}\n`);

// Close database
db.close();

