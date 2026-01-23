
CREATE TABLE IF NOT EXISTS failed_payments (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  order_data JSONB,
  error_message TEXT,
  idempotency_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_failed_payments_created_at ON failed_payments(created_at);
