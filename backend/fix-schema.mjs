import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:EizDEduGT9zuWbZ1@db.rnszrscxwkdwvvlsihqc.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fixSchema() {
  const client = await pool.connect();

  try {
    console.log('Fixing database schema...\n');

    // 1. Create user_profiles table
    console.log('Creating user_profiles table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL,
        full_name VARCHAR(255),
        phone VARCHAR(20),
        preferred_language VARCHAR(10) DEFAULT 'en',
        role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'baker', 'owner', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ user_profiles created');

    // 2. Create products table
    console.log('Creating products table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_en VARCHAR(255),
        name_es VARCHAR(255),
        description TEXT,
        description_en TEXT,
        description_es TEXT,
        category VARCHAR(100),
        base_price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ products created');

    // 3. Create inventory table
    console.log('Creating inventory table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        min_quantity DECIMAL(10, 2) DEFAULT 0,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ inventory created');

    // 4. Create capacity table
    console.log('Creating capacity table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS capacity (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        max_orders INTEGER DEFAULT 20,
        current_orders INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ capacity created');

    // 5. Create reviews table
    console.log('Creating reviews table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        user_id UUID,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        images TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ reviews created');

    // 6. Add missing columns to orders
    console.log('\nAdding missing columns to orders...');
    const orderColumns = [
      "customer_language VARCHAR(10) DEFAULT 'en'",
      "delivery_apartment VARCHAR(100)",
      "delivery_zone VARCHAR(100)",
      "delivery_status VARCHAR(50)",
      "reference_image_path TEXT",
      "ready_at TIMESTAMP",
      "completed_at TIMESTAMP",
      "time_to_confirm INTEGER",
      "time_to_ready INTEGER",
      "time_to_complete INTEGER",
      "consent_given BOOLEAN DEFAULT false",
      "consent_timestamp TIMESTAMP",
      "search_vector tsvector"
    ];

    for (const col of orderColumns) {
      const colName = col.split(' ')[0];
      try {
        await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS ' + col);
        console.log('  ✓ Added ' + colName);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log('  ⚠ ' + colName + ': ' + err.message.substring(0, 50));
        }
      }
    }

    // 7. Add indexes
    console.log('\nCreating indexes...');
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_orders_search ON orders USING GIN(search_vector)",
      "CREATE INDEX IF NOT EXISTS idx_orders_date_needed ON orders(date_needed)",
      "CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id)",
      "CREATE INDEX IF NOT EXISTS idx_capacity_date ON capacity(date)",
      "CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id)"
    ];

    for (const idx of indexes) {
      try {
        await client.query(idx);
        const match = idx.match(/idx_\w+/);
        console.log('  ✓ ' + (match ? match[0] : 'index'));
      } catch (err) {
        console.log('  ⚠ ' + err.message.substring(0, 50));
      }
    }

    // 8. Create error_logs table for error tracking
    console.log('\nCreating error_logs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id SERIAL PRIMARY KEY,
        error_code VARCHAR(100),
        message TEXT,
        stack TEXT,
        path VARCHAR(255),
        method VARCHAR(10),
        user_id UUID,
        ip VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ error_logs created');

    // Verify all tables
    const tables = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `);
    console.log('\n📊 All tables:', tables.rows.map(r => r.tablename));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixSchema();
