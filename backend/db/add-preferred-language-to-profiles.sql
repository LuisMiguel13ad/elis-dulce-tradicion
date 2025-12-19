-- =====================================================
-- Add preferred_language column to profiles table
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Add preferred_language column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'es';

-- Add comment
COMMENT ON COLUMN public.profiles.preferred_language IS 'User language preference: en (English) or es (Spanish). Default: es';

-- Create index for better query performance (optional)
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language ON public.profiles(preferred_language);

-- =====================================================
-- Notes:
-- =====================================================
-- Values: 'en' (English), 'es' (Spanish)
-- Default: 'es' (Spanish)
-- Used to:
--   - Auto-detect language on signup
--   - Set default language for email notifications
--   - Persist user language preference across sessions
-- =====================================================
