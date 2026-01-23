
-- TEMPORARY DEBUGGING POLICY
-- Allow public SELECT access to orders to rule out Auth issues.

-- Drop conflicting policies just in case (to be clean)
-- DROP POLICY IF EXISTS "Enable select for authenticated users" ON orders;

-- Create Public Access Policy
CREATE POLICY "Enable select for public debug" 
ON orders FOR SELECT 
TO public 
USING (true);
