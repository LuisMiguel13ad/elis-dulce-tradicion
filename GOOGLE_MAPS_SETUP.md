# 🗺️ Google Maps Integration Setup Guide

## Overview
Your bakery system now includes Google Maps integration for:
1. ✅ **Address Autocomplete** - Validates addresses as customers type
2. ✅ **Clickable Addresses** - Dashboard links open in Google Maps
3. ✅ **Language Tracking** - Save customer's language for notifications

---

## 🚀 Quick Start

### **Option 1: With Google Maps API (Recommended)**
Full address validation and autocomplete

### **Option 2: Without API Key**
Manual address entry with basic validation (still works!)

---

## 📝 Getting Your Google Maps API Key

### **Step 1: Create Google Cloud Project**

1. Go to: **https://console.cloud.google.com/**
2. Click **"Create Project"** or select existing project
3. Name it: "Elis Bakery" (or whatever you prefer)
4. Click **"Create"**

### **Step 2: Enable Required APIs**

1. In the console, go to: **"APIs & Services" → "Library"**
2. Search and enable these APIs:
   - ✅ **Maps JavaScript API**
   - ✅ **Places API**

### **Step 3: Create API Key**

1. Go to: **"APIs & Services" → "Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. Copy the API key (looks like: `AIzaSyBxxx...`)

### **Step 4: Secure Your API Key (Important!)**

1. Click **"Edit API key"** (pencil icon)
2. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
3. Add your domains:
   ```
   localhost:5174/*
   localhost:5173/*
   yourdomain.com/*
   *.yourdomain.com/*
   ```
4. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check: **Maps JavaScript API**
   - Check: **Places API**
5. Click **"Save"**

### **Step 5: Set Up Billing (Required but Cheap!)**

1. Go to **"Billing"** in Google Cloud Console
2. Link a credit/debit card
3. **Don't worry!** Google gives you:
   - 💰 **$200 free credit every month**
   - 🎁 **First 90 days: $300 additional credit**
   - 📊 Your usage will be minimal (a few cents/month max)

### **Estimated Costs:**
- Places Autocomplete: $2.83 per 1,000 requests
- With $200/month free = ~70,000 free requests
- For a small bakery: **Essentially FREE**

---

## 🔧 Add API Key to Your Project

### **Step 1: Create .env File**

In your project root, create a file named `.env`:

```bash
# Copy from .env.example and fill in
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxx_your_actual_key_here
VITE_API_URL=http://localhost:3001
```

### **Step 2: Restart Development Server**

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✨ Features Explained

### **1. Language Tracking 🇲🇽 🇺🇸**

**What it does:**
- Saves which language customer used when ordering (Spanish or English)
- Shows flag next to customer name on dashboard
- Tells you which language to use for notifications

**Dashboard Display:**
```
Cliente
María González 🇲🇽
610-555-0101
Notificar en Español
```

**Why it matters:**
- Send WhatsApp messages in correct language
- Professional customer service
- No more confusion about language preference

---

### **2. Google Maps Address Links 📍**

**What it does:**
- Makes delivery addresses clickable on dashboard
- Opens directly in Google Maps (new tab)
- Shows external link icon

**Before:**
```
🚗 ENTREGA A DOMICILIO
123 Main St, Bensalem, PA 19020
(Need to copy/paste to Maps)
```

**After:**
```
🚗 ENTREGA A DOMICILIO
📍 123 Main St, Bensalem, PA 19020 ↗️
👆 Click para abrir en Google Maps
(One click - opens Maps!)
```

**How it works:**
- Click the address
- Google Maps opens in new tab
- Address already searched
- Ready for navigation!

---

### **3. Address Autocomplete & Validation ✅**

**What it does:**
- As customer types, shows real address suggestions
- Validates address exists
- Auto-formats address correctly
- Shows success message when valid

**Customer Experience:**

1. **Start typing:**
   ```
   123 Main S...
   ```

2. **See suggestions:**
   ```
   ↓ 123 Main St, Bensalem, PA 19020
   ↓ 123 Main St, Philadelphia, PA 19103
   ↓ 123 Main St, Levittown, PA 19054
   ```

3. **Select one:**
   ```
   ✅ Dirección validada con Google Maps
   Address: 123 Main St, Bensalem, PA 19020
   ```

**Benefits:**
- ✅ No typos in addresses
- ✅ Real addresses only
- ✅ Correct formatting
- ✅ Includes city, state, zip
- ✅ Less delivery issues

---

## 🧪 Testing

### **Test Language Tracking:**

1. **Order in Spanish:**
   - Keep language toggle on "ES"
   - Place order
   - Check dashboard → Should show 🇲🇽

2. **Order in English:**
   - Switch language to "EN"
   - Place order
   - Check dashboard → Should show 🇺🇸

3. **Verify Database:**
   ```bash
   sqlite3 backend/db/bakery.db
   SELECT customer_name, customer_language FROM orders;
   ```

### **Test Google Maps Links:**

1. Go to dashboard: `http://localhost:5174/bakery-dashboard`
2. Find delivery order
3. Click the address (blue underlined text)
4. Should open Google Maps in new tab
5. Address should be searched automatically

### **Test Address Autocomplete:**

**With API Key:**
1. Go to: `http://localhost:5174/order`
2. Select "Entrega a Domicilio"
3. Start typing in address field: "123 Main"
4. Should see dropdown with suggestions
5. Select one
6. Should see: "✅ Dirección validada con Google Maps"

**Without API Key:**
1. Same as above
2. No suggestions appear
3. Shows: "⚠️ Address validation unavailable"
4. Manual entry still works with basic validation

---

## 🎯 Production Deployment

### **Environment Variables:**

Create `.env.production`:
```bash
VITE_GOOGLE_MAPS_API_KEY=your_production_api_key
VITE_API_URL=https://api.yourdomain.com
```

### **Update API Key Restrictions:**

In Google Cloud Console:
1. Add your production domain:
   ```
   elis-dulce-tradicion.com/*
   *.elis-dulce-tradicion.com/*
   ```

### **Build for Production:**

```bash
npm run build
```

---

## 🔒 Security Best Practices

### **Do's:**
✅ Add domain restrictions
✅ Add API restrictions
✅ Keep .env file out of git (.gitignore)
✅ Use different keys for dev/prod
✅ Monitor usage in Google Console
✅ Set up billing alerts

### **Don'ts:**
❌ Don't commit API keys to git
❌ Don't share keys publicly
❌ Don't use same key for multiple projects
❌ Don't skip domain restrictions

---

## 🐛 Troubleshooting

### **"Address autocomplete not working"**

**Check:**
1. Is `VITE_GOOGLE_MAPS_API_KEY` in `.env`?
2. Did you restart the dev server after adding it?
3. Check browser console for errors
4. Verify APIs are enabled in Google Console

**Still not working?**
- Manual entry still works!
- Basic validation catches most errors

### **"Google Maps link not opening"**

**Check:**
1. Is there a delivery address saved?
2. Try clicking the blue underlined address text
3. Check popup blocker settings

### **"Wrong language flag showing"**

**Check:**
1. Which language toggle was active when order was placed?
2. Check database: `customer_language` field
3. Default is "es" if not specified

---

## 📊 Database Schema

### **New Field Added:**

```sql
customer_language TEXT DEFAULT 'es'
-- Values: 'es' or 'en'
```

### **All Orders Table Fields:**

```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  order_number TEXT UNIQUE,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_language TEXT DEFAULT 'es',    -- 🆕 NEW!
  date_needed TEXT,
  time_needed TEXT,
  cake_size TEXT,
  filling TEXT,
  theme TEXT,
  dedication TEXT,
  delivery_option TEXT,                    -- 'pickup' or 'delivery'
  delivery_address TEXT,
  delivery_apartment TEXT,
  square_payment_id TEXT,
  total_amount REAL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  ready_at TEXT,
  out_for_delivery_at TEXT,
  delivered_at TEXT,
  estimated_delivery_time TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎨 UI Changes Summary

### **Dashboard:**
```
Before:
Cliente
María González
610-555-0101

🚗 ENTREGA A DOMICILIO
123 Main St, Bensalem, PA 19020

After:
Cliente
María González 🇲🇽        ← Language flag
610-555-0101
Notificar en Español       ← Notification hint

🚗 ENTREGA A DOMICILIO
📍 123 Main St, Bensalem... ↗️  ← Clickable link
👆 Click para abrir en Maps
```

### **Order Form:**
```
Before:
[Dirección de Entrega]
[Type manually...]

After:
[Dirección de Entrega]
[Start typing for suggestions...]
💡 Empieza a escribir y selecciona
✅ Dirección validada con Google Maps  ← Success message
```

---

## 💡 Pro Tips

### **For Staff:**
1. Look for the flag (🇲🇽 or 🇺🇸) before sending messages
2. Click addresses directly - no more copy/paste!
3. Green checkmark = validated address
4. If autocomplete isn't working, manual entry is fine

### **For Development:**
1. Test both with and without API key
2. Check console for Google Maps errors
3. Test on different browsers
4. Verify mobile experience

### **For Customers:**
1. Autocomplete makes ordering faster
2. Less chance of delivery errors
3. Professional experience
4. Works in both languages

---

## 📈 Next Steps (Optional)

### **Enhanced Features:**
- [ ] Show map preview on order confirmation
- [ ] Calculate delivery distance/time
- [ ] Delivery zone restrictions
- [ ] Multiple delivery addresses per customer
- [ ] Save favorite addresses

### **Analytics:**
- [ ] Track most common delivery areas
- [ ] Monitor average delivery times
- [ ] Address validation success rate

---

## 🆘 Support

### **Need Help?**

1. **Google Maps Issues:**
   - https://console.cloud.google.com/google/maps-apis/support

2. **API Billing Questions:**
   - https://cloud.google.com/billing/docs

3. **Code Issues:**
   - Check browser console (F12)
   - Look at server logs
   - Review this guide

---

## 📝 Summary

**What You Got:**
✅ Language tracking for all customers
✅ Clickable addresses on dashboard
✅ Google Maps address validation
✅ Better customer experience
✅ Fewer delivery errors
✅ Professional system

**What You Need:**
- Google Maps API key (free for your volume)
- 5 minutes to set up
- Works without it too (graceful fallback)

**Cost:**
- FREE up to 70,000 requests/month
- Your bakery will use ~100-500/month
- Essentially $0

---

**Setup Time:** 5-10 minutes
**Difficulty:** Easy
**Benefit:** HUGE! ✨

Ready to set it up? Follow the steps above! 🚀

