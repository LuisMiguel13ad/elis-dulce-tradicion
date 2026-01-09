# Step 1: Getting Started with GoHighLevel

## Prerequisites

- Active GoHighLevel account
- Admin or Agency Owner access
- Business email for notifications

---

## 1.1 Log Into GoHighLevel

1. Go to: **https://app.gohighlevel.com**
2. Enter your email and password
3. Complete 2FA if enabled

---

## 1.2 Access or Create Sub-Account

### If you have an Agency account:

1. Click **"Sub-Accounts"** in the left sidebar
2. Look for an existing bakery sub-account, OR
3. Click **"+ Add Sub-Account"**

### Creating a New Sub-Account:

Fill in the following:

```
Business Name: Eli's Dulce Tradicion
Business Email: orders@elisdulcetradicion.com (or your email)
Business Phone: 610-910-9067
Industry: Food & Beverage
Timezone: America/New_York (Eastern)
```

4. Click **"Save"**
5. Click on the sub-account to enter it

---

## 1.3 Verify You're in the Correct Location

Check the top-left corner - you should see:
```
Eli's Dulce Tradicion
```

If you see a different name, click it and switch to the bakery location.

---

## 1.4 Note Your Location ID

This is needed for API calls later.

1. Look at your browser URL when inside the sub-account
2. The URL will look like:
   ```
   https://app.gohighlevel.com/v2/location/ve9EPM428h8vShlRW1KT/dashboard
   ```
3. Copy the string after `/location/` - this is your **Location ID**
   ```
   Example: ve9EPM428h8vShlRW1KT
   ```

4. Save this somewhere - you'll need it in Step 8.

---

## 1.5 Quick Settings Check

Before proceeding, verify these settings:

### Business Profile
1. Go to **Settings** → **Business Profile**
2. Confirm:
   - Business name is correct
   - Phone number is correct
   - Address is filled in (for pickup directions)
   - Logo is uploaded (for emails)

### Email Settings
1. Go to **Settings** → **Email Services**
2. Either:
   - Use LC Email (included)
   - OR connect your own SMTP/Mailgun

### Phone Settings (for SMS)
1. Go to **Settings** → **Phone Numbers**
2. Either:
   - Use an LC phone number
   - OR port/add your business number

---

## Checklist Before Proceeding

- [ ] Logged into GoHighLevel
- [ ] In the correct sub-account (Eli's Bakery)
- [ ] Noted my Location ID: `________________`
- [ ] Business profile is complete
- [ ] Email sending is configured
- [ ] Phone/SMS is configured (optional but recommended)

---

## Next Step

Proceed to: **[02-CUSTOM-FIELDS.md](./02-CUSTOM-FIELDS.md)**
