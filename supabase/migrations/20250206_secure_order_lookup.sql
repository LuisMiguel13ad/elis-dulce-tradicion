-- Secure Order Lookup Functions
-- This migration adds secure RPC functions for public order tracking
-- that only return limited, non-sensitive information

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_public_order(text);

-- Create secure function for public order lookup
-- Only returns non-sensitive order tracking information
CREATE OR REPLACE FUNCTION get_public_order(p_order_number text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_result jsonb;
BEGIN
  -- Validate input
  IF p_order_number IS NULL OR trim(p_order_number) = '' THEN
    RETURN NULL;
  END IF;

  -- Fetch order with limited fields (no sensitive customer data like full address details)
  SELECT 
    id,
    order_number,
    customer_name,
    -- Mask email for privacy (show first 3 chars + *** + domain)
    CASE 
      WHEN customer_email IS NOT NULL THEN
        substring(customer_email from 1 for 3) || '***@' || 
        split_part(customer_email, '@', 2)
      ELSE NULL
    END as customer_email,
    status,
    date_needed,
    time_needed,
    cake_size,
    filling,
    theme,
    -- Don't include dedication (may contain personal messages)
    delivery_option,
    -- Only show city/zone for delivery, not full address
    delivery_zone,
    delivery_status,
    estimated_delivery_time,
    total_amount,
    payment_status,
    created_at,
    ready_at,
    completed_at,
    cancelled_at,
    cancellation_reason,
    refund_amount,
    refund_status
  INTO v_order
  FROM orders
  WHERE order_number = trim(p_order_number);

  IF v_order IS NULL THEN
    RETURN NULL;
  END IF;

  -- Build result JSON with only safe fields
  v_result := jsonb_build_object(
        'id', v_order.id,
        'order_number', v_order.order_number,
        'customer_name', v_order.customer_name,
        'customer_email', v_order.customer_email,
        'status', v_order.status,
        'date_needed', v_order.date_needed,
        'time_needed', v_order.time_needed,
        'cake_size', v_order.cake_size,
        'filling', v_order.filling,
        'theme', v_order.theme,
        'delivery_option', v_order.delivery_option,
        'delivery_zone', v_order.delivery_zone,
        'delivery_status', v_order.delivery_status,
        'estimated_delivery_time', v_order.estimated_delivery_time,
        'total_amount', v_order.total_amount,
        'payment_status', v_order.payment_status,
        'created_at', v_order.created_at,
        'ready_at', v_order.ready_at,
        'completed_at', v_order.completed_at,
        'cancelled_at', v_order.cancelled_at,
        'cancellation_reason', v_order.cancellation_reason,
        'refund_amount', v_order.refund_amount,
        'refund_status', v_order.refund_status
      );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_public_order(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_order(text) TO anon;

-- Add rate limiting table for order lookups
CREATE TABLE IF NOT EXISTS order_lookup_rate_limits (
    ip_address text NOT NULL,
    lookup_count integer DEFAULT 1,
    window_start timestamp with time zone DEFAULT now(),
    PRIMARY KEY (ip_address)
  );

-- Create index for cleanup
CREATE INDEX IF NOT EXISTS idx_order_lookup_rate_limits_window 
ON order_lookup_rate_limits(window_start);

-- Function to check rate limit (10 lookups per minute per IP)
CREATE OR REPLACE FUNCTION check_order_lookup_rate_limit(p_ip text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
  v_window_start timestamp with time zone;
BEGIN
  -- Get current record
  SELECT lookup_count, window_start INTO v_count, v_window_start
  FROM order_lookup_rate_limits
  WHERE ip_address = p_ip;

  -- If no record or window expired, reset
  IF v_window_start IS NULL OR (now() - v_window_start) > interval '1 minute' THEN
    INSERT INTO order_lookup_rate_limits (ip_address, lookup_count, window_start)
    VALUES (p_ip, 1, now())
    ON CONFLICT (ip_address) 
    DO UPDATE SET lookup_count = 1, window_start = now();
    RETURN true;
  END IF;

  -- Check if under limit
  IF v_count >= 10 THEN
    RETURN false;
  END IF;

  -- Increment counter
  UPDATE order_lookup_rate_limits 
  SET lookup_count = lookup_count + 1 
  WHERE ip_address = p_ip;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION check_order_lookup_rate_limit(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_order_lookup_rate_limit(text) TO anon;

-- Cleanup old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION cleanup_order_lookup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM order_lookup_rate_limits 
  WHERE window_start < now() - interval '5 minutes';
END;
$$;

-- Comment explaining security measures
COMMENT ON FUNCTION get_public_order(text) IS 
'Secure public order lookup function that:
1. Only returns limited, non-sensitive order information
2. Masks customer email for privacy
3. Does not expose full delivery addresses
4. Does not include personal dedication messages
5. Should be used with rate limiting (check_order_lookup_rate_limit)';
