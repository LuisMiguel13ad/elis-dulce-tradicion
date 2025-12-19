-- Migration: Add full-text search and indexes for order search optimization

-- Add search_vector column for full-text search
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search_vector
CREATE OR REPLACE FUNCTION orders_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.order_number, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.customer_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.customer_email, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.customer_phone, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.dedication, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search_vector
DROP TRIGGER IF EXISTS orders_search_vector_trigger ON orders;
CREATE TRIGGER orders_search_vector_trigger
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION orders_search_vector_update();

-- Update existing rows
UPDATE orders SET search_vector = 
  setweight(to_tsvector('english', COALESCE(order_number, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(customer_name, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(customer_email, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(customer_phone, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(dedication, '')), 'D')
WHERE search_vector IS NULL;

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS orders_search_idx ON orders USING GIN(search_vector);

-- Create indexes for commonly filtered columns
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_cake_size ON orders(cake_size);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_option ON orders(delivery_option);
CREATE INDEX IF NOT EXISTS idx_orders_date_needed ON orders(date_needed);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(status, date_needed);
CREATE INDEX IF NOT EXISTS idx_orders_payment_date ON orders(payment_status, date_needed);

-- Index for order number (exact match searches)
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Index for customer phone (partial match searches)
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);

-- Index for customer email (partial match searches)
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Comments for documentation
COMMENT ON COLUMN orders.search_vector IS 'Full-text search vector for order_number, customer_name, email, phone, and dedication';
COMMENT ON INDEX orders_search_idx IS 'GIN index for fast full-text search';
COMMENT ON INDEX idx_orders_customer_name IS 'Index for customer name filtering and sorting';
COMMENT ON INDEX idx_orders_cake_size IS 'Index for cake size filtering';
COMMENT ON INDEX idx_orders_status_date IS 'Composite index for status and date filtering';
