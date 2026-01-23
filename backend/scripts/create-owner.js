
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

async function createOwner() {
    const email = 'info@elisbakery.com';
    const password = 'ElisBakery123';

    console.log(`👤 Creating Owner Account: ${email}...`);

    // Check if user exists first to avoid error spam
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existing = users.find(u => u.email === email);

    if (existing) {
        console.log('⚠️  User already exists. Updating password and role...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            existing.id,
            {
                password: password,
                user_metadata: { role: 'owner', name: 'Elis Owner' },
                email_confirm: true
            }
        );

        if (updateError) {
            console.error('❌ Failed to update user:', updateError);
        } else {
            console.log('✅ User updated successfully.');
        }
        return;
    }

    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm
        user_metadata: {
            role: 'owner',
            name: 'Elis Owner'
        }
    });

    if (error) {
        console.error('❌ Error creating user:', error);
    } else {
        console.log(`✅ Success! Created Owner ID: ${data.user.id}`);
        console.log(`🔑 Credentials:\nEmail: ${email}\nPassword: ${password}`);
    }
}

createOwner();
