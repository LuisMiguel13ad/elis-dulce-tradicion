
-- SECURING PRODUCTION: Remove temporary debug access
DROP POLICY IF EXISTS "Enable select for public debug" ON orders;

-- Ensure Authenticated Access is confirmed
-- (This policy already exists but re-asserting for clarity in migration log)
-- POLICY: "Enable select for authenticated users" should exist.
