# Step 4: Create the Order Pipeline

The pipeline tracks each order's progress from placement to completion.

---

## 4.1 Navigate to Pipelines

1. Click **Opportunities** in the left sidebar
2. Click **Pipelines** tab at the top
3. Click **"+ Add Pipeline"**

---

## 4.2 Create the Cake Orders Pipeline

### Pipeline Settings

```
Pipeline Name: Cake Orders
```

Click **"Create Pipeline"**

---

## 4.3 Configure Pipeline Stages

Delete any default stages and create these (in order):

### Stage 1: New Order

```
Stage Name: New Order
Stage Color: Blue (#3B82F6)
```
**Description:** Order just received from website, awaiting confirmation

---

### Stage 2: Confirmed

```
Stage Name: Confirmed
Stage Color: Yellow (#EAB308)
```
**Description:** Payment verified, order confirmed with customer

---

### Stage 3: In Progress

```
Stage Name: In Progress
Stage Color: Orange (#F97316)
```
**Description:** Baker is working on the cake

---

### Stage 4: Ready for Pickup

```
Stage Name: Ready for Pickup
Stage Color: Green (#22C55E)
```
**Description:** Cake is complete, waiting for customer

---

### Stage 5: Picked Up / Delivered

```
Stage Name: Completed
Stage Color: Gray (#6B7280)
```
**Description:** Customer has received their order

---

### Stage 6: Cancelled

```
Stage Name: Cancelled
Stage Color: Red (#EF4444)
```
**Description:** Order was cancelled

---

## 4.4 Pipeline Visual

Your pipeline should look like this:

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  New Order  │ → │  Confirmed  │ → │ In Progress │ → │Ready Pickup │ → │  Completed  │   │  Cancelled  │
│    (Blue)   │   │  (Yellow)   │   │  (Orange)   │   │   (Green)   │   │   (Gray)    │   │    (Red)    │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

---

## 4.5 Configure Stage Settings (Optional)

For each stage, you can set:

### Automations
- Click on a stage → "Automations"
- Set workflows to trigger when opportunity enters stage

### Age Alerts
- Set alerts if order stays in stage too long
- Example: Alert if "In Progress" > 24 hours

---

## 4.6 Note Your Pipeline ID

1. Click on the pipeline name "Cake Orders"
2. Look at the URL:
   ```
   https://app.gohighlevel.com/v2/location/xxx/opportunities/pipeline/PIPELINE_ID
   ```
3. Copy the Pipeline ID after `/pipeline/`
4. Save it - needed for API calls

---

## 4.7 Note Stage IDs

You'll need stage IDs to move opportunities via API:

1. Go to **Settings** → **Pipelines** (or view pipeline settings)
2. Each stage has an ID
3. Note them down:

```
New Order:        ___________________
Confirmed:        ___________________
In Progress:      ___________________
Ready for Pickup: ___________________
Completed:        ___________________
Cancelled:        ___________________
```

---

## How Orders Will Flow

```
1. Website order placed
   ↓
2. Webhook creates Opportunity in "New Order" stage
   ↓
3. Front Desk confirms → Move to "Confirmed"
   ↓
4. Baker starts → Move to "In Progress"
   ↓
5. Cake ready → Move to "Ready for Pickup"
   → Trigger: Send SMS/Email to customer
   ↓
6. Customer picks up → Move to "Completed"
   → Trigger: Send thank you + review request
```

---

## Checklist

- [ ] Created "Cake Orders" pipeline
- [ ] Added 6 stages in correct order
- [ ] Colored each stage appropriately
- [ ] Noted Pipeline ID: `________________`
- [ ] Noted Stage IDs (6 IDs)

---

## Next Step

Proceed to: **[05-INBOUND-WEBHOOK.md](./05-INBOUND-WEBHOOK.md)**
