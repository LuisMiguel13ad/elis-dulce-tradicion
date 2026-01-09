# Eli's Dulce Tradicion - Automation & CRM Integration Plan

## Overview

This document outlines all automations needed for the bakery, including CRM integration with GoHighLevel and n8n workflow automation.

---

## Current State (What's Already Built)

### Existing n8n Workflows (`/n8n-workflows/`)

| File | Purpose | Status |
|------|---------|--------|
| `order-notifications-combined.json` | Main unified workflow | Active |
| `order-confirmation-workflow.json` | Legacy confirmation only | Deprecated |
| `ready-for-pickup-workflow.json` | Legacy ready notification | Deprecated |
| `SETUP_GUIDE.md` | Setup documentation | Complete |

### Existing Notification Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| Webhook endpoint for orders | Active | `/backend/utils/webhook.js` |
| Email notifications (Supabase Edge) | Active | EN/ES support |
| SMS notifications (Twilio via n8n) | Active | Ready notifications only |
| Square payment webhooks | Active | `/backend/routes/webhooks.js` |

---

## Complete Automation List for Bakery

### 1. Customer Journey Automations

| # | Automation | Trigger | Actions | Priority |
|---|------------|---------|---------|----------|
| 1 | Order Confirmation | New order placed | Email + SMS with order details, reference image | HIGH |
| 2 | Order Ready Notification | Status = "ready" | Email + SMS + (WhatsApp) alert | HIGH |
| 3 | Pre-Pickup Reminder | 2 hours before pickup | SMS reminder with bakery address | HIGH |
| 4 | Post-Pickup Thank You | Status = "completed" | Email with thank you + review request | MEDIUM |
| 5 | Birthday/Anniversary Reminder | 30 days before prev. order date | Email/SMS suggesting re-order | MEDIUM |
| 6 | Abandoned Cart Recovery | Cart idle > 1 hour | Email with saved order details | MEDIUM |
| 7 | Review Request | 24 hours after pickup | Email asking for Google review | LOW |

### 2. Internal Team Notifications

| # | Automation | Trigger | Actions | Priority |
|---|------------|---------|---------|----------|
| 8 | New Order Alert (Kitchen) | New order placed | Push notification + sound to dashboard | HIGH |
| 9 | Urgent Order Alert | Order due in < 4 hours | Banner on dashboard (implemented) | HIGH |
| 10 | Daily Order Summary | 6 AM daily | Email to owner with day's orders | MEDIUM |
| 11 | Weekly Analytics Report | Monday 8 AM | Email with revenue, popular items | MEDIUM |
| 12 | Low Inventory Alert | Stock below threshold | SMS/Email to owner | LOW |

### 3. CRM & Marketing Automations

| # | Automation | Trigger | Actions | Priority |
|---|------------|---------|---------|----------|
| 13 | Add Contact to CRM | New order | Create/update GoHighLevel contact | HIGH |
| 14 | Tag Customer by Order Type | Order placed | Apply tags (birthday, wedding, etc.) | HIGH |
| 15 | Welcome Sequence | First order | 3-email drip campaign | MEDIUM |
| 16 | VIP Customer Tagging | 3+ orders or $500+ spent | Apply VIP tag, special offers | MEDIUM |
| 17 | Re-engagement Campaign | No order in 90 days | Email with special discount | LOW |
| 18 | Newsletter Signup Welcome | Newsletter form submitted | Welcome email + first offer | LOW |

---

## GoHighLevel Integration Guide

### Step 1: Create GoHighLevel Sub-Account

1. Log into GoHighLevel at https://app.gohighlevel.com
2. Go to **Settings** → **Sub-Accounts**
3. Click **+ Create Sub-Account**
4. Fill in:
   - Name: `Eli's Dulce Tradicion`
   - Email: Your business email
   - Phone: Business phone
   - Industry: Food & Beverage / Bakery

### Step 2: Set Up Custom Fields in GoHighLevel

Navigate to **Settings** → **Custom Fields** → **Contact**

Create these fields:

| Field Name | Type | Purpose |
|------------|------|---------|
| `preferred_language` | Dropdown (en/es) | For bilingual comms |
| `total_orders` | Number | Track order count |
| `total_spent` | Currency | Lifetime value |
| `last_order_date` | Date | For re-engagement |
| `favorite_cake_type` | Text | Personalization |
| `last_order_id` | Text | Reference link |

### Step 3: Create Inbound Webhook in GoHighLevel

1. Go to **Automation** → **Workflows**
2. Click **+ Create Workflow**
3. Select **Start from Scratch**
4. Add Trigger: **Inbound Webhook**
5. Copy the webhook URL (you'll need this for n8n)

**Example URL:**
```
https://services.leadconnectorhq.com/hooks/YOUR_WEBHOOK_ID
```

### Step 4: Create Outbound Webhook to n8n

For events happening in GoHighLevel that need to trigger n8n:

1. In your workflow, add action: **Custom Webhook**
2. Configure:
   ```
   Method: POST
   URL: https://your-n8n-instance.com/webhook/ghl-events
   Content-Type: application/json
   ```
3. Payload example:
   ```json
   {
     "event": "contact_created",
     "contact_id": "{{contact.id}}",
     "email": "{{contact.email}}",
     "phone": "{{contact.phone}}",
     "first_name": "{{contact.first_name}}",
     "tags": "{{contact.tags}}"
   }
   ```

### Step 5: Configure API Access

1. Go to **Settings** → **API Keys**
2. Click **Generate New Key**
3. Name: `n8n-integration`
4. Copy and save the API key securely

**Required Environment Variables:**
```env
GHL_API_KEY=your-api-key-here
GHL_LOCATION_ID=your-location-id
GHL_WEBHOOK_URL=https://services.leadconnectorhq.com/hooks/xxx
```

---

## n8n + GoHighLevel Workflow Recipes

### Workflow 1: Sync New Orders to GoHighLevel CRM

**Trigger:** Webhook from bakery website (order created)

```json
{
  "name": "Sync Order to GHL",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "Order Webhook",
      "parameters": {
        "path": "new-order",
        "method": "POST"
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Search Contact in GHL",
      "parameters": {
        "url": "https://services.leadconnectorhq.com/contacts/search",
        "method": "POST",
        "headers": {
          "Authorization": "Bearer {{$env.GHL_API_KEY}}",
          "Version": "2021-07-28"
        },
        "body": {
          "locationId": "{{$env.GHL_LOCATION_ID}}",
          "query": "{{$json.customer_email}}"
        }
      }
    },
    {
      "type": "n8n-nodes-base.if",
      "name": "Contact Exists?",
      "parameters": {
        "conditions": {
          "boolean": [{
            "value1": "={{$json.contacts.length}}",
            "operation": "larger",
            "value2": 0
          }]
        }
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Create Contact",
      "parameters": {
        "url": "https://services.leadconnectorhq.com/contacts/",
        "method": "POST",
        "body": {
          "locationId": "{{$env.GHL_LOCATION_ID}}",
          "firstName": "{{$json.customer_name.split(' ')[0]}}",
          "lastName": "{{$json.customer_name.split(' ').slice(1).join(' ')}}",
          "email": "{{$json.customer_email}}",
          "phone": "{{$json.customer_phone}}",
          "tags": ["bakery-customer", "{{$json.cake_size}}", "{{$json.delivery_option}}"],
          "customFields": {
            "preferred_language": "{{$json.customer_language}}",
            "last_order_date": "{{$json.date_needed}}",
            "last_order_id": "{{$json.order_number}}"
          }
        }
      }
    },
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Update Contact",
      "parameters": {
        "url": "https://services.leadconnectorhq.com/contacts/{{$json.contacts[0].id}}",
        "method": "PUT",
        "body": {
          "tags": ["repeat-customer"],
          "customFields": {
            "total_orders": "={{parseInt($json.contacts[0].customFields.total_orders || 0) + 1}}",
            "last_order_date": "{{$node['Order Webhook'].json.date_needed}}"
          }
        }
      }
    }
  ]
}
```

### Workflow 2: Order Ready → GHL Pipeline Update + Customer Notification

```json
{
  "name": "Order Ready Flow",
  "trigger": "Webhook: order status = ready",
  "actions": [
    "1. Find contact in GHL by email",
    "2. Update opportunity stage to 'Ready for Pickup'",
    "3. Send SMS via GHL",
    "4. Add note to contact timeline",
    "5. Trigger GHL workflow for follow-up"
  ]
}
```

### Workflow 3: Post-Order Review Request

**Trigger:** 24 hours after order status = "completed"

1. n8n Schedule trigger (check completed orders)
2. Filter orders completed 24h ago
3. Send email via GoHighLevel asking for review
4. Include Google Review link

---

## GoHighLevel Pipeline Setup

### Create Custom Pipeline for Orders

1. Go to **Opportunities** → **Pipelines**
2. Click **+ Add Pipeline**
3. Name: `Cake Orders`
4. Create stages:

| Stage | Color | Actions |
|-------|-------|---------|
| New Order | Blue | Auto-add from webhook |
| Confirmed | Yellow | Baker notified |
| In Progress | Orange | Being made |
| Ready for Pickup | Green | Customer SMS sent |
| Completed | Gray | Thank you email |
| Cancelled | Red | Refund process |

### Automation for Each Stage

**Stage: Ready for Pickup**
- Trigger: Opportunity moves to "Ready for Pickup"
- Actions:
  1. Send SMS: "Your cake is ready! Pick up at [address] before [time]"
  2. Send Email: Full order details + pickup info
  3. Add task: "Verify pickup" due in 2 hours

---

## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Create GoHighLevel sub-account
- [ ] Set up custom fields
- [ ] Configure API credentials
- [ ] Create inbound webhook for orders
- [ ] Test n8n → GHL connection

### Phase 2: Core Automations (Week 2)
- [ ] Order Confirmation (Email + SMS)
- [ ] Order Ready Notification
- [ ] Sync contacts to GHL
- [ ] Create order pipeline

### Phase 3: Enhanced Features (Week 3)
- [ ] Pre-pickup reminder
- [ ] Post-pickup thank you + review request
- [ ] Daily/weekly reports
- [ ] VIP customer tagging

### Phase 4: Marketing Automations (Week 4)
- [ ] Welcome email sequence
- [ ] Birthday/anniversary reminders
- [ ] Re-engagement campaigns
- [ ] Newsletter integration

---

## Environment Variables Required

Add these to your backend `.env`:

```env
# GoHighLevel
GHL_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GHL_LOCATION_ID=ve9EPM428h8vShlRW1KT
GHL_WEBHOOK_SECRET=your-webhook-secret

# n8n
N8N_WEBHOOK_URL=https://your-n8n.com/webhook
N8N_API_KEY=your-n8n-api-key

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX

# Email
RESEND_API_KEY=re_xxxxxxxxxx
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## Cost Estimates

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| GoHighLevel | Starter | $97/month |
| n8n Cloud | Starter | $20/month |
| Twilio SMS | Pay-as-you-go | ~$2/month (100 SMS) |
| Resend Email | Free tier | $0 (up to 3K/month) |
| **Total** | | **~$119/month** |

*Note: GoHighLevel includes unlimited email sending, so you can eliminate Resend once integrated.*

---

## Support & Resources

- [GoHighLevel API Docs](https://marketplace.gohighlevel.com/docs/)
- [GoHighLevel Webhook Guide](https://help.gohighlevel.com/support/solutions/articles/155000003305-workflow-action-custom-webhook)
- [n8n HighLevel Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.highlevel/)
- [n8n + GHL Tutorial](https://websensepro.com/blog/how-to-connect-go-high-level-with-n8n-step-by-step/)

---

## Quick Reference: Webhook Payloads

### Order Created (Website → n8n → GHL)

```json
{
  "event_type": "order_created",
  "order": {
    "id": 123,
    "order_number": "ORD-ABC123",
    "customer_name": "Maria Garcia",
    "customer_email": "maria@email.com",
    "customer_phone": "+16105551234",
    "customer_language": "es",
    "date_needed": "2025-01-15",
    "time_needed": "14:00",
    "cake_size": "10\" Round",
    "filling": "Tres Leches",
    "theme": "Quinceañera",
    "dedication": "Felices 15 años Isabella!",
    "special_instructions": "Gold crown topper, pink roses",
    "delivery_option": "pickup",
    "total_amount": 185.00,
    "payment_status": "paid",
    "reference_image_url": "https://..."
  }
}
```

### Status Update (Dashboard → n8n → GHL)

```json
{
  "event_type": "order_status_changed",
  "order_id": 123,
  "order_number": "ORD-ABC123",
  "old_status": "in_progress",
  "new_status": "ready",
  "customer_email": "maria@email.com",
  "customer_phone": "+16105551234",
  "pickup_time": "14:00",
  "pickup_address": "123 Main St, Allentown, PA"
}
```

---

*Last Updated: January 2026*
