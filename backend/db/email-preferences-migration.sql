-- =====================================================
-- Email Preferences Migration
-- =====================================================
-- Add email notification preferences to profiles table
-- =====================================================

-- Add email notification preferences columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_order_updates BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_ready_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_promotions BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.email_notifications_enabled IS 'Master toggle for all email notifications';
COMMENT ON COLUMN public.profiles.email_order_updates IS 'Receive emails when order status changes';
COMMENT ON COLUMN public.profiles.email_ready_notifications IS 'Receive email when order is ready';
COMMENT ON COLUMN public.profiles.email_promotions IS 'Receive promotional emails (optional)';

-- Update RLS policies to allow users to update their own email preferences
-- (This is already covered by the existing "Users can update own profile" policy)

-- =====================================================
-- Notes:
-- =====================================================
-- 1. All preferences default to true (except promotions)
-- 2. Users can update their preferences via profile settings
-- 3. Edge functions should check these preferences before sending emails
-- 4. Master toggle (email_notifications_enabled) overrides all others
--
-- =====================================================
