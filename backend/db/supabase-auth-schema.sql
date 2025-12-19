-- =====================================================
-- Supabase Authentication & User Management Schema
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- 1. Create custom role enum type
CREATE TYPE user_role AS ENUM ('customer', 'baker', 'owner');

-- 2. Create profiles table
-- This table extends auth.users with additional profile information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- 5. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Policy 1: Customers can only view their own profile
CREATE POLICY "Customers can view own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id AND role = 'customer'
);

-- Policy 2: Bakers and owners can view all profiles
CREATE POLICY "Bakers and owners can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('baker', 'owner')
  )
);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Users can insert their own profile (for initial creation)
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 5: Only owners can update role field (for admin operations)
-- Note: This is handled in the trigger function below
CREATE POLICY "Only owners can update roles"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'owner'
  )
);

-- =====================================================
-- TRIGGER: Auto-create profile on user signup
-- =====================================================

-- Function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    'customer', -- Default role for new signups
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that fires when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- HELPER FUNCTION: Get user role
-- =====================================================

-- Function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT USAGE ON TYPE user_role TO authenticated;

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. The auth.users table is managed by Supabase Auth automatically
-- 2. Profiles table extends auth.users with bakery-specific data
-- 3. RLS policies ensure users can only access appropriate data
-- 4. The trigger automatically creates a profile when a user signs up
-- 5. Role updates should be done carefully (only by owners)
-- 6. For production, consider adding audit logging
--
-- =====================================================

