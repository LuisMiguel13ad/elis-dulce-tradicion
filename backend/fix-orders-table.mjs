import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:EizDEduGT9zuWbZ1@db.rnszrscxwkdwvvlsihqc.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fixOrdersTable() {
  const client = await pool.connect();

  try {
    console.log('Fixing orders table...\n');

    // Check current columns
    const cols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'orders' ORDER BY ordinal_position
    `);
    console.log('Current columns:', cols.rows.map(r => r.column_name));

    // Add missing columns
    const columnsToAdd = [
      "user_id UUID",
      "square_payment_id VARCHAR(255)",
      "payment_id VARCHAR(255)",
      "cake_size VARCHAR(100)",
      "filling VARCHAR(100)",
      "theme VARCHAR(100)",
      "dedication TEXT",
      "time_needed TIME",
      "delivery_address TEXT",
      "delivery_instructions TEXT"
    ];

    console.log('\nAdding missing columns...');
    for (const col of columnsToAdd) {
      const colName = col.split(' ')[0];
      try {
        await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS ' + col);
        console.log('  ✓ Added ' + colName);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log('  - ' + colName + ' already exists');
        } else {
          console.log('  ⚠ ' + colName + ': ' + err.message.substring(0, 60));
        }
      }
    }

    // Verify columns
    const newCols = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'orders' ORDER BY ordinal_position
    `);
    console.log('\nUpdated columns:', newCols.rows.map(r => r.column_name));

    console.log('\n✅ Orders table fixed!');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixOrdersTable();
