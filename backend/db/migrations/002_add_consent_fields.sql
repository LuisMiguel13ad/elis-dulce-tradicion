-- Migration: 002_add_consent_fields.sql
-- Description: Add consent tracking fields to orders table
-- Created: 2024-12-09

-- Add consent fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP;

-- Add index for consent tracking
CREATE INDEX IF NOT EXISTS idx_orders_consent_timestamp ON orders(consent_timestamp);

-- Add comment
COMMENT ON COLUMN orders.consent_given IS 'Whether customer agreed to Terms of Service and Privacy Policy';
COMMENT ON COLUMN orders.consent_timestamp IS 'Timestamp when consent was given';
