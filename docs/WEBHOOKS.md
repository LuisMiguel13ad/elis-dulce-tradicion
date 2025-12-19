# Webhooks Documentation

## Overview

Eli's Bakery API uses webhooks to receive real-time notifications from external services, primarily Square for payment events.

## Square Webhooks

### Endpoint

```
POST /api/webhooks/square
```

### Authentication

Square webhooks are authenticated using Square's webhook signature verification. The endpoint verifies the `X-Square-Signature` header.

### Supported Events

#### Payment Completed

Triggered when a payment is successfully processed.

**Payload:**
```json
{
  "type": "payment.updated",
  "event_id": "event_id_123",
  "created_at": "2024-01-01T12:00:00Z",
  "data": {
    "type": "payment",
    "id": "payment_id_123",
    "object": {
      "payment": {
        "id": "payment_id_123",
        "status": "COMPLETED",
        "amount_money": {
          "amount": 5000,
          "currency": "USD"
        },
        "order_id": "order_id_123"
      }
    }
  }
}
```

#### Payment Failed

Triggered when a payment fails.

**Payload:**
```json
{
  "type": "payment.updated",
  "data": {
    "object": {
      "payment": {
        "id": "payment_id_123",
        "status": "FAILED",
        "amount_money": {
          "amount": 5000,
          "currency": "USD"
        }
      }
    }
  }
}
```

### Signature Verification

Square signs all webhook requests with HMAC-SHA256. The signature is in the `X-Square-Signature` header.

**Verification Process:**

1. Extract signature from `X-Square-Signature` header
2. Compute HMAC-SHA256 of request body using webhook secret
3. Compare computed signature with received signature
4. Reject if signatures don't match

**Example (Node.js):**

```javascript
const crypto = require('crypto');

function verifySquareSignature(body, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');
  
  return hash === signature;
}
```

### Retry Behavior

Square will retry failed webhook deliveries:
- Initial attempt
- Retry after 1 minute
- Retry after 5 minutes
- Retry after 30 minutes
- Retry after 2 hours
- Retry after 6 hours
- Retry after 12 hours

**Best Practices:**
- Return 200 status code immediately
- Process webhook asynchronously
- Implement idempotency (check if event already processed)
- Log all webhook events

### Webhook Configuration

Configure webhook URL in Square Developer Dashboard:
1. Go to Square Developer Portal
2. Select your application
3. Navigate to Webhooks
4. Add webhook URL: `https://api.elisdulcetradicion.com/api/webhooks/square`
5. Select events: `payment.updated`, `refund.updated`
6. Save webhook secret

### Testing Webhooks

Use Square's webhook testing tool or send test requests:

```bash
curl -X POST https://api.elisdulcetradicion.com/api/webhooks/square \
  -H "Content-Type: application/json" \
  -H "X-Square-Signature: test_signature" \
  -d '{
    "type": "payment.updated",
    "data": {
      "object": {
        "payment": {
          "id": "test_payment",
          "status": "COMPLETED"
        }
      }
    }
  }'
```

## Custom Webhooks (Future)

Future webhook endpoints may include:
- Order status changes
- Inventory updates
- Delivery status updates

## Security

- Always verify webhook signatures
- Use HTTPS for webhook endpoints
- Implement rate limiting
- Log all webhook events
- Monitor for suspicious activity

## Troubleshooting

**Webhook not received:**
- Verify webhook URL is correct
- Check Square webhook configuration
- Review server logs for errors
- Verify network connectivity

**Signature verification fails:**
- Verify webhook secret is correct
- Check request body is not modified
- Ensure signature header is present

**Duplicate events:**
- Implement idempotency checks
- Use event ID to track processed events
- Store event IDs in database
