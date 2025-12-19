# Supabase Edge Functions

This directory contains Supabase Edge Functions for email notifications.

## Functions

### send-order-confirmation
Sends order confirmation email when an order is created.

**Payload:**
```json
{
  "order": {
    "order_number": "ORD-123456",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_language": "en",
    "date_needed": "2025-12-15",
    "time_needed": "14:00",
    "cake_size": "Large",
    "filling": "Chocolate",
    "theme": "Birthday",
    "delivery_option": "pickup",
    "total_amount": 75.00
  }
}
```

### send-status-update
Sends status update email when order status changes.

**Payload:**
```json
{
  "order": {
    "order_number": "ORD-123456",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_language": "en",
    "new_status": "in_progress",
    "date_needed": "2025-12-15",
    "time_needed": "14:00",
    "delivery_option": "pickup"
  },
  "oldStatus": "confirmed"
}
```

### send-ready-notification
Sends ready notification when order status = 'ready'.

**Payload:**
```json
{
  "order": {
    "order_number": "ORD-123456",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_language": "en",
    "date_needed": "2025-12-15",
    "time_needed": "14:00",
    "delivery_option": "pickup",
    "delivery_address": "123 Main St",
    "total_amount": 75.00
  }
}
```

## Deployment

```bash
# Deploy all functions
supabase functions deploy send-order-confirmation
supabase functions deploy send-status-update
supabase functions deploy send-ready-notification
```

## Secrets

Required secrets (set via `supabase secrets set`):
- `RESEND_API_KEY` - Your Resend API key
- `FRONTEND_URL` - Frontend URL for tracking links
- `FROM_EMAIL` - Sender email address
- `FROM_NAME` - Sender name

## Testing Locally

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve send-order-confirmation --no-verify-jwt
```

## Logs

```bash
# View logs
supabase functions logs send-order-confirmation

# Follow logs
supabase functions logs send-order-confirmation --follow
```
