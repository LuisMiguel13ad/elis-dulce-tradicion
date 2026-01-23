
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') }); // Root .env
dotenv.config({ path: path.join(__dirname, '../.env') }); // Backend .env

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing credentials');
    process.exit(1);
}

// Admin client to manage users
const adminClient = createClient(supabaseUrl, serviceRoleKey);

// Public client to simulate frontend login
const publicClient = createClient(supabaseUrl, anonKey);

async function verifyOwnerAccess() {
    console.log('🕵️ Verifying REAL Owner Access...');

    const email = `test-owner-${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    // 1. Create User (Admin side)
    console.log(`Creating test user: ${email}`);
    const { data: user, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'owner' }
    });

    if (createError) {
        console.error('Failed to create user:', createError);
        return;
    }

    // 2. Sign In (Frontend side)
    console.log('Simulating Login...');
    const { data: sessionData, error: loginError } = await publicClient.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error('Login failed:', loginError);
        return;
    }

    console.log('✅ Login Successful. Token received.');

    // 3. Fetch Orders as this user
    console.log('Fetching orders with User Token...');
    const clientWithAuth = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${sessionData.session.access_token}` } }
    });

    const { data: orders, error: fetchError } = await clientWithAuth
        .from('orders')
        .select('*')
        .limit(5);

    if (fetchError) {
        console.error('❌ Fetch failed (Access Denied):', fetchError);
    } else {
        console.log(`✅ Fetch query executed. Found ${orders.length} orders.`);
        if (orders.length === 0) {
            console.warn('⚠️  Query success but 0 orders returned. (Are there any orders in DB?)');
        }
    }

    // Cleanup
    await adminClient.auth.admin.deleteUser(user.user.id);
}

verifyOwnerAccess();
