-- =====================================================
-- Payment Schema Updates
-- =====================================================
-- Add fields needed for Square payment integration
-- =====================================================

-- Add idempotency_key to payments table (for duplicate payment prevention)
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255) UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_idempotency_key ON payments(idempotency_key);

-- Add refund tracking fields (optional, for future use)
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS refunded_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20);

-- Create failed_payments table for logging payment failures
CREATE TABLE IF NOT EXISTS failed_payments (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  order_data JSONB,
  error_message TEXT,
  idempotency_key VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_failed_payments_created_at ON failed_payments(created_at);
CREATE INDEX IF NOT EXISTS idx_failed_payments_customer_email ON failed_payments(customer_email);

-- =====================================================
-- Notes:
-- =====================================================
-- 1. idempotency_key prevents duplicate payments
-- 2. failed_payments table logs all payment failures for admin review
-- 3. refunded_amount tracks partial refunds
-- 4. refund_status tracks refund state
--
-- =====================================================
