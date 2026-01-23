
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

async function checkRLS() {
    const client = await pool.connect();
    try {
        console.log('🔌 Connected to Postgres');

        // 1. Check if RLS is enabled on orders
        const rlsCheck = await client.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      WHERE relname = 'orders';
    `);
        console.log('\n--- RLS STATUS ---');
        console.table(rlsCheck.rows);

        // 2. List all policies on orders table
        const policies = await client.query(`
      SELECT *
      FROM pg_policies
      WHERE tablename = 'orders';
    `);
        console.log('\n--- POLICIES ---');
        if (policies.rows.length === 0) {
            console.log('Use of RLS is ENABLED but NO POLICIES exist (Default: Deny All).');
        } else {
            policies.rows.forEach(p => {
                console.log(`Policy: ${p.policyname}`);
                console.log(`  Roles: ${p.roles}`);
                console.log(`  Cmd: ${p.cmd}`);
                console.log(`  Qual: ${p.qual}`);
                console.log(`  WithCheck: ${p.with_check}`);
                console.log('----------------');
            });
        }

        // 2b. Check policies on user_profiles
        const profilesPolicies = await client.query(`
          SELECT *
          FROM pg_policies
          WHERE tablename = 'user_profiles';
        `);
        console.log('\n--- POLICIES (user_profiles) ---');
        if (profilesPolicies.rows.length === 0) {
            console.log('Use of RLS is ENABLED but NO POLICIES exist (Default: Deny All).');
        } else {
            profilesPolicies.rows.forEach(p => {
                console.log(`Policy: ${p.policyname}`);
                console.log(`  Roles: ${p.roles}`);
                console.log(`  Cmd: ${p.cmd}`);
                console.log(`  Qual: ${p.qual}`);
                console.log(`  WithCheck: ${p.with_check}`);
                console.log('----------------');
            });
        }

        // 3. User Roles Check (Sample)
        console.log('\n--- USER ROLES SAMPLE ---');
        // If we have access to auth.users (often restricted even for postgres role on some managed instances, but worth a try)
        try {
            const users = await client.query('SELECT id, email, role FROM auth.users LIMIT 5');
            users.rows.forEach(u => console.log(`${u.email} - Role: ${u.role}`));
        } catch (e) {
            console.log('Could not list auth.users (permission denied or different schema).');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkRLS();
