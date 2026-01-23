# Eli's Bakery - Complete Supabase Setup Checklist

This document provides everything you need to verify your Supabase setup is correctly configured for the order flow to work properly.

---

## 📋 COMPLETE ORDER FLOW

### How Orders Work (End-to-End)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CUSTOMER FLOW                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. /order page                                                          │
│     └─> Customer fills form (size, filling, date, contact info)         │
│     └─> Data saved to sessionStorage as 'pendingOrder'                  │
│     └─> Navigates to /payment-checkout                                  │
│                                                                          │
│  2. /payment-checkout page                                               │
│     └─> Reads 'pendingOrder' from sessionStorage                        │
│     └─> Calls api.createPaymentIntent(amount) → Supabase Edge Function  │
│     └─> Edge Function calls Stripe API → Returns clientSecret           │
│     └─> Stripe Elements loads with clientSecret                         │
│     └─> Customer enters card details                                    │
│     └─> stripe.confirmPayment() → Payment processed                     │
│                                                                          │
│  3. On Payment Success:                                                  │
│     └─> Calls api.createOrder(orderData) → Supabase RPC                 │
│     └─> RPC 'create_new_order' inserts into orders table                │
│     └─> Order created with payment_status='paid', status='pending'      │
│     └─> Navigates to /order-confirmation                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         DASHBOARD FLOW (Owner/Baker)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. /owner-dashboard loads                                               │
│     └─> Checks auth (user.profile.role === 'owner')                     │
│     └─> Calls api.getAllOrders() → Direct Supabase query                │
│     └─> RLS Policy allows SELECT for authenticated users                │
│     └─> Orders displayed in dashboard                                   │
│                                                                          │
│  2. Real-time Updates:                                                   │
│     └─> useRealtimeOrders() subscribes to 'orders' table                │
│     └─> On INSERT/UPDATE/DELETE → Refreshes order list                  │
│     └─> New order notification shown                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ SUPABASE DATABASE SETUP

### Step 1: Run Core Schema

Run this SQL in Supabase SQL Editor **FIRST**:

**File: `backend/db/schema.sql`**
```sql
-- Creates: orders, payments, order_status_history tables
-- Creates: indexes and triggers

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_language VARCHAR(10) DEFAULT 'en',
    date_needed DATE NOT NULL,
    time_needed TIME NOT NULL,
    cake_size VARCHAR(50) NOT NULL,
    filling VARCHAR(100) NOT NULL,
    theme VARCHAR(100) NOT NULL,
    dedication TEXT,
    reference_image_path TEXT,
    delivery_option VARCHAR(20) NOT NULL DEFAULT 'pickup',
    delivery_address TEXT,
    delivery_apartment VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_id VARCHAR(255),
    square_payment_id VARCHAR(255),
    total_amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ready_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    square_payment_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_date_needed ON orders(date_needed);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
```

### Step 2: Run Auth/Profiles Schema

**File: `backend/db/supabase-auth-schema.sql`**
```sql
-- Creates: profiles table with user roles

CREATE TYPE user_role AS ENUM ('customer', 'baker', 'owner');

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT,
  phone TEXT,
  preferred_language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    'customer',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Step 3: Run RLS Policies

**File: `backend/migrations/004_fix_rls_policies.sql`**
```sql
-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to CREATE orders
CREATE POLICY "Enable insert for everyone"
ON orders FOR INSERT
WITH CHECK (true);

-- Allow authenticated users to VIEW all orders
CREATE POLICY "Enable select for authenticated users"
ON orders FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to UPDATE
CREATE POLICY "Enable update for authenticated users"
ON orders FOR UPDATE
TO authenticated
USING (true);
```

### Step 4: Run Secure RPC Functions (CRITICAL!)

**File: `backend/migrations/007_secure_rpc.sql`**
```sql
-- Secure Order Creation (bypasses RLS for guest checkout)
CREATE OR REPLACE FUNCTION create_new_order(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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
    COALESCE(payload->>'order_number', 'ORD-' || floor(random() * 100000)::text)
  )
  RETURNING * INTO new_order;

  RETURN to_jsonb(new_order);
END;
$$;

-- Secure Order Lookup (for tracking page)
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

-- Grant public access to these functions
GRANT EXECUTE ON FUNCTION create_new_order(jsonb) TO public;
GRANT EXECUTE ON FUNCTION get_public_order(text) TO public;
```

### Step 5: Enable Realtime

**File: `backend/db/realtime-setup.sql`**
```sql
-- Enable Realtime on orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

---

## 💳 STRIPE SETUP

### 1. Environment Variables (Vercel)

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxx...` | Stripe publishable key (frontend) |

### 2. Supabase Edge Function Secrets

Run these commands in terminal (from project root):

```bash
# Set Stripe secret key for Edge Function
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

### 3. Deploy Edge Function

```bash
# Deploy the payment intent function
supabase functions deploy create-payment-intent
```

### 4. Verify Edge Function (create-payment-intent)

The function at `supabase/functions/create-payment-intent/index.ts` should:
- Read `STRIPE_SECRET_KEY` from environment
- Create PaymentIntent with amount/currency/metadata
- Return `{ clientSecret, id }`

---

## 👤 OWNER ACCOUNT SETUP

### Create Your Owner Account

1. **Sign up** on your website (creates a profile with `role = 'customer'`)

2. **Upgrade to Owner** - Run this SQL in Supabase:
```sql
-- Find your user ID first
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Update role to 'owner'
UPDATE profiles
SET role = 'owner'
WHERE id = 'YOUR-USER-UUID-HERE';

-- Verify
SELECT * FROM profiles WHERE id = 'YOUR-USER-UUID-HERE';
```

---

## ✅ VERIFICATION QUERIES

Run these in Supabase SQL Editor to verify everything is set up:

### Check Tables Exist
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('orders', 'profiles', 'payments');

-- Expected: orders, profiles, payments
```

### Check RPC Functions Exist
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('create_new_order', 'get_public_order');

-- Expected: create_new_order, get_public_order
```

### Check RLS Policies
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'orders';

-- Expected: Multiple policies for INSERT, SELECT, UPDATE
```

### Check Realtime is Enabled
```sql
SELECT *
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'orders';

-- Expected: 1 row showing orders is in publication
```

### Check Your Owner Profile
```sql
SELECT p.id, p.role, p.full_name, u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'owner';

-- Expected: Your account with role = 'owner'
```

### Test Order Creation (Manual)
```sql
-- This simulates what the RPC function does
SELECT create_new_order('{
  "customer_name": "Test Customer",
  "customer_email": "test@test.com",
  "customer_phone": "+11234567890",
  "delivery_option": "pickup",
  "payment_status": "paid",
  "total_amount": 55.00,
  "status": "pending",
  "date_needed": "2025-02-01",
  "time_needed": "14:00",
  "cake_size": "10\" Round",
  "filling": "Strawberry",
  "theme": "Birthday",
  "dedication": "Happy Birthday!"
}'::jsonb);

-- Should return the created order as JSONB
```

---

## 🔍 TROUBLESHOOTING

### Orders Not Appearing in Dashboard

| Symptom | Cause | Fix |
|---------|-------|-----|
| Dashboard shows 0 orders | RLS blocking queries | Check user is logged in AND has `role = 'owner'` in profiles |
| Orders created but not showing | Missing RLS policy | Run `004_fix_rls_policies.sql` |
| "Permission denied" errors | RLS too restrictive | Check policies allow authenticated SELECT |
| Real-time not working | Realtime not enabled | Run `ALTER PUBLICATION supabase_realtime ADD TABLE orders;` |

### Payment Not Working

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Failed to initialize payment" | Edge function not deployed | Run `supabase functions deploy create-payment-intent` |
| "Missing Stripe Secret Key" | Secret not set | Run `supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx` |
| Payment succeeds but order fails | RPC function missing | Run `007_secure_rpc.sql` |

### Order Creation Failing

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Function not found" error | RPC not created | Run `007_secure_rpc.sql` |
| "Permission denied on insert" | Missing insert policy | Run `004_fix_rls_policies.sql` |
| Order missing fields | Payload mismatch | Check all required fields are in order payload |

---

## 🚀 GO-LIVE CHECKLIST

Before going live with real payments:

### Stripe
- [ ] Switch from `sk_test_` to `sk_live_` secret key
- [ ] Switch from `pk_test_` to `pk_live_` publishable key
- [ ] Update Supabase secret: `supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx`
- [ ] Update Vercel env: `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx`

### Supabase
- [ ] All migrations run (tables, RLS, RPC functions)
- [ ] Owner account created and verified
- [ ] Realtime enabled on orders table
- [ ] Edge function deployed and working

### Vercel
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active

---

## 📁 KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| `src/pages/Order.tsx` | Order form (steps 1-5) |
| `src/pages/PaymentCheckout.tsx` | Payment page with Stripe |
| `src/components/payment/StripeCheckoutForm.tsx` | Stripe card input component |
| `src/lib/api.ts` | API client (createOrder, getAllOrders, etc.) |
| `src/hooks/useOrdersFeed.ts` | Hook for fetching orders in dashboard |
| `src/hooks/useRealtimeOrders.ts` | Real-time order subscription |
| `src/pages/OwnerDashboard.tsx` | Owner dashboard with order list |
| `supabase/functions/create-payment-intent/index.ts` | Stripe payment intent Edge Function |
| `backend/migrations/007_secure_rpc.sql` | RPC functions for secure order creation |
| `backend/migrations/004_fix_rls_policies.sql` | RLS policies for orders table |

---

## 📞 DATA FLOW SUMMARY

```
Customer → Order Form → sessionStorage → Payment Page →
  → Supabase Edge Function (create-payment-intent) →
  → Stripe API (PaymentIntent) →
  → Customer pays (Stripe Elements) →
  → Payment Success →
  → Supabase RPC (create_new_order) →
  → Order inserted in DB →
  → Realtime broadcast →
  → Dashboard receives notification →
  → Owner sees new order
```
