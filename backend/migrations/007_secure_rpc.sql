
-- SECURE FUNCTIONS for Public Access

-- 1. Secure Order Creation
-- Allows public to insert and get back the result without table SELECT permissions
CREATE OR REPLACE FUNCTION create_new_order(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Run as database owner (bypassing RLS for the insert/select)
AS $$
DECLARE
  new_order orders;
BEGIN
  INSERT INTO orders (
    customer_name,
    customer_email,
    customer_phone,
    delivery_option,
    payment_status,
    total_amount,
    status,
    date_needed,
    time_needed,
    cake_size,
    filling,
    theme,
    dedication,
    order_number
    -- Add other fields as needed from payload mapping
  )
  VALUES (
    payload->>'customer_name',
    payload->>'customer_email',
    payload->>'customer_phone',
    payload->>'delivery_option',
    payload->>'payment_status',
    (payload->>'total_amount')::numeric,
    COALESCE(payload->>'status', 'pending'),
    (payload->>'date_needed')::date,
    (payload->>'time_needed')::time,
    payload->>'cake_size',
    payload->>'filling',
    payload->>'theme',
    payload->>'dedication',
    COALESCE(payload->>'order_number', 'ORD-' || floor(random() * 100000)::text) -- Simple fallback generation
  )
  RETURNING * INTO new_order;

  RETURN to_jsonb(new_order);
END;
$$;


-- 2. Secure Order Lookup
-- Allows public to fetch a SINGLE order by number (for tracking)
CREATE OR REPLACE FUNCTION get_public_order(p_order_number text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result orders;
BEGIN
  SELECT * INTO result
  FROM orders
  WHERE order_number = p_order_number
  LIMIT 1;

  IF result IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN to_jsonb(result);
END;
$$;

-- Grant access
GRANT EXECUTE ON FUNCTION create_new_order(jsonb) TO public;
GRANT EXECUTE ON FUNCTION get_public_order(text) TO public;
