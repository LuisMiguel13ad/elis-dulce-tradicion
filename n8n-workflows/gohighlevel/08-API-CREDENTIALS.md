# Step 8: Generate API Credentials

API credentials allow your bakery backend and n8n to communicate with GoHighLevel programmatically.

---

## 8.1 Understanding GHL API Options

GoHighLevel offers two API authentication methods:

| Method | Best For | Complexity |
|--------|----------|------------|
| **API Key** | Single location, simple integrations | Easy |
| **OAuth 2.0** | Multi-location, marketplace apps | Advanced |

**For the bakery, we'll use API Key authentication.**

---

## 8.2 Generate Location API Key

### Navigate to API Settings

1. Make sure you're in the correct sub-account (Eli's Bakery)
2. Go to **Settings** (gear icon)
3. Look for **Business Profile** or **Integrations**
4. Find **API Keys** or **Developer Settings**

### Alternative Path (Agency Level)

If you have an agency account:
1. Go to **Settings** → **Company**
2. Click **API Keys**
3. Select the location (Eli's Bakery)

### Generate New Key

1. Click **"+ Create API Key"** or **"Generate"**
2. Name it: `Bakery Website Integration`
3. Select permissions (or leave as Full Access)
4. Click **Create**

### Copy Your API Key

The key will look like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6InZlOUVQTTQyOGg4dlNoTFJXMUtUIiwiY29tcGFueV9pZCI6IjVEUE5YZ0R2Q0poUUl1OFlBS0xiIiwi...
```

**IMPORTANT:**
- Copy this immediately - you may not be able to see it again
- Store it securely (password manager, encrypted notes)
- Never commit to version control

```
My API Key:
_________________________________________________________________
_________________________________________________________________
```

---

## 8.3 Note Your Location ID

You should have this from Step 1, but verify:

1. Look at your GHL URL when in the sub-account:
```
https://app.gohighlevel.com/v2/location/LOCATION_ID/dashboard
```

2. Copy the Location ID:
```
My Location ID: _________________________________
```

---

## 8.4 Get Pipeline and Stage IDs

These are needed for creating/updating opportunities via API.

### Method 1: From URL

1. Go to **Opportunities** → **Pipelines**
2. Click on "Cake Orders" pipeline
3. URL shows: `/opportunities/pipeline/PIPELINE_ID`

### Method 2: Via API

```bash
curl -X GET "https://services.leadconnectorhq.com/opportunities/pipelines" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Version: 2021-07-28"
```

### Record Your IDs

```
Pipeline ID (Cake Orders): _________________________________

Stage IDs:
  New Order:        _________________________________
  Confirmed:        _________________________________
  In Progress:      _________________________________
  Ready for Pickup: _________________________________
  Completed:        _________________________________
  Cancelled:        _________________________________
```

---

## 8.5 Get Custom Field IDs

For API calls, you need the exact field keys.

### Method: Via API

```bash
curl -X GET "https://services.leadconnectorhq.com/locations/LOCATION_ID/customFields" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Version: 2021-07-28"
```

### Response Example

```json
{
  "customFields": [
    {
      "id": "abc123",
      "name": "preferred_language",
      "fieldKey": "contact.preferred_language",
      "dataType": "TEXT"
    },
    {
      "id": "def456",
      "name": "total_orders",
      "fieldKey": "contact.total_orders",
      "dataType": "NUMERICAL"
    }
  ]
}
```

### Record Your Field Keys

```
Custom Field Keys:
  preferred_language: _________________________________
  total_orders:       _________________________________
  total_spent:        _________________________________
  last_order_date:    _________________________________
  last_order_id:      _________________________________
  favorite_filling:   _________________________________
```

---

## 8.6 Test API Connection

### Test 1: List Contacts

```bash
curl -X GET "https://services.leadconnectorhq.com/contacts/" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Version: 2021-07-28" \
  -H "Content-Type: application/json" \
  -d '{"locationId": "YOUR_LOCATION_ID"}'
```

### Test 2: List Pipelines

```bash
curl -X GET "https://services.leadconnectorhq.com/opportunities/pipelines?locationId=YOUR_LOCATION_ID" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Version: 2021-07-28"
```

### Expected Response

If successful, you'll get a JSON response with data.

If error, check:
- API key is correct
- Location ID is correct
- Headers are properly formatted

---

## 8.7 API Rate Limits

GoHighLevel has rate limits:

| Tier | Requests/Minute |
|------|-----------------|
| Standard | 100 |
| Burst | 200 (short periods) |

For a small bakery, you won't hit these limits.

---

## 8.8 Credentials Summary

Fill in this summary for reference:

```
====================================
GOHIGHLEVEL API CREDENTIALS
====================================

Account Type: [ ] Agency [ ] Single Location

Location Name: Eli's Dulce Tradicion
Location ID:   _________________________________

API Key Name:  Bakery Website Integration
API Key:       _________________________________
               _________________________________

Pipeline: Cake Orders
Pipeline ID:   _________________________________

Stage IDs:
  New Order:        _________________________________
  Confirmed:        _________________________________
  In Progress:      _________________________________
  Ready for Pickup: _________________________________
  Completed:        _________________________________
  Cancelled:        _________________________________

Inbound Webhook URL (from Step 5):
_________________________________________________________________

====================================
```

---

## 8.9 Security Best Practices

1. **Never share API keys** in public repositories, Slack, email
2. **Use environment variables** - never hardcode in source code
3. **Rotate keys periodically** - every 90 days recommended
4. **Limit permissions** if possible - only grant what's needed
5. **Monitor usage** - check for unusual activity

---

## Checklist

- [ ] Generated API Key
- [ ] Copied and saved API Key securely
- [ ] Noted Location ID
- [ ] Noted Pipeline ID
- [ ] Noted all Stage IDs (6)
- [ ] Noted Custom Field Keys
- [ ] Tested API connection successfully
- [ ] Filled in credentials summary

---

## Next Step

Proceed to: **[09-BACKEND-CONFIG.md](./09-BACKEND-CONFIG.md)**
