-- Migration: Security Enhancements
-- Description: Creates secure RPC function for order lookups and rate limiting tables
-- Date: 2026-02-06

-- ============================================
-- PAYMENT RATE LIMITING TABLE
-- ============================================

-- Create rate limiting table for payment requests
CREATE TABLE IF NOT EXISTS payment_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient rate limit checks
CREATE INDEX IF NOT EXISTS idx_payment_rate_limits_ip_time
ON payment_rate_limits(ip_address, created_at);

-- Enable RLS
ALTER TABLE payment_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for edge functions)
CREATE POLICY "Service role can manage payment rate limits" ON payment_rate_limits
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- SECURE ORDER LOOKUP
-- ============================================

-- Drop existing function if it exists (to allow re-running migration)
DROP FUNCTION IF EXISTS get_public_order(TEXT);

-- Create secure order lookup function
-- This function returns limited data and masks sensitive PII
CREATE OR REPLACE FUNCTION get_public_order(p_order_number TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Validate input
  IF p_order_number IS NULL OR LENGTH(TRIM(p_order_number)) = 0 THEN
    RETURN NULL;
  END IF;

  -- Return order with masked PII
  SELECT json_build_object(
    'order_number', o.order_number,
    'status', o.status,
    'date_needed', o.date_needed,
    'time_needed', o.time_needed,
    'cake_size', o.cake_size,
    'filling', o.filling,
    'theme', o.theme,
    'delivery_option', o.delivery_option,
    'total_amount', o.total_amount,
    'created_at', o.created_at,
    'updated_at', o.updated_at,
    -- Mask customer email: show first 3 chars + ***@domain
    'customer_email_masked',
      CASE
        WHEN o.customer_email IS NULL THEN NULL
        WHEN LENGTH(SPLIT_PART(o.customer_email, '@', 1)) > 3
        THEN LEFT(SPLIT_PART(o.customer_email, '@', 1), 3) || '***@' || SPLIT_PART(o.customer_email, '@', 2)
        ELSE '***@' || SPLIT_PART(o.customer_email, '@', 2)
      END,
    -- Mask customer name: show first name only
    'customer_name_masked',
      CASE
        WHEN o.customer_name IS NULL THEN NULL
        WHEN POSITION(' ' IN o.customer_name) > 0
        THEN SPLIT_PART(o.customer_name, ' ', 1) || ' ***'
        ELSE o.customer_name
      END,
    -- Only show delivery type, not full address
    'delivery_info',
      CASE
        WHEN o.delivery_option = 'delivery' THEN 'Home Delivery'
        ELSE 'Pickup at Store'
      END
    -- Excluded fields: customer_phone, dedication, full address, apartment, reference_image_url
  ) INTO result
  FROM orders o
  WHERE o.order_number = TRIM(p_order_number);

  RETURN result;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION get_public_order(TEXT) IS
'Securely retrieves order information for public tracking.
Masks sensitive PII like email, full name, phone, and address.
Only returns data needed for order status tracking.';

-- Grant execute to anonymous users (for order tracking without login)
GRANT EXECUTE ON FUNCTION get_public_order(TEXT) TO anon;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_public_order(TEXT) TO authenticated;

-- Create a rate limiting table for tracking lookup attempts
CREATE TABLE IF NOT EXISTS order_lookup_attempts (
  id BIGSERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  order_number TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient cleanup and rate limiting checks
CREATE INDEX IF NOT EXISTS idx_order_lookup_attempts_ip_time
ON order_lookup_attempts(ip_address, attempted_at);

-- Function to clean up old lookup attempts (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_lookup_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete attempts older than 1 hour
  DELETE FROM order_lookup_attempts
  WHERE attempted_at < NOW() - INTERVAL '1 hour';
END;
$$;

-- Add RLS to order_lookup_attempts table
ALTER TABLE order_lookup_attempts ENABLE ROW LEVEL SECURITY;

-- Only allow insert for all (for rate limiting purposes)
CREATE POLICY "Allow insert for rate limiting" ON order_lookup_attempts
  FOR INSERT
  WITH CHECK (true);

-- Only allow service role to read/delete
CREATE POLICY "Service role can manage" ON order_lookup_attempts
  FOR ALL
  USING (auth.role() = 'service_role');
