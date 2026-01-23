
import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

// Hardcoded for reliability during this fix
const connectionString = 'postgresql://postgres:EizDEduGT9zuWbZ1@db.rnszrscxwkdwvvlsihqc.supabase.co:5432/postgres';

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('🔌 Connected to Postgres');

        const migrationPath = join(__dirname, '../migrations/003_create_failed_payments.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running migration...');
        await client.query(sql);

        console.log('✅ Migration applied: failed_payments table created');

    } catch (err) {
        console.error('Error running migration:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
