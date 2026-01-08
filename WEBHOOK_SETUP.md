# Order Webhook Setup

## Overview
The system automatically sends webhook notifications when new orders are placed.

## Configuration

### 1. Set Environment Variable
Add this to your `.env` file (backend):

```bash
ORDER_WEBHOOK_URL=https://n8nlocal.neurovaiagents.uk/webhook-test/order-notifications
```

### 2. Webhook Payload
When an order is created, the system sends a POST request with the following payload:

```json
{
  "event": "order.created",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "order": {
    "id": 123,
    "order_number": "ORD-ABC123-XYZ",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "(610) 279-6200",
    "customer_language": "en",
    "date_needed": "2024-01-15",
    "time_needed": "14:00",
    "cake_size": "8 inch",
    "filling": "Chocolate",
    "theme": "Birthday",
    "dedication": "Happy Birthday!",
    "delivery_option": "delivery",
    "delivery_address": "324 W Marshall St, Norristown, PA 19401",
    "delivery_apartment": "Apt 2B",
    "delivery_zone": "local",
    "total_amount": 45.99,
    "status": "pending",
    "payment_status": "paid",
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### 3. Headers Sent
- `Content-Type: application/json`
- `User-Agent: ElisBakery-Webhook/1.0`

### 4. Error Handling
- Webhook failures are logged but don't block order creation
- Orders are still created successfully even if the webhook fails
- Check server logs for webhook errors

## Testing

### Test locally:
1. Start the backend server
2. Place a test order
3. Check the webhook endpoint receives the notification
4. Check backend logs for webhook status

### Using n8n (Your Current Setup):
Your webhook is configured to send to:
```
https://n8nlocal.neurovaiagents.uk/webhook-test/order-notifications
```

You can:
- Create workflows in n8n to process order notifications
- Send data to other systems (Slack, email, CRM, etc.)
- Store order data in databases
- Trigger automation workflows

## Location in Code
- Webhook utility: `/backend/utils/webhook.js`
- Called from: 
  - `/backend/routes/payments.js` (line ~178) - **Primary route for website orders**
  - `/backend/routes/orders.js` (line ~282) - For direct order creation
- Triggered: After successful order creation and database commit

## Support
If the webhook isn't working:
1. Check backend logs for error messages
2. Verify ORDER_WEBHOOK_URL is set correctly
3. Ensure webhook endpoint is accessible
4. Test webhook URL with curl or Postman

