/**
 * Front Desk User Seeding Script
 *
 * Creates the front desk (baker) account for order management.
 *
 * Usage:
 *   node backend/scripts/seed-frontdesk-user.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });
// Also load backend .env for service role key
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  if (!supabaseUrl) console.error('   SUPABASE_URL or VITE_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nGet these from: Supabase Dashboard > Settings > API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const FRONT_DESK_USER = {
  email: 'orders@elisbakery.com',
  password: 'OrdersElisBakery123',
  fullName: 'Front Desk',
  role: 'baker',
};

async function createFrontDeskUser() {
  console.log('🏪 Creating Front Desk account...\n');

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === FRONT_DESK_USER.email);

    if (existingUser) {
      console.log(`⚠️  User ${FRONT_DESK_USER.email} already exists. Updating password and role...`);

      // Update password
      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password: FRONT_DESK_USER.password,
      });

      if (authUpdateError) {
        console.error('❌ Error updating password:', authUpdateError.message);
        process.exit(1);
      }
      console.log('✅ Password updated');

      // Update profile role
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          role: FRONT_DESK_USER.role,
          full_name: FRONT_DESK_USER.fullName,
        })
        .eq('user_id', existingUser.id);

      if (profileError) {
        console.error('❌ Error updating profile:', profileError.message);
        process.exit(1);
      }

      console.log('✅ Profile updated successfully');
      console.log(`   User ID: ${existingUser.id}`);
      console.log(`   Email: ${FRONT_DESK_USER.email}`);
      console.log(`   Role: ${FRONT_DESK_USER.role}`);
      return;
    }

    // Create new user with auto-confirmed email
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: FRONT_DESK_USER.email,
      password: FRONT_DESK_USER.password,
      email_confirm: true,
      user_metadata: {
        full_name: FRONT_DESK_USER.fullName,
      },
    });

    if (authError) {
      console.error('❌ Error creating user:', authError.message);
      process.exit(1);
    }

    if (!authData.user) {
      console.error('❌ User creation returned no user data');
      process.exit(1);
    }

    console.log(`✅ Auth user created: ${authData.user.id}`);

    // Wait briefly for the database trigger to create the profile row
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update profile with baker role
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        role: FRONT_DESK_USER.role,
        full_name: FRONT_DESK_USER.fullName,
      })
      .eq('user_id', authData.user.id);

    if (profileError) {
      console.error('❌ Error updating profile:', profileError.message);
      console.log('⚠️  User was created but role update failed.');
      console.log('   You may need to update the role manually in Supabase Dashboard.');
      process.exit(1);
    }

    console.log('\n✅ Front Desk account created successfully!');
    console.log('='.repeat(45));
    console.log(`   Email:    ${FRONT_DESK_USER.email}`);
    console.log(`   Role:     ${FRONT_DESK_USER.role}`);
    console.log(`   Dashboard: /front-desk`);
    console.log('='.repeat(45));
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

createFrontDeskUser();
