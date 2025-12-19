# Email Notifications Quick Start

## Prerequisites Checklist

- [ ] Supabase project created
- [ ] Resend account created (https://resend.com)
- [ ] Resend API key obtained
- [ ] Domain verified in Resend (or use test domain)

## Quick Setup (5 minutes)

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login and Link
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Set Secrets
```bash
supabase secrets set RESEND_API_KEY=re_your_key_here
supabase secrets set FRONTEND_URL=https://elisbakery.com
supabase secrets set FROM_EMAIL=orders@elisbakery.com
supabase secrets set FROM_NAME="Eli's Bakery"
```

### 4. Deploy Functions
```bash
supabase functions deploy send-order-confirmation
supabase functions deploy send-status-update
supabase functions deploy send-ready-notification
```

### 5. Run Database Migrations
Run these SQL files in Supabase SQL Editor:
- `backend/db/add-customer-language.sql` (adds language column)
- `backend/db/email-preferences-migration.sql` (adds email preferences)

### 6. Test
Create a test order and check your email!

## Email Types

| Event | Function | When Sent |
|-------|----------|-----------|
| Order Created | `send-order-confirmation` | After payment confirmed |
| Status Changed | `send-status-update` | When status updates |
| Order Ready | `send-ready-notification` | When status = 'ready' |
| Order Cancelled | `send-status-update` | When status = 'cancelled' |

## Troubleshooting

**No emails received?**
1. Check Resend dashboard for delivery status
2. Check spam folder
3. View edge function logs: `supabase functions logs send-order-confirmation`
4. Verify secrets are set: `supabase secrets list`

**Wrong language?**
- Check `customer_language` field in order (should be 'es' or 'en')
- Defaults to English if not set

**Function errors?**
- Check logs: `supabase functions logs FUNCTION_NAME`
- Verify RESEND_API_KEY is correct
- Check Resend API status

## Next Steps

See `EMAIL_NOTIFICATIONS_SETUP.md` for detailed setup instructions.
