
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const { Pool } = pg;
const connectionString = 'postgresql://postgres:EizDEduGT9zuWbZ1@db.rnszrscxwkdwvvlsihqc.supabase.co:5432/postgres';

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function inspectPolicies() {
    const client = await pool.connect();
    try {
        console.log('🔍 Fetching Policy Definitions...');
        const result = await client.query(`
      select
        schemaname,
        tablename,
        policyname,
        roles,
        cmd,
        qual,
        with_check
      from
        pg_policies
      where
        tablename = 'orders';
    `);

        console.table(result.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

inspectPolicies();
