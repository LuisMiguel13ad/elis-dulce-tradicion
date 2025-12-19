-- Migration: Add order state machine columns
-- Adds time tracking and enhances order_status_history

-- Add time tracking columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS time_to_confirm INTEGER, -- minutes
ADD COLUMN IF NOT EXISTS time_to_ready INTEGER,    -- minutes
ADD COLUMN IF NOT EXISTS time_to_complete INTEGER; -- minutes

-- Add previous_status column to order_status_history
ALTER TABLE order_status_history
ADD COLUMN IF NOT EXISTS previous_status VARCHAR(50);

-- Add metadata column for transition context
ALTER TABLE order_status_history
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create index for faster status history queries
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id 
ON order_status_history(order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_status_history_status 
ON order_status_history(status, created_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN orders.time_to_confirm IS 'Time in minutes from order creation to confirmation';
COMMENT ON COLUMN orders.time_to_ready IS 'Time in minutes from confirmation to ready status';
COMMENT ON COLUMN orders.time_to_complete IS 'Time in minutes from ready to completed status';
COMMENT ON COLUMN order_status_history.previous_status IS 'Status before this transition';
COMMENT ON COLUMN order_status_history.metadata IS 'Additional context for transition (JSON)';
