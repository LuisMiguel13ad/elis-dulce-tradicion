
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;
const connectionString = 'postgresql://postgres:EizDEduGT9zuWbZ1@db.rnszrscxwkdwvvlsihqc.supabase.co:5432/postgres';

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkOrderDetails() {
    const client = await pool.connect();
    try {
        console.log('🔌 Connected to Postgres');

        console.log('\n--- RECENT ORDERS DETAILED (Last 5) ---');
        const orders = await client.query(`
      SELECT 
        id, 
        order_number, 
        customer_name, 
        status, 
        payment_status, 
        date_needed, 
        time_needed,
        delivery_option,
        created_at
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

        if (orders.rows.length === 0) console.log('No orders found.');
        console.table(orders.rows);

    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkOrderDetails();
