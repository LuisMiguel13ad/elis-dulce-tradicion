# Supabase Authentication Setup Guide

This guide will help you set up Supabase Authentication for your bakery order system.

## Prerequisites

1. A Supabase project (create one at https://supabase.com)
2. Your Supabase project URL and service role key

## Step 1: Environment Variables

Add these to your `.env` file (and `.env.production` for production):

```env
# Frontend (required)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Backend (for admin operations and seeding)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

You can find these in your Supabase Dashboard:
- Go to Settings > API
- Copy the "Project URL" → `VITE_SUPABASE_URL` / `SUPABASE_URL`
- Copy the "anon public" key → `VITE_SUPABASE_ANON_KEY`
- Copy the "service_role" key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 2: Run Database Schema

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New query"**
4. Copy and paste the contents of `backend/db/supabase-auth-schema.sql`
5. Click **"Run"** to execute

This will create:
- ✅ `profiles` table with role enum
- ✅ Row Level Security (RLS) policies
- ✅ Trigger to auto-create profiles on signup
- ✅ Helper functions

## Step 3: Configure Supabase Auth Settings

1. Go to **Authentication** > **Settings** in your Supabase Dashboard
2. Configure the following:

   **Email Auth:**
   - ✅ Enable "Enable email confirmations" (recommended for production)
   - For development, you can disable this temporarily

   **Site URL:**
   - Set to your frontend URL (e.g., `http://localhost:5178` for dev)
   - Add redirect URLs for production

   **Email Templates:**
   - Customize confirmation and password reset emails (optional)

## Step 4: Seed Admin Users

Run the seeding script to create initial owner and baker accounts:

```bash
node backend/scripts/seed-admin-users.js
```

This will create:
- Owner account: `owner@elisbakery.com`
- Baker account: `baker@elisbakery.com`

**⚠️ IMPORTANT:** Change the default passwords immediately after first login!

To customize the accounts, edit `backend/scripts/seed-admin-users.js` before running.

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/signup` to create a customer account
3. Navigate to `/login` to sign in
4. Test role-based access:
   - Customer → Should see public pages only
   - Baker → Should access `/kitchen-display` and `/bakery-dashboard`
   - Owner → Should access all dashboards

## User Roles

### Customer (default)
- Can place orders
- Can view their own orders
- Cannot access admin dashboards

### Baker
- Can view kitchen display
- Can update order statuses
- Can view bakery dashboard
- Cannot access owner dashboard

### Owner
- Full access to all dashboards
- Can manage products
- Can view all orders and metrics
- Can update user roles (via database)

## Route Protection

Routes are protected using the `ProtectedRoute` component:

```tsx
<ProtectedRoute requiredRole="owner">
  <OwnerDashboard />
</ProtectedRoute>
```

- `/owner-dashboard` - Requires `owner` role
- `/kitchen-display` - Requires `baker` or `owner` role
- `/bakery-dashboard` - Requires `baker` or `owner` role

## Updating User Roles

To change a user's role, you can:

1. **Via Supabase Dashboard:**
   - Go to Table Editor > `profiles`
   - Find the user and update the `role` field

2. **Via SQL:**
   ```sql
   UPDATE profiles
   SET role = 'baker'
   WHERE id = 'user-uuid-here';
   ```

3. **Via Backend API (future enhancement):**
   - Create an admin endpoint that only owners can access

## Troubleshooting

### "Supabase is not configured" error
- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart your dev server after adding environment variables

### "Profile not found" error
- The trigger should auto-create profiles, but if it fails:
  ```sql
  INSERT INTO profiles (id, role, full_name)
  VALUES (auth.uid(), 'customer', 'User Name');
  ```

### RLS Policy Errors
- Make sure RLS is enabled: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`
- Verify policies are created correctly
- Check that user is authenticated: `SELECT auth.uid();`

### Email Confirmation Issues
- For development, disable email confirmation in Auth settings
- Or use the service role key to auto-confirm users in the seeding script

### Role Not Working
- Verify the profile exists and has the correct role
- Check that the user is signed in: `SELECT * FROM auth.users;`
- Verify RLS policies allow the operation

## Security Best Practices

1. **Never expose service role key** in frontend code
2. **Use RLS policies** to enforce data access at the database level
3. **Validate roles** on both frontend and backend
4. **Use HTTPS** in production
5. **Enable email confirmation** in production
6. **Implement rate limiting** for auth endpoints
7. **Use strong passwords** and consider password policies

## Next Steps

- [ ] Set up password reset flow (`/forgot-password`)
- [ ] Add email verification flow
- [ ] Implement profile editing page
- [ ] Add admin user management interface
- [ ] Set up audit logging for role changes
- [ ] Add two-factor authentication (optional)

## Files Reference

- **Schema**: `backend/db/supabase-auth-schema.sql`
- **Auth Context**: `src/contexts/AuthContext.tsx`
- **Protected Routes**: `src/components/auth/ProtectedRoute.tsx`
- **Login Page**: `src/pages/Login.tsx`
- **Signup Page**: `src/pages/Signup.tsx`
- **Seeding Script**: `backend/scripts/seed-admin-users.js`
- **Types**: `src/types/auth.ts`

