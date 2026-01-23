
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

async function runSecurityMigration() {
    const client = await pool.connect();
    try {
        console.log('🔒 Securing Database for Production...');
        const migrationPath = join(__dirname, '../migrations/006_secure_production.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await client.query(sql);
        console.log('✅ Temporary Public Access REMOVED.');
        console.log('🛡️  RLS is back to strict "Authenticated Only" mode.');

    } catch (err) {
        console.error('Error securing DB:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runSecurityMigration();
