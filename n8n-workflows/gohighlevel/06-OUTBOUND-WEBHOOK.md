# Step 6: Set Up Outbound Webhooks (Send to n8n)

Outbound webhooks send events FROM GoHighLevel TO your n8n instance for additional processing.

---

## 6.1 When to Use Outbound Webhooks

Use outbound webhooks when you need to:
- Sync data to external systems
- Trigger complex multi-step automations
- Send data to n8n for processing
- Integrate with services GHL doesn't natively support

---

## 6.2 Create Workflow for Ready Notifications

This workflow sends data to n8n when an order is ready for pickup.

### Create the Workflow

1. Go to **Automation** → **Workflows**
2. Click **"+ Create Workflow"**
3. Name: `Bakery - Order Ready Notification`

---

### Add Trigger: Opportunity Stage Changed

1. Click **"Add New Trigger"**
2. Select: **"Opportunity Stage Changed"**
3. Configure:
```
Pipeline: Cake Orders
From Stage: In Progress
To Stage: Ready for Pickup
```

---

### Add Action: Custom Webhook

1. Click **"+"** to add action
2. Select: **"Custom Webhook"** (under "Send Data")
3. Configure:

```
Action Name: Send to n8n
Event Type: CUSTOM
Method: POST
URL: https://your-n8n-instance.com/webhook/order-ready
Content-Type: application/json
Authentication: No Auth (or Bearer Token if secured)
```

### Webhook Payload

Click "Payload" and add:

```json
{
  "event": "order_ready",
  "opportunity_id": "{{opportunity.id}}",
  "opportunity_name": "{{opportunity.name}}",
  "contact_id": "{{contact.id}}",
  "contact_name": "{{contact.name}}",
  "contact_email": "{{contact.email}}",
  "contact_phone": "{{contact.phone}}",
  "language": "{{contact.customFields.preferred_language}}",
  "order_value": "{{opportunity.monetaryValue}}",
  "timestamp": "{{date.now}}"
}
```

---

## 6.3 Create Workflow for Order Completed

Triggers when order moves to "Completed" stage.

### Create the Workflow

1. Create new workflow: `Bakery - Order Completed`
2. Add trigger: **Opportunity Stage Changed**
```
Pipeline: Cake Orders
From Stage: Ready for Pickup
To Stage: Completed
```

### Add Custom Webhook Action

```
Method: POST
URL: https://your-n8n-instance.com/webhook/order-completed
```

**Payload:**
```json
{
  "event": "order_completed",
  "opportunity_id": "{{opportunity.id}}",
  "contact_id": "{{contact.id}}",
  "contact_email": "{{contact.email}}",
  "contact_name": "{{contact.name}}",
  "order_value": "{{opportunity.monetaryValue}}",
  "completed_at": "{{date.now}}"
}
```

---

## 6.4 Create Workflow for New Contact Tag

Triggers when specific tags are added (for marketing automation).

### Create the Workflow

1. Create new workflow: `Bakery - VIP Customer Tag`
2. Add trigger: **Contact Tag Added**
```
Tag: vip-customer
```

### Add Custom Webhook Action

```
Method: POST
URL: https://your-n8n-instance.com/webhook/vip-customer
```

**Payload:**
```json
{
  "event": "vip_customer_tagged",
  "contact_id": "{{contact.id}}",
  "email": "{{contact.email}}",
  "name": "{{contact.name}}",
  "total_orders": "{{contact.customFields.total_orders}}",
  "total_spent": "{{contact.customFields.total_spent}}"
}
```

---

## 6.5 n8n Webhook URLs You'll Need

In n8n, create these webhook endpoints:

| Webhook Path | Purpose |
|--------------|---------|
| `/webhook/order-ready` | Order ready for pickup |
| `/webhook/order-completed` | Order picked up |
| `/webhook/vip-customer` | Customer tagged as VIP |
| `/webhook/review-submitted` | Customer left review |

---

## 6.6 Authentication Options

### Option 1: No Auth (Simplest)
- Works for testing
- Not recommended for production

### Option 2: Bearer Token
```
Authorization: Bearer Token
Token: your-secret-token-here
```
- Add same token to n8n webhook node

### Option 3: API Key Header
```
Headers:
  X-API-Key: your-api-key
```

### Option 4: Basic Auth
```
Authentication: Basic Auth
Username: your-username
Password: your-password
```

---

## 6.7 Testing Outbound Webhooks

### Method 1: Use Webhook.site

1. Go to https://webhook.site
2. Copy the unique URL
3. Temporarily replace your n8n URL with webhook.site URL
4. Trigger the workflow (move opportunity stage)
5. View the received payload on webhook.site

### Method 2: Test in n8n

1. In n8n, create a test workflow
2. Add Webhook node listening on your path
3. Click "Listen for Test Event"
4. Trigger the GHL workflow
5. View received data in n8n

---

## 6.8 Complete Outbound Workflow List

| Workflow Name | Trigger | Sends To |
|---------------|---------|----------|
| Order Ready Notification | Stage → Ready for Pickup | n8n: SMS + Email |
| Order Completed | Stage → Completed | n8n: Review request |
| VIP Customer Tagged | Tag: vip-customer | n8n: Special offer |
| 90 Day Inactive | Tag: inactive-90-days | n8n: Re-engagement |

---

## Checklist

- [ ] Created "Order Ready Notification" workflow
- [ ] Created "Order Completed" workflow
- [ ] Created "VIP Customer Tagged" workflow (optional)
- [ ] Noted all n8n webhook URLs needed
- [ ] Tested outbound webhook delivery
- [ ] Published all workflows

---

## Next Step

Proceed to: **[07-WORKFLOWS.md](./07-WORKFLOWS.md)**
