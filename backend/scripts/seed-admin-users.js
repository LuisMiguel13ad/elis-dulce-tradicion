/**
 * Admin User Seeding Script
 * 
 * This script creates initial owner and front desk accounts in Supabase.
 * Run this after setting up the database schema.
 * 
 * Usage:
 *   node backend/scripts/seed-admin-users.js
 * 
 * Environment Variables Required:
 *   SUPABASE_URL=https://your-project-id.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nGet these from: Supabase Dashboard > Settings > API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Create an admin user (owner or front desk)
 */
async function createAdminUser(email, password, fullName, role, phone = null) {
  try {
    console.log(`\n📝 Creating ${role} account: ${email}`);

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find((u) => u.email === email);

    if (existingUser) {
      console.log(`⚠️  User ${email} already exists. Updating profile...`);

      // Update profile role
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          role,
          full_name: fullName,
          phone,
        })
        .eq('id', existingUser.id);

      if (profileError) {
        console.error(`❌ Error updating profile:`, profileError);
        return { success: false, error: profileError.message };
      }

      console.log(`✅ Profile updated successfully`);
      return { success: true, userId: existingUser.id };
    }

    // Create new user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        phone,
      },
    });

    if (authError) {
      console.error(`❌ Error creating user:`, authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'User creation returned no user data' };
    }

    // Update profile with role (trigger should create it, but we'll update it)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        role,
        full_name: fullName,
        phone,
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error(`❌ Error updating profile:`, profileError);
      // User was created but profile update failed - this is recoverable
      console.log(`⚠️  User created but profile update failed. You may need to update manually.`);
    }

    console.log(`✅ ${role} account created successfully`);
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${email}`);

    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error(`❌ Unexpected error:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Main seeding function
 */
async function seedAdminUsers() {
  console.log('🌱 Starting admin user seeding...\n');

  // Default admin users to create
  // Modify these as needed
  const adminUsers = [
    {
      email: 'owner@elisbakery.com',
      password: 'ChangeThisPassword123!',
      fullName: 'Eli (Owner)',
      role: 'owner',
      phone: '+1 (610) 910-9067',
    },
    {
      email: 'baker@elisbakery.com',
      password: 'ChangeThisPassword123!',
      fullName: 'Front Desk',
      role: 'baker',
      phone: null,
    },
  ];

  const results = [];

  for (const user of adminUsers) {
    const result = await createAdminUser(
      user.email,
      user.password,
      user.fullName,
      user.role,
      user.phone
    );
    results.push({ ...user, ...result });
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Seeding Summary');
  console.log('='.repeat(50));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`✅ Successful: ${successful.length}`);
  successful.forEach((r) => {
    console.log(`   - ${r.email} (${r.role})`);
  });

  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}`);
    failed.forEach((r) => {
      console.log(`   - ${r.email}: ${r.error}`);
    });
  }

  console.log('\n⚠️  IMPORTANT: Change the default passwords immediately!');
  console.log('   These are temporary passwords for initial setup.\n');

  if (failed.length > 0) {
    process.exit(1);
  }
}

// Run the seeding
seedAdminUsers().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

