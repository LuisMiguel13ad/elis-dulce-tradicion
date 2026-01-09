# Step 10: Testing the Integration

Complete testing guide to verify your GoHighLevel integration works correctly.

---

## 10.1 Pre-Testing Checklist

Before testing, verify:

- [ ] GoHighLevel sub-account is set up
- [ ] Custom fields created (8 fields)
- [ ] Tags created (24 tags)
- [ ] Pipeline created with 6 stages
- [ ] Inbound webhook workflow is published
- [ ] Outbound webhook workflows are published
- [ ] API credentials generated and saved
- [ ] Backend environment variables set
- [ ] Backend gohighlevel.js utility created
- [ ] Backend restarted after changes

---

## 10.2 Test 1: Inbound Webhook (Website → GHL)

### Method A: Use curl/Postman

Send a test payload directly to your GHL webhook:

```bash
curl -X POST "YOUR_GHL_INBOUND_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "order_created",
    "order_number": "TEST-001",
    "customer_name": "Maria Test",
    "customer_email": "maria.test@example.com",
    "customer_phone": "+16105551234",
    "customer_language": "es",
    "date_needed": "2025-01-25",
    "time_needed": "14:00",
    "cake_size": "10\" Round",
    "filling": "Tres Leches",
    "theme": "Quinceañera Test",
    "dedication": "Felices 15 años!",
    "special_instructions": "Gold crown topper",
    "delivery_option": "pickup",
    "total_amount": 185.00,
    "payment_status": "paid"
  }'
```

### Expected Result

1. **Contact Created:**
   - Go to GHL → Contacts
   - Search for "Maria Test"
   - Verify: name, email, phone, custom fields, tags

2. **Opportunity Created:**
   - Go to GHL → Opportunities → Cake Orders
   - Find "Order #TEST-001 - Maria Test"
   - Verify: stage is "New Order", value is $185

3. **Email Sent (if configured):**
   - Check your test email inbox
   - Should receive Spanish confirmation email

---

## 10.3 Test 2: Full Order Flow (End-to-End)

### Step 1: Place Order on Website

1. Go to your bakery website order form
2. Fill in test order:
   ```
   Name: John Test
   Email: john.test@example.com (use real email you can check)
   Phone: +16105559999
   Language: English
   Date: [3 days from now]
   Time: 2:00 PM
   Cake Size: 8" Round
   Filling: Chocolate
   Theme: Birthday Party
   ```
3. Submit the order

### Step 2: Verify in GHL

1. Check Contacts → "John Test" should appear
2. Check Opportunities → Order should be in "New Order" stage
3. Check contact tags: `new-customer`, `english-speaking`, `birthday-cake`

### Step 3: Move Order Through Stages

In GHL Opportunities:
1. Drag order to "Confirmed" → Verify internal notification
2. Drag to "In Progress" → No action expected
3. Drag to "Ready for Pickup" → Verify SMS/Email sent
4. Drag to "Completed" → Verify thank you email (after 24h delay)

---

## 10.4 Test 3: Status Sync (Dashboard → GHL)

### From Bakery Dashboard

1. Open bakery Front Desk dashboard
2. Find the test order
3. Click "Confirm" button
4. Check GHL → Opportunity should move to "Confirmed" stage

### Continue Testing

1. Click "Start" → GHL moves to "In Progress"
2. Click "Ready" → GHL moves to "Ready for Pickup" + triggers notifications
3. Click "Complete" → GHL moves to "Completed"

---

## 10.5 Test 4: Outbound Webhook (GHL → n8n)

### Verify n8n is Receiving

1. In n8n, create a test workflow:
   - Add Webhook node
   - Path: `/test-ghl-outbound`
   - Click "Listen for Test Event"

2. In GHL, manually move an opportunity to trigger webhook

3. Check n8n → Should receive the payload

### Common Issues

| Issue | Solution |
|-------|----------|
| n8n not receiving | Check webhook URL is correct |
| 401 Error | Check authentication settings |
| Empty payload | Check GHL payload mapping |

---

## 10.6 Test 5: Bilingual Support

### Test Spanish Flow

1. Create order with `customer_language: "es"`
2. Verify:
   - Confirmation email in Spanish
   - Ready SMS in Spanish
   - Contact tagged `spanish-speaking`

### Test English Flow

1. Create order with `customer_language: "en"`
2. Verify:
   - Confirmation email in English
   - Ready SMS in English
   - Contact tagged `english-speaking`

---

## 10.7 Test 6: Repeat Customer Detection

### Step 1: Create First Order

```
Name: Repeat Customer
Email: repeat@example.com
```

### Step 2: Verify Tags

- Should have: `new-customer`
- Should NOT have: `repeat-customer`
- `total_orders` should be: 1

### Step 3: Create Second Order

Use same email: `repeat@example.com`

### Step 4: Verify Updated Tags

- Should have: `repeat-customer`
- Should NOT have: `new-customer`
- `total_orders` should be: 2

---

## 10.8 Test 7: VIP Customer Tagging

### Create Multiple Orders

Create 3 orders with same customer email.

### Verify VIP Status

After 3rd order:
- Contact should have: `vip-customer` tag
- Should receive VIP email (if workflow set up)

---

## 10.9 Troubleshooting Common Issues

### Issue: Order not appearing in GHL

**Check:**
1. GHL_ENABLED=true in .env
2. GHL_WEBHOOK_URL is correct
3. Workflow is published in GHL
4. Check backend logs for errors

**Debug:**
```bash
# Check backend logs
tail -f /path/to/backend/logs

# Look for:
[GHL] Order sent successfully: ORD-xxx
# or
[GHL] Webhook failed: 404
```

### Issue: Contact not created

**Check:**
1. GHL_SYNC_CONTACTS=true
2. Email format is valid
3. Phone format includes country code

### Issue: Opportunity not created

**Check:**
1. GHL_CREATE_OPPORTUNITIES=true
2. GHL_PIPELINE_ID is correct
3. GHL_STAGE_NEW_ORDER is correct

### Issue: Emails not sending

**Check:**
1. Email settings configured in GHL
2. Contact has valid email
3. Workflow email action is configured

### Issue: SMS not sending

**Check:**
1. Twilio/LC phone configured
2. Phone number includes country code
3. SMS action is in workflow

---

## 10.10 Test Data Cleanup

After testing, clean up test data:

### In GoHighLevel

1. Go to Contacts
2. Search for test contacts (Maria Test, John Test, etc.)
3. Delete them

4. Go to Opportunities
5. Delete test opportunities

### In Bakery Database

```sql
DELETE FROM orders WHERE customer_email LIKE '%test%@example.com';
```

---

## 10.11 Final Verification Checklist

### Inbound (Website → GHL)

- [ ] New order creates contact in GHL
- [ ] New order creates opportunity in pipeline
- [ ] Contact has correct custom fields
- [ ] Contact has correct tags
- [ ] Confirmation email sends (EN and ES)

### Outbound (GHL → External)

- [ ] Stage change triggers outbound webhook
- [ ] n8n receives webhook payload
- [ ] Ready notification sends SMS
- [ ] Ready notification sends email
- [ ] Completed triggers thank you email

### Sync (Dashboard ↔ GHL)

- [ ] Dashboard status change updates GHL stage
- [ ] Repeat customers are detected
- [ ] VIP customers are tagged

### Bilingual

- [ ] Spanish customers get Spanish messages
- [ ] English customers get English messages
- [ ] Language preference is stored

---

## 10.12 Go-Live Checklist

Before going live with real customers:

- [ ] All tests passed
- [ ] Test data cleaned up
- [ ] Real business email configured
- [ ] Real phone number configured
- [ ] Backup of configuration taken
- [ ] Team trained on GHL dashboard
- [ ] Monitoring in place for errors

---

## Congratulations!

Your GoHighLevel integration is complete. New orders will now:

1. Automatically create contacts in your CRM
2. Track through your order pipeline
3. Send bilingual notifications
4. Build your customer database
5. Enable marketing automation

---

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review GHL workflow execution logs
3. Check backend server logs
4. GoHighLevel Support: https://help.gohighlevel.com

---

*Setup Complete - Eli's Dulce Tradicion + GoHighLevel*
