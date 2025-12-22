# n8n Workflow Setup Guide

## Overview

**Single unified workflow** for Eli's Bakery order notifications:

| Event | Actions |
|-------|---------|
| New Order (INSERT) | Confirmation Email (EN/ES) |
| Order Ready (UPDATE + status=ready) | Ready Email + SMS (EN/ES) |
| Other events | Ignored (returns success) |

### Workflow Files
- **`order-notifications-combined.json`** - Recommended (single webhook)
- `order-confirmation-workflow.json` - Legacy separate workflow
- `ready-for-pickup-workflow.json` - Legacy separate workflow

---

## Step 1: Import Workflow into n8n

1. Open your n8n instance
2. Go to **Workflows** → **Import from File**
3. Import: `order-notifications-combined.json`

---

## Step 2: Configure Credentials

### SMTP (Email)

1. In n8n, go to **Credentials** → **Add Credential**
2. Select **SMTP**
3. Configure with your email provider:

**Gmail Example:**
```
Host: smtp.gmail.com
Port: 587
User: your-email@gmail.com
Password: [App Password - not your regular password]
SSL/TLS: STARTTLS
```

**Resend Example:**
```
Host: smtp.resend.com
Port: 587
User: resend
Password: [Your Resend API Key]
```

4. Update the credential ID in the workflow (replace `SMTP_CREDENTIAL_ID`)

### Twilio (SMS) - For Ready Notifications

1. Create account at https://www.twilio.com
2. Get your Account SID and Auth Token
3. Get a phone number
4. In n8n, add **Twilio API** credential:
```
Account SID: ACxxxxxxxxxx
Auth Token: your-auth-token
```
5. Update the credential ID in workflow (replace `TWILIO_CREDENTIAL_ID`)

---

## Step 3: Configure Supabase Webhook

### Single Webhook for All Events

In Supabase Dashboard:

1. Go to **Database** → **Webhooks**
2. Click **Create Webhook**

```
Name: n8n-order-notifications
Table: orders
Events: INSERT, UPDATE
HTTP Request:
  Method: POST
  URL: https://your-n8n-url.com/webhook/order-notifications
  Headers:
    Content-Type: application/json
```

The workflow automatically routes:
- **INSERT** → Confirmation emails
- **UPDATE + status=ready** → Ready emails + SMS
- **Other updates** → Ignored

---

## Step 4: Set Environment Variables in n8n

Go to **Settings** → **Environment Variables**:

```
EMAIL_FROM=orders@elisdulcetradicion.com
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

---

## Step 5: Test the Workflow

### Test Order Confirmation:
1. Activate the workflow
2. Place a test order on your website
3. Check if confirmation email is received

### Test Ready Notification:
1. In the dashboard, mark an order as "Ready"
2. Check if ready email and SMS are received

---

## Workflow Architecture

```
                    ┌─────────────────┐
                    │  Webhook POST   │
                    │ /order-notifs   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Switch Router  │
                    │  (by event)     │
                    └────────┬────────┘
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │  New Order  │   │ Order Ready │   │   Other     │
    │  (INSERT)   │   │  (UPDATE)   │   │  (ignore)   │
    └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐         │
    │  Language   │   │  Language   │         │
    │   Check     │   │   Check     │         │
    └──────┬──────┘   └──────┬──────┘         │
      ES ──┴── EN       ES ──┴── EN           │
       │      │          │      │             │
    ┌──▼──┐┌──▼──┐   ┌───▼──┐┌──▼───┐        │
    │Email││Email│   │Email ││Email │        │
    │ ES  ││ EN  │   │+SMS  ││+SMS  │        │
    └──┬──┘└──┬──┘   │ ES   ││ EN   │        │
       │      │      └───┬──┘└──┬───┘        │
       └──┬───┘          └──┬───┘            │
          │                 │                │
          └────────┬────────┴────────────────┘
                   │
           ┌───────▼───────┐
           │ Respond JSON  │
           │  {success}    │
           └───────────────┘
```

---

## Webhook Payload Format

Supabase sends this format:

```json
{
  "type": "INSERT",
  "table": "orders",
  "record": {
    "id": 123,
    "order_number": "ORD-ABC123",
    "customer_name": "Maria Garcia",
    "customer_email": "maria@email.com",
    "customer_phone": "+1234567890",
    "customer_language": "es",
    "date_needed": "2025-01-15",
    "time_needed": "14:00",
    "cake_size": "Medium",
    "filling": "Tres Leches",
    "theme": "Birthday",
    "dedication": "Happy Birthday!",
    "total_amount": 65.00,
    "status": "pending"
  },
  "old_record": null
}
```

For updates, `old_record` contains the previous values.

---

## Troubleshooting

### Emails not sending?
- Check SMTP credentials
- Check spam folder
- Verify email address format in payload

### SMS not sending?
- Verify Twilio credentials
- Check phone number format (must include country code: +1...)
- Verify Twilio account has balance

### Webhook not triggering?
- Check Supabase webhook logs
- Verify n8n workflow is activated
- Check n8n execution history for errors

### Order Ready not triggering?
- Make sure the status field changes TO "ready"
- The old status must NOT be "ready" (prevents duplicate notifications)

---

## Cost Estimates

| Service | Cost |
|---------|------|
| **n8n Cloud** | $20/month (starter) or self-host free |
| **Resend Email** | Free up to 3,000/month |
| **Twilio SMS** | ~$0.0079/SMS in US |

For 100 orders/month:
- Emails: Free (Resend)
- SMS: ~$1.58/month (Twilio)

---

## Support

Questions? Contact: 610-910-9067
