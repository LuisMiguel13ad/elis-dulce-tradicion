-- Add index for faster profile lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles (user_id);
