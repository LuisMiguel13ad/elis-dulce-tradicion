# Step 5: Set Up Inbound Webhook (Receive Orders)

The inbound webhook allows your bakery website to send order data into GoHighLevel.

---

## 5.1 Create New Workflow

1. Go to **Automation** in the left sidebar
2. Click **Workflows**
3. Click **"+ Create Workflow"**
4. Select **"Start from Scratch"**
5. Name it: `Bakery - New Order Received`

---

## 5.2 Add Inbound Webhook Trigger

1. Click **"Add New Trigger"**
2. Search for and select: **"Inbound Webhook"**
3. A webhook URL will be generated automatically

### Your Webhook URL

It will look like:
```
https://services.leadconnectorhq.com/hooks/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**IMPORTANT: Copy this URL and save it!**

```
My Inbound Webhook URL:
_________________________________________________________________
```

---

## 5.3 Configure Webhook Settings

In the webhook trigger settings:

```
Webhook Name: new-bakery-order
```

Leave other settings as default.

---

## 5.4 Add Actions to the Workflow

After the webhook trigger, add these actions:

### Action 1: Create/Update Contact

1. Click **"+"** after the trigger
2. Select **"Create or Update Contact"**
3. Map the fields:

```
First Name:    {{trigger.customer_name.split(' ')[0]}}
Last Name:     {{trigger.customer_name.split(' ').slice(1).join(' ')}}
Email:         {{trigger.customer_email}}
Phone:         {{trigger.customer_phone}}
```

**Custom Fields:**
```
preferred_language: {{trigger.customer_language}}
last_order_date:    {{trigger.date_needed}}
last_order_id:      {{trigger.order_number}}
```

---

### Action 2: Add Tags

1. Click **"+"** to add next action
2. Select **"Add Contact Tag"**
3. Add these tags:
   - `new-customer` (or use IF condition for repeat)
   - `{{trigger.customer_language}}-speaking`

---

### Action 3: Create Opportunity

1. Click **"+"** to add next action
2. Select **"Create Opportunity"**
3. Configure:

```
Pipeline:       Cake Orders
Stage:          New Order
Opportunity Name: Order #{{trigger.order_number}} - {{trigger.customer_name}}
Opportunity Value: {{trigger.total_amount}}
```

**Custom Fields/Notes:**
```
Cake Size: {{trigger.cake_size}}
Filling: {{trigger.filling}}
Theme: {{trigger.theme}}
Dedication: {{trigger.dedication}}
Pickup Date: {{trigger.date_needed}}
Pickup Time: {{trigger.time_needed}}
Special Instructions: {{trigger.special_instructions}}
```

---

### Action 4: Send Internal Notification (Optional)

1. Click **"+"** to add action
2. Select **"Internal Notification"**
3. Configure:
```
Send To: Your user account
Message: New cake order #{{trigger.order_number}} from {{trigger.customer_name}} for {{trigger.date_needed}}
```

---

### Action 5: Send Confirmation Email

1. Click **"+"** to add action
2. Select **"Send Email"**
3. Configure:

**If Language = Spanish:**
```
Subject: ¡Pedido Confirmado! #{{trigger.order_number}}
From Name: Eli's Dulce Tradicion
```

**If Language = English:**
```
Subject: Order Confirmed! #{{trigger.order_number}}
From Name: Eli's Dulce Tradicion
```

(See email templates in [07-WORKFLOWS.md](./07-WORKFLOWS.md))

---

## 5.5 Complete Workflow Structure

Your workflow should look like:

```
┌─────────────────────┐
│  Inbound Webhook    │
│  (new-bakery-order) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Create/Update      │
│  Contact            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Add Tags           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Create Opportunity │
│  (Cake Orders)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Internal Notif     │
│  (Optional)         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Send Confirmation  │
│  Email              │
└─────────────────────┘
```

---

## 5.6 Save and Publish

1. Click **"Save"** in the top right
2. Toggle the workflow to **"Published"** (ON)
3. The webhook is now active and ready to receive orders

---

## 5.7 Test the Webhook

You can test with curl or Postman:

```bash
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "order_number": "TEST-001",
    "customer_name": "Test Customer",
    "customer_email": "test@example.com",
    "customer_phone": "+16105551234",
    "customer_language": "en",
    "date_needed": "2025-01-20",
    "time_needed": "14:00",
    "cake_size": "8\" Round",
    "filling": "Tres Leches",
    "theme": "Birthday",
    "dedication": "Happy Birthday!",
    "special_instructions": "Blue flowers please",
    "total_amount": 65.00,
    "delivery_option": "pickup"
  }'
```

---

## 5.8 Verify Test Worked

1. Go to **Contacts** → Check for "Test Customer"
2. Go to **Opportunities** → Check for "Order #TEST-001"
3. Check contact has correct tags and custom fields

---

## Expected Payload from Bakery Website

The bakery backend will send this JSON:

```json
{
  "event_type": "order_created",
  "order_number": "ORD-ABC123",
  "customer_name": "Maria Garcia",
  "customer_email": "maria@email.com",
  "customer_phone": "+16105551234",
  "customer_language": "es",
  "date_needed": "2025-01-15",
  "time_needed": "14:00",
  "cake_size": "10\" Round",
  "filling": "Tres Leches",
  "theme": "Quinceañera Rosa y Dorado",
  "dedication": "¡Mis 15 Años - Isabella!",
  "special_instructions": "Gold crown topper, pink roses",
  "delivery_option": "pickup",
  "total_amount": 185.00,
  "payment_status": "paid",
  "reference_image_url": "https://storage.example.com/image.jpg"
}
```

---

## Checklist

- [ ] Created workflow "Bakery - New Order Received"
- [ ] Added Inbound Webhook trigger
- [ ] Copied webhook URL: `________________`
- [ ] Added Create/Update Contact action
- [ ] Added Add Tags action
- [ ] Added Create Opportunity action
- [ ] (Optional) Added Internal Notification
- [ ] (Optional) Added Send Email action
- [ ] Published the workflow
- [ ] Tested with sample data
- [ ] Verified contact and opportunity created

---

## Next Step

Proceed to: **[06-OUTBOUND-WEBHOOK.md](./06-OUTBOUND-WEBHOOK.md)**
