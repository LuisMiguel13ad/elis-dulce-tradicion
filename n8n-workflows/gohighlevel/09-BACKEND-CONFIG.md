# Step 9: Configure Bakery Backend

Connect your bakery website backend to GoHighLevel.

---

## 9.1 Environment Variables

Add these to your backend `.env` file:

```env
# ===========================================
# GOHIGHLEVEL CONFIGURATION
# ===========================================

# API Authentication
GHL_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-key-here
GHL_LOCATION_ID=ve9EPM428h8vShlRW1KT

# Webhook URL (from Step 5)
GHL_WEBHOOK_URL=https://services.leadconnectorhq.com/hooks/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Pipeline Configuration
GHL_PIPELINE_ID=your-pipeline-id
GHL_STAGE_NEW_ORDER=stage-id-for-new-order
GHL_STAGE_CONFIRMED=stage-id-for-confirmed
GHL_STAGE_IN_PROGRESS=stage-id-for-in-progress
GHL_STAGE_READY=stage-id-for-ready
GHL_STAGE_COMPLETED=stage-id-for-completed
GHL_STAGE_CANCELLED=stage-id-for-cancelled

# Feature Flags
GHL_ENABLED=true
GHL_SYNC_CONTACTS=true
GHL_CREATE_OPPORTUNITIES=true
```

---

## 9.2 Create GoHighLevel Utility File

Create a new file: `/backend/utils/gohighlevel.js`

```javascript
/**
 * GoHighLevel Integration Utility
 * Handles all GHL API calls for the bakery
 */

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

/**
 * Make authenticated request to GHL API
 */
async function ghlRequest(endpoint, method = 'GET', body = null) {
  const apiKey = process.env.GHL_API_KEY;

  if (!apiKey) {
    console.warn('[GHL] API key not configured, skipping request');
    return null;
  }

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Version': GHL_API_VERSION,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${GHL_API_BASE}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.text();
      console.error(`[GHL] API Error: ${response.status}`, error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[GHL] Request failed:', error.message);
    return null;
  }
}

/**
 * Send order to GHL via inbound webhook
 */
async function sendOrderToGHL(order) {
  const webhookUrl = process.env.GHL_WEBHOOK_URL;

  if (!webhookUrl || process.env.GHL_ENABLED !== 'true') {
    console.log('[GHL] Webhook disabled or not configured');
    return null;
  }

  const payload = {
    event_type: 'order_created',
    order_number: order.order_number,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    customer_language: order.customer_language || 'en',
    date_needed: order.date_needed,
    time_needed: order.time_needed,
    cake_size: order.cake_size,
    filling: order.filling,
    theme: order.theme,
    dedication: order.dedication,
    special_instructions: order.special_instructions,
    delivery_option: order.delivery_option,
    total_amount: order.total_amount,
    payment_status: order.payment_status,
    reference_image_url: order.reference_image_path,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('[GHL] Order sent successfully:', order.order_number);
      return true;
    } else {
      console.error('[GHL] Webhook failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('[GHL] Webhook error:', error.message);
    return false;
  }
}

/**
 * Create or update contact in GHL
 */
async function upsertContact(order) {
  if (process.env.GHL_SYNC_CONTACTS !== 'true') {
    return null;
  }

  const locationId = process.env.GHL_LOCATION_ID;

  // First, search for existing contact
  const searchResult = await ghlRequest(
    `/contacts/search?locationId=${locationId}&email=${encodeURIComponent(order.customer_email)}`,
    'GET'
  );

  const nameParts = order.customer_name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '';

  const contactData = {
    locationId,
    firstName,
    lastName,
    email: order.customer_email,
    phone: order.customer_phone,
    tags: ['bakery-customer'],
    customFields: [
      { key: 'preferred_language', value: order.customer_language || 'en' },
      { key: 'last_order_date', value: order.date_needed },
      { key: 'last_order_id', value: order.order_number },
    ],
  };

  if (searchResult?.contacts?.length > 0) {
    // Update existing contact
    const contactId = searchResult.contacts[0].id;
    const existingOrders = parseInt(searchResult.contacts[0].customFields?.total_orders || 0);
    const existingSpent = parseFloat(searchResult.contacts[0].customFields?.total_spent || 0);

    contactData.customFields.push(
      { key: 'total_orders', value: String(existingOrders + 1) },
      { key: 'total_spent', value: String(existingSpent + (order.total_amount || 0)) }
    );
    contactData.tags.push('repeat-customer');

    return await ghlRequest(`/contacts/${contactId}`, 'PUT', contactData);
  } else {
    // Create new contact
    contactData.customFields.push(
      { key: 'total_orders', value: '1' },
      { key: 'total_spent', value: String(order.total_amount || 0) }
    );
    contactData.tags.push('new-customer');

    return await ghlRequest('/contacts/', 'POST', contactData);
  }
}

/**
 * Create opportunity (order) in pipeline
 */
async function createOpportunity(order, contactId) {
  if (process.env.GHL_CREATE_OPPORTUNITIES !== 'true') {
    return null;
  }

  const opportunityData = {
    locationId: process.env.GHL_LOCATION_ID,
    pipelineId: process.env.GHL_PIPELINE_ID,
    pipelineStageId: process.env.GHL_STAGE_NEW_ORDER,
    contactId,
    name: `Order #${order.order_number} - ${order.customer_name}`,
    monetaryValue: order.total_amount || 0,
    status: 'open',
  };

  return await ghlRequest('/opportunities/', 'POST', opportunityData);
}

/**
 * Update opportunity stage
 */
async function updateOpportunityStage(opportunityId, newStatus) {
  const stageMap = {
    'pending': process.env.GHL_STAGE_NEW_ORDER,
    'confirmed': process.env.GHL_STAGE_CONFIRMED,
    'in_progress': process.env.GHL_STAGE_IN_PROGRESS,
    'ready': process.env.GHL_STAGE_READY,
    'delivered': process.env.GHL_STAGE_COMPLETED,
    'completed': process.env.GHL_STAGE_COMPLETED,
    'cancelled': process.env.GHL_STAGE_CANCELLED,
  };

  const stageId = stageMap[newStatus];
  if (!stageId) {
    console.warn(`[GHL] Unknown status: ${newStatus}`);
    return null;
  }

  return await ghlRequest(`/opportunities/${opportunityId}`, 'PUT', {
    pipelineStageId: stageId,
  });
}

module.exports = {
  ghlRequest,
  sendOrderToGHL,
  upsertContact,
  createOpportunity,
  updateOpportunityStage,
};
```

---

## 9.3 Integrate with Order Creation

Update `/backend/routes/orders.js` to send orders to GHL:

### Add Import at Top

```javascript
const { sendOrderToGHL } = require('../utils/gohighlevel');
```

### Add After Order is Created

Find where orders are created (usually after database insert) and add:

```javascript
// After order is saved to database
const savedOrder = await db.query('INSERT INTO orders...'); // your existing code

// Send to GoHighLevel (non-blocking)
sendOrderToGHL(savedOrder).catch(err => {
  console.error('[GHL] Failed to sync order:', err);
});

// Continue with rest of order flow...
```

---

## 9.4 Integrate with Status Updates

Update `/backend/routes/orderTransitions.js`:

### Add Import

```javascript
const { sendOrderToGHL } = require('../utils/gohighlevel');
```

### Add After Status Change

When order status changes to 'ready':

```javascript
// After updating status in database
if (newStatus === 'ready') {
  // Send webhook to GHL for ready notification
  sendOrderToGHL({
    ...order,
    event_type: 'order_ready',
    old_status: oldStatus,
    new_status: newStatus,
  }).catch(err => console.error('[GHL] Ready notification failed:', err));
}
```

---

## 9.5 Add Webhook Endpoint for GHL Events (Optional)

If GHL needs to send data back to your bakery:

Create `/backend/routes/ghl-webhook.js`:

```javascript
const express = require('express');
const router = express.Router();

/**
 * Receive webhooks from GoHighLevel
 * POST /api/webhooks/gohighlevel
 */
router.post('/gohighlevel', async (req, res) => {
  try {
    const event = req.body;

    console.log('[GHL Webhook] Received:', event.event_type);

    switch (event.event_type) {
      case 'contact.created':
        // Handle new contact from GHL
        break;

      case 'opportunity.stage_change':
        // Handle stage changes made in GHL dashboard
        // Could sync back to bakery database
        break;

      default:
        console.log('[GHL Webhook] Unhandled event:', event.event_type);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[GHL Webhook] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

Add to your main app:

```javascript
app.use('/api/webhooks', require('./routes/ghl-webhook'));
```

---

## 9.6 Testing the Integration

### Test 1: Send Test Order to GHL

```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "customer_phone": "+16105551234",
    "customer_language": "en",
    "date_needed": "2025-01-20",
    "time_needed": "14:00",
    "cake_size": "8\" Round",
    "filling": "Tres Leches",
    "theme": "Test Order",
    "total_amount": 65.00
  }'
```

### Test 2: Check GHL Dashboard

1. Go to GoHighLevel
2. Check **Contacts** for the test user
3. Check **Opportunities** for the test order

### Test 3: Check Logs

```bash
# In your backend terminal, look for:
[GHL] Order sent successfully: ORD-xxx
```

---

## 9.7 Environment Variable Checklist

Verify all these are set in your `.env`:

```
[ ] GHL_API_KEY
[ ] GHL_LOCATION_ID
[ ] GHL_WEBHOOK_URL
[ ] GHL_PIPELINE_ID
[ ] GHL_STAGE_NEW_ORDER
[ ] GHL_STAGE_CONFIRMED
[ ] GHL_STAGE_IN_PROGRESS
[ ] GHL_STAGE_READY
[ ] GHL_STAGE_COMPLETED
[ ] GHL_STAGE_CANCELLED
[ ] GHL_ENABLED=true
[ ] GHL_SYNC_CONTACTS=true
[ ] GHL_CREATE_OPPORTUNITIES=true
```

---

## Checklist

- [ ] Added environment variables to `.env`
- [ ] Created `/backend/utils/gohighlevel.js`
- [ ] Updated order creation to send to GHL
- [ ] Updated status transitions to notify GHL
- [ ] (Optional) Created GHL webhook endpoint
- [ ] Tested order creation → GHL sync
- [ ] Verified contact appears in GHL
- [ ] Verified opportunity appears in pipeline

---

## Next Step

Proceed to: **[10-TESTING.md](./10-TESTING.md)**
