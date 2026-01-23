
-- Enable RLS on user_profiles (already enabled, but good practice to ensure)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON user_profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON user_profiles FOR UPDATE
TO authenticated 
USING (auth.uid() = user_id);

-- Allow users to insert their own profile (if needed during signup)
CREATE POLICY "Users can insert own profile" 
ON user_profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);
