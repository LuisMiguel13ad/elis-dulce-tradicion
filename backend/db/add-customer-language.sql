-- =====================================================
-- Add customer_language column to orders table
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Add customer_language column if it doesn't exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS customer_language VARCHAR(10) DEFAULT 'en';

-- Add comment
COMMENT ON COLUMN orders.customer_language IS 'Customer language preference: en, es, or spanish';

-- Create index for better query performance (optional)
CREATE INDEX IF NOT EXISTS idx_orders_customer_language ON orders(customer_language);

-- =====================================================
-- Notes:
-- =====================================================
-- Values: 'en' (English), 'es' (Spanish), 'spanish' (also Spanish)
-- Default: 'en' (English)
-- Used by email notifications to send bilingual emails
--
-- =====================================================
