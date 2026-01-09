# Step 2: Create Custom Fields

Custom fields store bakery-specific customer data that GoHighLevel doesn't have by default.

---

## 2.1 Navigate to Custom Fields

1. Go to **Settings** (gear icon in sidebar)
2. Click **Custom Fields**
3. Select the **Contact** tab (should be default)

---

## 2.2 Create Each Custom Field

Click **"+ Add Field"** for each field below:

### Field 1: Preferred Language

```
Field Name: preferred_language
Field Type: Dropdown (Single Option)
Options:
  - English
  - Spanish
Required: No
```

**Why:** Send emails/SMS in customer's preferred language

---

### Field 2: Total Orders

```
Field Name: total_orders
Field Type: Number
Default Value: 0
Required: No
```

**Why:** Track how many orders each customer has placed

---

### Field 3: Total Spent

```
Field Name: total_spent
Field Type: Number (or Monetary if available)
Default Value: 0
Required: No
```

**Why:** Track lifetime customer value

---

### Field 4: Last Order Date

```
Field Name: last_order_date
Field Type: Date
Required: No
```

**Why:** Know when customer last ordered (for re-engagement)

---

### Field 5: Last Order ID

```
Field Name: last_order_id
Field Type: Single Line Text
Required: No
```

**Why:** Reference to link back to bakery system

---

### Field 6: Favorite Filling

```
Field Name: favorite_filling
Field Type: Single Line Text
Required: No
```

**Why:** Personalization for future marketing

---

### Field 7: Favorite Cake Size

```
Field Name: favorite_cake_size
Field Type: Dropdown (Single Option)
Options:
  - 6" Round
  - 8" Round
  - 10" Round
  - 12" Round
  - 1/4 Sheet
  - 1/2 Sheet
  - Full Sheet
  - Cupcakes (12)
  - Cupcakes (24)
Required: No
```

**Why:** Know customer preferences

---

### Field 8: Special Occasions

```
Field Name: special_occasions
Field Type: Multi-Line Text
Required: No
```

**Why:** Note birthdays, anniversaries for reminders

---

## 2.3 Verify Fields Were Created

After creating all fields:

1. You should see 8 custom fields listed
2. They should appear under "Contact" type
3. Note the **Field Key** for each (shown in gray) - you'll need these for API calls

Example field keys:
```
preferred_language
total_orders
total_spent
last_order_date
last_order_id
favorite_filling
favorite_cake_size
special_occasions
```

---

## 2.4 Screenshot Your Field Keys

Take a screenshot or copy the field keys. The exact keys might be slightly different (like `contact.preferred_language`).

You'll need these exact keys when:
- Setting up webhooks
- Creating workflows
- Making API calls from n8n

---

## Checklist

- [ ] Created `preferred_language` dropdown
- [ ] Created `total_orders` number field
- [ ] Created `total_spent` number field
- [ ] Created `last_order_date` date field
- [ ] Created `last_order_id` text field
- [ ] Created `favorite_filling` text field
- [ ] Created `favorite_cake_size` dropdown
- [ ] Created `special_occasions` text field
- [ ] Noted all field keys

---

## Next Step

Proceed to: **[03-TAGS-SETUP.md](./03-TAGS-SETUP.md)**
