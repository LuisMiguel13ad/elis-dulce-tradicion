-- =====================================================
-- Supabase Realtime Setup for Orders Table
-- =====================================================
-- This script enables Realtime on the orders table
-- Run this in your Supabase SQL editor
-- =====================================================

-- Enable Realtime on orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Note: Realtime is enabled by default for tables in Supabase
-- This ensures the orders table is included in the Realtime publication

-- Verify Realtime is enabled (run this query to check)
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders';

-- =====================================================
-- Row Level Security (RLS) for Realtime
-- =====================================================
-- Ensure RLS policies allow users to subscribe to their own orders
-- and admins/bakers to subscribe to all orders

-- Customers can only see their own orders (via user_id)
-- This is already handled by existing RLS policies

-- Admins and bakers can see all orders
-- This is already handled by existing RLS policies

-- =====================================================
-- Notes:
-- =====================================================
-- 1. Realtime subscriptions respect RLS policies
-- 2. Users will only receive updates for rows they have SELECT permission on
-- 3. Make sure your RLS policies are correctly configured
-- 4. Test Realtime subscriptions in the Supabase dashboard
-- =====================================================
