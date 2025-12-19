# Square Payment Integration Setup Guide

This guide will help you set up Square payment processing for your bakery order system.

## Prerequisites

1. Square Developer Account (sign up at https://developer.squareup.com)
2. Square Application created in Developer Dashboard
3. Square Location ID from your Square account

## Step 1: Create Square Application

1. Go to https://developer.squareup.com/apps
2. Click **"New Application"**
3. Name your application (e.g., "Eli's Bakery Order System")
4. Copy your **Application ID**

## Step 2: Get Square Credentials

1. In your Square Developer Dashboard, go to your application
2. Navigate to **Credentials** section
3. Copy:
   - **Application ID** → `VITE_SQUARE_APPLICATION_ID`
   - **Access Token** (Sandbox or Production) → `SQUARE_ACCESS_TOKEN`
   - **Location ID** → `SQUARE_LOCATION_ID`
   - **Webhook Signature Key** → `SQUARE_WEBHOOK_SECRET`

## Step 3: Environment Variables

### Frontend (.env)
```env
VITE_SQUARE_APPLICATION_ID=sandbox-sq0idb-xxx
VITE_SQUARE_LOCATION_ID=your-location-id
VITE_SQUARE_ENVIRONMENT=sandbox
```

### Backend (.env)
```env
SQUARE_ACCESS_TOKEN=sandbox-sq0atb-xxx
SQUARE_LOCATION_ID=your-location-id
SQUARE_ENVIRONMENT=sandbox
SQUARE_WEBHOOK_SECRET=your-webhook-secret
```

**For Production:**
- Use production credentials from Square Dashboard
- Set `SQUARE_ENVIRONMENT=production`
- Update `VITE_SQUARE_ENVIRONMENT=production`

## Step 4: Update index.html

The Square Web Payments SDK script is already added to `index.html`:
```html
<script src="https://sandbox.web.squarecdn.com/v1/square.js"></script>
```

**For Production:**
```html
<script src="https://web.squarecdn.com/v1/square.js"></script>
```

## Step 5: Run Database Migration

Run `backend/db/payment-schema-updates.sql` in your Supabase SQL Editor:

1. Go to Supabase Dashboard > SQL Editor
2. Run the SQL file
3. This adds:
   - `idempotency_key` to payments table
   - `failed_payments` table for logging
   - Refund tracking fields

## Step 6: Configure Square Webhooks

1. Go to Square Developer Dashboard > Webhooks
2. Add webhook URL: `https://your-backend-url.com/api/webhooks/square`
3. Subscribe to events:
   - `payment.created`
   - `payment.updated`
   - `refund.created`
   - `refund.updated`
4. Copy the **Webhook Signature Key** to your `.env`

## Step 7: Test Payment Flow

### Test Cards (Sandbox)

**Successful Payment:**
- Card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Any future date
- ZIP: `12345`

**Declined Payment:**
- Card: `4000 0000 0000 0002`
- CVV: `123`
- Expiry: Any future date
- ZIP: `12345`

### Test Flow

1. Create an order through the order form
2. You'll be redirected to `/payment-checkout`
3. Enter test card details
4. Complete payment
5. Verify order is created in database
6. Check email confirmation is sent

## Payment Flow

```
1. Customer fills order form
2. Redirects to /payment-checkout
3. Square Web Payments SDK loads
4. Customer enters card details
5. Card is tokenized client-side
6. Token sent to backend /api/payments/create-payment
7. Backend creates Square payment
8. Order created in database
9. Payment verified
10. Redirect to /order-confirmation
11. Webhook confirms payment (async)
```

## Security Features

### Payment Amount Validation
- Backend verifies payment amount matches order total
- Prevents payment manipulation

### Duplicate Payment Prevention
- Uses idempotency keys
- Prevents accidental duplicate charges

### Payment Verification
- Payment is verified before order confirmation
- Amounts are double-checked

### Webhook Signature Verification
- All webhooks verified with HMAC-SHA256
- Prevents unauthorized webhook calls

## Refund Process

### Full Refund
```bash
POST /api/payments/:paymentId/refund
Headers: x-api-key: YOUR_ADMIN_KEY
Body: { "reason": "Customer request" }
```

### Partial Refund
```bash
POST /api/payments/:paymentId/refund
Headers: x-api-key: YOUR_ADMIN_KEY
Body: { 
  "amount": 25.00,
  "reason": "Partial refund" 
}
```

**Note:** Refunds require authentication (admin/owner role)

## Payment Failure Handling

Failed payments are logged to `failed_payments` table:
- Customer information
- Error message
- Order data
- Timestamp

**Admin Notification:** (Future enhancement)
- Email admin when payment fails
- Dashboard alert for failed payments
- Retry mechanism for customers

## Troubleshooting

### "Square Web Payments SDK not loaded"
- Check script tag in `index.html`
- Verify `VITE_SQUARE_APPLICATION_ID` is set
- Check browser console for errors

### "Payment failed" errors
- Check Square Dashboard for payment status
- Verify `SQUARE_ACCESS_TOKEN` is correct
- Check `SQUARE_LOCATION_ID` matches your account
- Review `failed_payments` table

### Webhook not receiving events
- Verify webhook URL is accessible
- Check webhook signature key matches
- Test webhook in Square Dashboard
- Check backend logs for webhook errors

### Google Pay / Apple Pay not showing
- Verify domain is verified in Square
- Check browser supports Payment Request API
- Test on HTTPS (required for digital wallets)

## Production Checklist

- [ ] Switch to production Square credentials
- [ ] Update `index.html` to use production SDK URL
- [ ] Set `SQUARE_ENVIRONMENT=production`
- [ ] Configure production webhook URL
- [ ] Test with real card (small amount)
- [ ] Verify refund process works
- [ ] Set up monitoring for failed payments
- [ ] Configure admin notifications

## Files Reference

- **Frontend**: `src/pages/PaymentCheckout.tsx`
- **Square Utils**: `src/lib/square.ts`
- **Backend Routes**: `backend/routes/payments.js`
- **Webhook Handler**: `backend/routes/webhooks.js`
- **Database Schema**: `backend/db/payment-schema-updates.sql`
- **API Client**: `src/lib/api.ts`

## Square SDK Documentation

- Web Payments SDK: https://developer.squareup.com/docs/web-payments/overview
- Payment API: https://developer.squareup.com/reference/square/payments-api
- Webhooks: https://developer.squareup.com/docs/webhooks/overview
