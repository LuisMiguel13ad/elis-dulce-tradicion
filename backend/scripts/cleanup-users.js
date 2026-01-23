
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

async function cleanupUsers() {
    console.log('🧹 Cleaning up invalid users...');

    // invalid emails to remove
    const invalidEmails = [
        'owner@elisbakery.com',
        'baker@elisbakery.com',
        'owner@elisdulce.com',
        'baker@elisdulce.com'
    ];

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('❌ Error listing users:', error);
        return;
    }

    let count = 0;
    for (const user of users) {
        if (invalidEmails.includes(user.email)) {
            console.log(`🗑️ Deleting ${user.email} (ID: ${user.id})...`);
            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
            if (deleteError) {
                console.error(`❌ Failed to delete ${user.email}:`, deleteError.message);
            } else {
                console.log(`✅ Deleted ${user.email}`);
                count++;
            }
        }
    }

    console.log(`\nCleanup complete. Removed ${count} invalid users.`);

    // Verify remaining users
    console.log('\n--- REMAINING VALID USERS ---');
    const { data: { users: remaining } } = await supabase.auth.admin.listUsers();
    remaining.forEach(u => console.log(`✨ ${u.email} (${u.user_metadata?.role || 'no-role'})`));
}

cleanupUsers();
