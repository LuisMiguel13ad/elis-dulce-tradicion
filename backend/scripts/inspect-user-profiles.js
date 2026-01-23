
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspectContents() {
    console.log('🔍 Inspecting Table Contents...');

    console.log('\n--- PROFILES Table ---');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(5);
    if (pError) console.error('Error:', pError.message, pError.code);
    else console.log('Rows:', profiles);

    console.log('\n--- USER_PROFILES Table ---');
    const { data: userProfiles, error: upError } = await supabase.from('user_profiles').select('*').limit(5);
    if (upError) console.error('Error:', upError.message, upError.code);
    else console.log('Rows:', userProfiles);

    // Check for our specific user
    const email = 'info@elisbakery.com';
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (user) {
        console.log(`\nChecking for User ID: ${user.id} (${email})`);

        const { data: pUser } = await supabase.from('profiles').select('*').eq('id', user.id);
        console.log('In profiles:', pUser);

        const { data: upUser } = await supabase.from('user_profiles').select('*').eq('id', user.id);
        console.log('In user_profiles:', upUser);
    }
}

inspectContents();
