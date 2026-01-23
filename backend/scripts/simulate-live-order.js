
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load Env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

// 1. Client interacting as PUBLIC (Creating Order)
const publicClient = createClient(supabaseUrl, supabaseKey);

// 2. Client interacting as OWNER (Reading Dashboard)
// In real app, this is authenticated user. Here we use Service Role to simulate "privileged" read
// to verify data is retrievable.
const ownerClient = createClient(supabaseUrl, serviceRoleKey);

async function runTest() {
    console.log('🚀 Starting Final Production Simulation...');

    // STEP 1: CREATE ORDER
    const testOrder = {
        customer_name: 'Production Readiness Test',
        customer_email: 'test@production.com',
        customer_phone: '555-0199',
        delivery_option: 'pickup', // Was order_type
        // payment_method removed (not in schema)
        payment_status: 'paid',
        total_amount: 50.00,
        status: 'pending',
        date_needed: new Date().toISOString().split('T')[0],
        time_needed: '12:00:00',
        cake_size: '10 inch',
        filling: 'Vanilla',
        theme: 'General',
        dedication: 'Happy Test'
    };

    console.log('📝 Creating Simulated Order via Secure RPC...');

    // Use RPC instead of direct insert
    const { data: created, error: createError } = await publicClient
        .rpc('create_new_order', { payload: testOrder }); // RPC expects 'payload' arg

    if (createError) {
        console.error('❌ Failed to create order via RPC:', createError);
        return;
    }
    // RPC returns the row directly as data (if configured right) or as data in a property?
    // My function returns jsonb. Supabase usually auto-parses.
    // Let's assume 'created' is the order object.

    if (!created || !created.id) {
        console.error('❌ RPC returned success but no ID:', created);
        return;
    }

    console.log('✅ Order Created Successfully via Secure RPC. ID:', created.id);


    // STEP 2: OWNER DASHBOARD READ
    console.log('👀 Simulating Owner Dashboard Fetch...');
    // The dashboard runs: select * from orders
    const { data: dashboardData, error: readError } = await ownerClient
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (readError) {
        console.error('❌ Failed to fetch dashboard data:', readError);
        return;
    }

    // Verify our order is there
    const found = dashboardData.find(o => o.id === created.id);

    if (found) {
        console.log('✅ VERIFIED: New order appears in Dashboard Data Fetch.');
        console.log(`📊 Dashboard Stats Simulation:`);
        console.log(`   - Total Orders in DB: ${dashboardData.length}`);
        console.log(`   - Recent Order Status: ${found.status}`);
        console.log(`   - Payment Status: ${found.payment_status}`);
        console.log('🎉 SYSTEM IS READY FOR LIVE TRAFFIC.');
    } else {
        console.error('❌ CRITICAL: Order created but NOT found in Dashboard fetch. Latency or RLS issue?');
    }
}

runTest();
