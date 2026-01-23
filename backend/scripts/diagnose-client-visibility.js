
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: join(__dirname, '../../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://rnszrscxwkdwvvlsihqc.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseVisibility() {
    console.log('🕵️‍♀️ Diagnosing Client-Side Visibility...');
    console.log(`Target: ${supabaseUrl}`);

    // Test 1: Public access (Anon)
    // We expect this to FAIL or return 0 rows if RLS is correct for dashboard (but might work if I enabled public read)
    // Wait, I enabled "Enable insert for everyone" but "Enable select for authenticated users".
    // So anon keys should NOT see orders.

    const { data: anonData, error: anonError } = await supabase
        .from('orders')
        .select('id, order_number')
        .limit(5);

    console.log('\n--- ANON KEY TEST ---');
    if (anonError) console.log('Error:', anonError.message);
    else console.log(`Rows returned: ${anonData?.length} (If 0, this is GOOD for privacy, unless you want public tracking)`);

    // Test 2: Service Role access (Bypass RLS)
    // This verifies connectivity and data existence via API (not just direct PG)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
        console.log('Skipping Service Role test (key not found in .env)');
    } else {
        const adminClient = createClient(supabaseUrl, serviceKey);
        const { data: adminData, error: adminError } = await adminClient
            .from('orders')
            .select('id, order_number')
            .limit(5);

        console.log('\n--- SERVICE ROLE TEST (Bypass RLS) ---');
        if (adminError) console.log('Error:', adminError.message);
        else console.log(`Rows returned: ${adminData?.length} (Should be > 0)`);
    }

    // Test 3: Authenticated User Simulation
    // We can't easily sign in as the user without password.
    // BUT we can inspect if the policy "Enable select for authenticated users" is actually working.
    // The only way to test "authenticated" is to have a valid session.
    // I will skip this unless I can generate a token, but I can't.

    console.log('\n--- DIAGNOSIS SUMMARY ---');
    console.log('If Service Role sees data but User doesn\'t, it is DEFINITELY RLS or Auth Context.');
}

diagnoseVisibility();
