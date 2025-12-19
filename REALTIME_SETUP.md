# Real-time Order Tracking Setup Guide

This guide explains how to set up and use the real-time order tracking and notifications system using Supabase Realtime.

## Features

- ✅ Real-time order status updates (no page refresh needed)
- ✅ Live progress bar animations
- ✅ Toast notifications for status changes
- ✅ Confetti animation when order is ready
- ✅ Sound notifications for new orders (bakers/admin)
- ✅ Live order count updates
- ✅ Connection status indicators
- ✅ Automatic reconnection on connection loss
- ✅ Debounced updates for performance

## Setup Instructions

### 1. Enable Realtime in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Replication**
3. Find the `orders` table
4. Toggle **Enable Realtime** to ON

Alternatively, run the SQL script:

```sql
-- Run this in Supabase SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### 2. Verify RLS Policies

Ensure your Row Level Security (RLS) policies allow:
- **Customers**: Can only see their own orders (filtered by `user_id`)
- **Admins/Bakers**: Can see all orders

The existing RLS policies should already handle this, but verify:

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

### 3. Environment Variables

Make sure these are set in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

### For Customers (OrderTracking.tsx)

1. Search for an order by order number
2. The page automatically subscribes to real-time updates
3. Status changes appear instantly without refresh
4. Toast notifications show when status updates
5. Confetti animation plays when order is ready
6. Connection status indicator shows live/offline status

### For Bakers (KitchenDisplay.tsx)

1. Dashboard automatically subscribes to all orders
2. New orders trigger:
   - Sound notification
   - Visual alert
   - Browser notification (if permitted)
   - Toast notification
3. Order status updates appear in real-time
4. Connection status and order count shown in header

### For Owners (OwnerDashboard.tsx)

1. Dashboard shows live metrics
2. Real-time order feed updates automatically
3. Revenue and order counts update in real-time
4. Connection status indicator in header
5. Recent orders list updates live

## Technical Details

### useRealtimeOrders Hook

The `useRealtimeOrders` hook provides:

- **Automatic subscription management**: Subscribes/unsubscribes on mount/unmount
- **Connection status**: Tracks connection state
- **Reconnection logic**: Automatically reconnects on connection loss
- **Debouncing**: Prevents rapid-fire updates (300ms default)
- **Filtering**: Supports user-specific or all-orders subscriptions

### useOrdersFeed Hook

The `useOrdersFeed` hook:

- Uses Realtime instead of polling (removed 5-second polling)
- Maintains order list state
- Detects new orders and triggers alerts
- Provides computed statistics

### Performance Optimizations

1. **Debouncing**: Rapid updates are debounced (300ms)
2. **Selective subscriptions**: Only subscribes to relevant rows
3. **Cleanup**: Properly unsubscribes on component unmount
4. **Connection pooling**: Reuses Supabase client connections

## Troubleshooting

### Realtime not working?

1. **Check Supabase Dashboard**: Verify Realtime is enabled for `orders` table
2. **Check RLS Policies**: Ensure policies allow SELECT for the user
3. **Check Console**: Look for connection errors in browser console
4. **Check Network**: Verify WebSocket connections are not blocked

### Connection status shows "Offline"?

1. Check Supabase service status
2. Verify environment variables are correct
3. Check browser console for errors
4. Try refreshing the page

### Not receiving updates?

1. Verify the order exists and matches filter criteria
2. Check that RLS policies allow access
3. Verify the order was actually updated in the database
4. Check browser console for subscription errors

## Browser Notifications

To enable browser notifications:

1. User must grant permission when prompted
2. Or manually enable in browser settings
3. Notifications appear for:
   - New orders (bakers/admin)
   - Order status updates (customers)

## Sound Notifications

Sound notifications play for:
- New orders (bakers/admin)
- Uses `/notification.mp3` file

To customize:
- Replace `public/notification.mp3` with your own sound file
- Or modify the audio source in `useOrdersFeed.ts`

## Testing

1. **Test Customer View**:
   - Create an order
   - Open OrderTracking page
   - Update order status in admin dashboard
   - Verify updates appear instantly

2. **Test Baker View**:
   - Open KitchenDisplay
   - Create a new order
   - Verify sound + visual alert appears
   - Verify order appears in list

3. **Test Owner View**:
   - Open OwnerDashboard
   - Create/update orders
   - Verify metrics update in real-time

## Security Notes

- Realtime subscriptions respect RLS policies
- Users only receive updates for orders they have permission to see
- No sensitive data is exposed through Realtime
- All subscriptions are authenticated via Supabase Auth
