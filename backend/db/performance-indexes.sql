-- =====================================================
-- Performance Optimization Indexes
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_date_needed ON orders(date_needed);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Composite index for common query pattern (status + date_needed)
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(status, date_needed);

-- Composite index for user orders (user_id + created_at)
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_square_payment_id ON payments(square_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category, is_active) WHERE is_active = true;

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language ON profiles(preferred_language);

-- Customer addresses indexes
CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id ON customer_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_is_default ON customer_addresses(user_id, is_default) WHERE is_default = true;

-- Order status history indexes
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at DESC);

-- Capacity table indexes
CREATE INDEX IF NOT EXISTS idx_capacity_date ON capacity(date);
CREATE INDEX IF NOT EXISTS idx_capacity_date_active ON capacity(date) WHERE is_active = true;

-- Delivery zones indexes
CREATE INDEX IF NOT EXISTS idx_delivery_zones_zip_codes ON delivery_zones USING GIN(zip_codes);

-- Pricing history indexes
CREATE INDEX IF NOT EXISTS idx_pricing_history_effective_date ON pricing_history(effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_history_type ON pricing_history(pricing_type);

-- Analytics indexes (if using materialized views)
-- CREATE INDEX IF NOT EXISTS idx_analytics_daily_revenue_date ON analytics_daily_revenue(date DESC);

-- =====================================================
-- Query Optimization Tips
-- =====================================================
-- 1. Always use .select() with specific columns
-- 2. Use .limit() for pagination
-- 3. Use .order() with indexed columns
-- 4. Use .eq() on indexed columns when possible
-- 5. Avoid SELECT * in production queries
-- =====================================================
