# Step 7: Create Automation Workflows

Complete automation workflows for the bakery customer journey.

---

## 7.1 Overview of Workflows to Create

| # | Workflow Name | Trigger | Actions |
|---|---------------|---------|---------|
| 1 | New Order Received | Inbound Webhook | Contact + Opportunity + Email |
| 2 | Order Ready | Stage Change | SMS + Email |
| 3 | Order Completed | Stage Change | Thank You + Review Request |
| 4 | Pre-Pickup Reminder | 2 Hours Before | SMS Reminder |
| 5 | VIP Customer | 3+ Orders | Tag + Special Offer |
| 6 | Re-engagement | 90 Days Inactive | Email Campaign |

---

## 7.2 Workflow 1: New Order Received (Already created in Step 5)

See [05-INBOUND-WEBHOOK.md](./05-INBOUND-WEBHOOK.md)

---

## 7.3 Workflow 2: Order Ready for Pickup

### Create Workflow

1. Go to **Automation** → **Workflows**
2. Click **"+ Create Workflow"**
3. Name: `Bakery - Ready for Pickup`

### Trigger

**Opportunity Stage Changed**
```
Pipeline: Cake Orders
From Stage: In Progress
To Stage: Ready for Pickup
```

### Actions

#### Action 1: IF/ELSE - Check Language

Add **IF/ELSE** condition:
```
IF {{contact.customFields.preferred_language}} equals "es"
  → Spanish Path
ELSE
  → English Path
```

#### Action 2a: Send SMS (Spanish)

```
To: {{contact.phone}}
Message:
¡Hola {{contact.firstName}}! Tu pastel está listo para recoger en Eli's Dulce Tradicion.
Dirección: 123 Main St, Allentown, PA
Horario: Hoy hasta las 6PM
¡Gracias por tu pedido!
```

#### Action 2b: Send SMS (English)

```
To: {{contact.phone}}
Message:
Hi {{contact.firstName}}! Your cake is ready for pickup at Eli's Dulce Tradicion.
Address: 123 Main St, Allentown, PA
Hours: Today until 6PM
Thank you for your order!
```

#### Action 3a: Send Email (Spanish)

```
Subject: ¡Tu Pastel Está Listo! 🎂
From: Eli's Dulce Tradicion
```

**Email Body (Spanish):**
```html
<h1>¡Hola {{contact.firstName}}!</h1>

<p>¡Estamos emocionados de informarte que tu pastel está listo para recoger!</p>

<h2>Detalles del Pedido</h2>
<p><strong>Número de Orden:</strong> {{opportunity.name}}</p>

<h2>Información de Recogida</h2>
<p><strong>Dirección:</strong> 123 Main St, Allentown, PA 18101</p>
<p><strong>Horario:</strong> Lunes - Sábado, 9AM - 6PM</p>

<p>Por favor trae una identificación al recoger tu pedido.</p>

<p>¡Gracias por elegir Eli's Dulce Tradicion!</p>

<p>Con cariño,<br>El equipo de Eli's</p>
```

#### Action 3b: Send Email (English)

```
Subject: Your Cake is Ready! 🎂
From: Eli's Dulce Tradicion
```

**Email Body (English):**
```html
<h1>Hi {{contact.firstName}}!</h1>

<p>We're excited to let you know that your cake is ready for pickup!</p>

<h2>Order Details</h2>
<p><strong>Order Number:</strong> {{opportunity.name}}</p>

<h2>Pickup Information</h2>
<p><strong>Address:</strong> 123 Main St, Allentown, PA 18101</p>
<p><strong>Hours:</strong> Monday - Saturday, 9AM - 6PM</p>

<p>Please bring ID when picking up your order.</p>

<p>Thank you for choosing Eli's Dulce Tradicion!</p>

<p>With love,<br>The Eli's Team</p>
```

---

## 7.4 Workflow 3: Order Completed (Thank You + Review)

### Create Workflow

Name: `Bakery - Post Pickup Thank You`

### Trigger

**Opportunity Stage Changed**
```
Pipeline: Cake Orders
From Stage: Ready for Pickup
To Stage: Completed
```

### Actions

#### Action 1: Wait

```
Wait: 24 hours
```

#### Action 2: Add Tag

```
Tag: review-requested
```

#### Action 3: IF/ELSE - Language Check

Same as above workflow

#### Action 4a: Send Email (Spanish)

```
Subject: ¡Gracias por tu pedido! ¿Nos dejas una reseña? ⭐
```

**Body:**
```html
<h1>¡Gracias {{contact.firstName}}!</h1>

<p>Esperamos que hayas disfrutado tu pastel de Eli's Dulce Tradicion.</p>

<p>Tu opinión es muy importante para nosotros. ¿Podrías dejarnos una reseña en Google?</p>

<p><a href="https://g.page/r/YOUR_GOOGLE_REVIEW_LINK/review">
  👉 Dejar una Reseña
</a></p>

<p>¡Gracias por ser parte de nuestra familia!</p>

<p>Con cariño,<br>Eli's Dulce Tradicion</p>
```

#### Action 4b: Send Email (English)

```
Subject: Thank you for your order! Leave us a review? ⭐
```

**Body:**
```html
<h1>Thank you {{contact.firstName}}!</h1>

<p>We hope you enjoyed your cake from Eli's Dulce Tradicion.</p>

<p>Your feedback means the world to us. Would you mind leaving us a Google review?</p>

<p><a href="https://g.page/r/YOUR_GOOGLE_REVIEW_LINK/review">
  👉 Leave a Review
</a></p>

<p>Thank you for being part of our family!</p>

<p>With love,<br>Eli's Dulce Tradicion</p>
```

---

## 7.5 Workflow 4: Pre-Pickup Reminder

### Create Workflow

Name: `Bakery - Pickup Reminder (2 Hours)`

### Trigger

**Opportunity Stage Changed**
```
Pipeline: Cake Orders
To Stage: Ready for Pickup
```

### Actions

#### Action 1: Wait Until

```
Wait until: {{opportunity.customFields.pickup_time}} - 2 hours
```

*Note: You may need to calculate this differently based on how pickup time is stored*

**Alternative: Use a scheduled trigger or manual time-based logic**

#### Action 2: IF Check

```
IF opportunity stage STILL = Ready for Pickup
  → Continue
ELSE
  → Stop (already picked up)
```

#### Action 3: Send SMS

```
Message (Spanish):
Recordatorio: Tu pastel te espera en Eli's. Recuerda recogerlo hoy antes de las 6PM. ¡Gracias!

Message (English):
Reminder: Your cake is waiting at Eli's. Remember to pick it up today before 6PM. Thank you!
```

---

## 7.6 Workflow 5: VIP Customer Tagging

### Create Workflow

Name: `Bakery - VIP Customer Auto-Tag`

### Trigger

**Contact Field Changed**
```
Field: total_orders
```

### Actions

#### Action 1: IF Condition

```
IF {{contact.customFields.total_orders}} >= 3
  OR {{contact.customFields.total_spent}} >= 500
```

#### Action 2: Add Tag

```
Tag: vip-customer
```

#### Action 3: Remove Tag

```
Remove: new-customer
Add: repeat-customer
```

#### Action 4: Send Email

```
Subject: You're Now a VIP! 🌟
```

**Body:**
```html
<h1>Welcome to our VIP Family, {{contact.firstName}}!</h1>

<p>As a thank you for your continued support, you now have access to:</p>

<ul>
  <li>10% off your next order</li>
  <li>Early access to seasonal specials</li>
  <li>Priority pickup times</li>
</ul>

<p>Use code <strong>VIP10</strong> on your next order!</p>
```

---

## 7.7 Workflow 6: Re-engagement (90 Days Inactive)

### Create Workflow

Name: `Bakery - Re-engagement Campaign`

### Trigger

**Contact Tag Added**
```
Tag: inactive-90-days
```

*Note: You'll need a separate workflow to add this tag based on last_order_date*

### Actions

#### Action 1: Send Email

```
Subject: We Miss You! Here's 15% Off 🎂
```

**Body:**
```html
<h1>Hi {{contact.firstName}}, we miss you!</h1>

<p>It's been a while since we've seen you at Eli's Dulce Tradicion.</p>

<p>We'd love to make your next celebration extra sweet with:</p>

<h2>15% OFF Your Next Order</h2>

<p>Use code: <strong>COMEBACK15</strong></p>

<p><a href="https://elisdulcetradicion.com/order">Order Now →</a></p>

<p>This offer expires in 30 days.</p>
```

#### Action 2: Wait

```
Wait: 7 days
```

#### Action 3: IF Condition

```
IF tag "inactive-90-days" still present
  → Send follow-up
ELSE
  → Stop (they ordered)
```

#### Action 4: Send Follow-up SMS

```
Message:
Hi {{contact.firstName}}! Don't forget - your 15% off code COMEBACK15 expires soon. We'd love to bake something special for you! 🎂
```

---

## Checklist

- [ ] Workflow 1: New Order Received (from Step 5)
- [ ] Workflow 2: Ready for Pickup (SMS + Email)
- [ ] Workflow 3: Post Pickup Thank You
- [ ] Workflow 4: Pre-Pickup Reminder
- [ ] Workflow 5: VIP Customer Auto-Tag
- [ ] Workflow 6: Re-engagement Campaign
- [ ] All workflows published
- [ ] Email templates created
- [ ] Google Review link added

---

## Next Step

Proceed to: **[08-API-CREDENTIALS.md](./08-API-CREDENTIALS.md)**
