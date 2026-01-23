
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

// Hardcoded for temporary verification script
const connectionString = 'postgresql://postgres:EizDEduGT9zuWbZ1@db.rnszrscxwkdwvvlsihqc.supabase.co:5432/postgres';

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkActivity() {
    const client = await pool.connect();
    try {
        console.log('🔌 Connected to Postgres');

        // Check for failed_payments table
        const tableCheck = await client.query("SELECT to_regclass('public.failed_payments') as table_exists");
        const failedPaymentsExists = !!tableCheck.rows[0].table_exists;
        console.log(`📋 failed_payments table exists: ${failedPaymentsExists}`);

        console.log('\n--- RECENT ORDERS (Last 5) ---');
        const orders = await client.query('SELECT id, order_number, customer_name, total_amount, status, payment_status, created_at FROM orders ORDER BY created_at DESC LIMIT 5');
        if (orders.rows.length === 0) console.log('No orders found.');
        orders.rows.forEach(o => {
            console.log(`[${o.created_at}] ${o.order_number} - ${o.customer_name} ($${o.total_amount}) [${o.status}/${o.payment_status}]`);
        });

        console.log('\n--- RECENT PAYMENTS (Last 5) ---');
        const payments = await client.query('SELECT * FROM payments ORDER BY created_at DESC LIMIT 5');
        if (payments.rows.length === 0) console.log('No payments found.');
        payments.rows.forEach(p => {
            console.log(`[${p.created_at}] Order ID: ${p.order_id} - Amount: ${p.amount} ${p.currency} - Status: ${p.status}`);
        });

        if (failedPaymentsExists) {
            console.log('\n--- FAILED PAYMENTS (Last 5) ---');
            const failed = await client.query('SELECT * FROM failed_payments ORDER BY created_at DESC LIMIT 5');
            if (failed.rows.length === 0) console.log('No failed payments logged.');
            failed.rows.forEach(f => {
                console.log(`[${f.created_at}] ${f.amount} - Error: ${f.error_message}`);
            });
        }

    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkActivity();
