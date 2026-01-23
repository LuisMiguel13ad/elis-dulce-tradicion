
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

        // Read the migration file
        const migrationPath = join(__dirname, '../migrations/004_fix_rls_policies.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Applying RLS policies...');
        // Drop existing policies first to ideally be idempotent? 
        // "CREATE POLICY" fails if exists. 
        // Let's wrap in a do block or just ignore "already exists" errors by simple try/catch on individual statements if we were advanced,
        // but here we'll just run it. If it fails, we might need to DROP POLICY IF EXISTS.

        // Improved SQL script to handle "IF NOT EXISTS" logic manually by dropping first
        const safeSql = `
      DROP POLICY IF EXISTS "Enable insert for everyone" ON orders;
      DROP POLICY IF EXISTS "Enable select for authenticated users" ON orders;
      DROP POLICY IF EXISTS "Enable update for authenticated users" ON orders;
      ${sql}
    `;

        await client.query(safeSql);

        console.log('✅ RLS Policies Applied Successfully');

    } catch (err) {
        console.error('Error running migration:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
