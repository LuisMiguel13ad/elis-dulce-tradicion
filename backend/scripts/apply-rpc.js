
import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;
const connectionString = 'postgresql://postgres:EizDEduGT9zuWbZ1@db.rnszrscxwkdwvvlsihqc.supabase.co:5432/postgres';

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('🛡️  Applying Secure RPC Functions...');
        const migrationPath = join(__dirname, '../migrations/007_secure_rpc.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await client.query(sql);
        console.log('✅ Secure Functions Created.');

    } catch (err) {
        console.error('Error applying migration:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
