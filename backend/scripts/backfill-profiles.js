
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

async function backfillProfiles() {
    console.log('🔧 Backfilling user_profiles...');

    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        console.error('Auth Error:', authError);
        return;
    }

    const targets = [
        { email: 'info@elisbakery.com', role: 'owner', name: 'Elis Owner' },
        { email: 'orders@elisbakery.com', role: 'baker', name: 'Front Desk' }
    ];

    for (const target of targets) {
        const user = users.find(u => u.email === target.email);
        if (!user) {
            console.log(`⚠️ User ${target.email} not found in Auth.`);
            continue;
        }

        console.log(`Processing ${target.email} (ID: ${user.id})...`);

        // Check availability in user_profiles by user_id
        const { data: existing, error: checkError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (existing) {
            console.log(`✅ Profile already exists for ${target.email}. Updating role...`);
            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({ role: target.role, full_name: target.name })
                .eq('user_id', user.id);

            if (updateError) console.error('❌ Update failed:', updateError);
            continue;
        }

        // Insert new profile
        console.log(`➕ Creating profile for ${target.email}...`);
        const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
                user_id: user.id,
                role: target.role,
                full_name: target.name,
                preferred_language: 'en'
            });

        if (insertError) {
            console.error('❌ Insert failed:', insertError);
        } else {
            console.log('✅ Profile created successfully.');
        }
    }
}

backfillProfiles();
