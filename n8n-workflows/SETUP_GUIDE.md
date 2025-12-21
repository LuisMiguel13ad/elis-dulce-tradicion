# n8n Workflow Setup Guide

## Overview

Two workflows for Eli's Bakery order notifications:

1. **Order Confirmation** - Email when new order is placed
2. **Ready for Pickup** - Email + SMS when order is ready

---

## Step 1: Import Workflows into n8n

1. Open your n8n instance
2. Go to **Workflows** → **Import from File**
3. Import both JSON files:
   - `order-confirmation-workflow.json`
   - `ready-for-pickup-workflow.json`

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

4. Update the credential ID in both workflows (replace `SMTP_CREDENTIAL_ID`)

### Twilio (SMS) - Optional

1. Create account at https://www.twilio.com
2. Get your Account SID and Auth Token
3. Get a phone number
4. In n8n, add **Twilio API** credential:
```
Account SID: ACxxxxxxxxxx
Auth Token: your-auth-token
```
5. Update the credential ID in workflows (replace `TWILIO_CREDENTIAL_ID`)

---

## Step 3: Configure Supabase Webhooks

### In Supabase Dashboard:

1. Go to **Database** → **Webhooks**
2. Click **Create Webhook**

### Webhook 1: New Orders

```
Name: n8n-new-order
Table: orders
Events: INSERT
HTTP Request:
  Method: POST
  URL: https://your-n8n-url.com/webhook/order-confirmation
  Headers:
    Content-Type: application/json
```

### Webhook 2: Order Updates

```
Name: n8n-order-update
Table: orders
Events: UPDATE
HTTP Request:
  Method: POST
  URL: https://your-n8n-url.com/webhook/order-ready
  Headers:
    Content-Type: application/json
```

---

## Step 4: Set Environment Variables in n8n

Go to **Settings** → **Environment Variables**:

```
EMAIL_FROM=orders@elisdulcetradicion.com
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

---

## Step 5: Test the Workflows

### Test Order Confirmation:
1. Activate the workflow
2. Place a test order on your website
3. Check if email is received

### Test Ready Notification:
1. Activate the workflow
2. In the dashboard, mark an order as "Ready"
3. Check if email and SMS are received

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
