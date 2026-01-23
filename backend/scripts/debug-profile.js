
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load keys
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkProfile() {
    console.log('🔍 Checking profile for info@elisbakery.com...');

    // 1. Get User ID from Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error('Auth Error:', authError);
        return;
    }

    const user = users.find(u => u.email === 'info@elisbakery.com');

    if (!user) {
        console.error('❌ User info@elisbakery.com NOT FOUND in Auth!');
        return;
    }

    console.log(`✅ Found Auth User. ID: ${user.id}`);
    console.log('   Metadata:', user.user_metadata);

    // 2. Get Profile from Public Table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
    } else if (!profile) {
        console.error('❌ No profile found in "profiles" table!');
    } else {
        console.log('✅ Found Profile:', profile);
    }

    // 3. Fix if mismatch
    if (profile && profile.role !== 'owner') {
        console.log('⚠️  MISMATCH DETECTED! Updating profile role to "owner"...');
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'owner' })
            .eq('id', user.id);

        if (updateError) {
            console.error('❌ Failed to update profile:', updateError);
        } else {
            console.log('✅ Profile updated successfully.');
        }
    }
}

checkProfile();
