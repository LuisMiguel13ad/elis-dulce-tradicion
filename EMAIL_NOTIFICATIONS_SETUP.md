# Email Notifications Setup Guide

This guide will help you set up email notifications using Supabase Edge Functions with Resend.

## Prerequisites

1. A Supabase project with Edge Functions enabled
2. A Resend account (sign up at https://resend.com)
3. Your Resend API key

## Step 1: Install Supabase CLI

Install the Supabase CLI to deploy edge functions:

```bash
npm install -g supabase
```

Or use npx:
```bash
npx supabase --version
```

## Step 2: Login to Supabase

```bash
supabase login
```

## Step 3: Link Your Project

```bash
supabase link --project-ref your-project-ref
```

You can find your project ref in your Supabase Dashboard URL:
`https://supabase.com/dashboard/project/your-project-ref`

## Step 4: Set Environment Variables

Set secrets for your edge functions:

```bash
# Resend API Key
supabase secrets set RESEND_API_KEY=re_your_api_key_here

# Frontend URL (for tracking links)
supabase secrets set FRONTEND_URL=https://elisbakery.com

# Email sender info
supabase secrets set FROM_EMAIL=orders@elisbakery.com
supabase secrets set FROM_NAME="Eli's Bakery"
```

Or set them in Supabase Dashboard:
1. Go to **Edge Functions** > **Settings**
2. Add secrets:
   - `RESEND_API_KEY`
   - `FRONTEND_URL`
   - `FROM_EMAIL`
   - `FROM_NAME`

## Step 5: Deploy Edge Functions

Deploy all three edge functions:

```bash
# Deploy order confirmation function
supabase functions deploy send-order-confirmation

# Deploy status update function
supabase functions deploy send-status-update

# Deploy ready notification function
supabase functions deploy send-ready-notification
```

## Step 6: Run Database Migration

Add email preferences to profiles table:

1. Go to Supabase Dashboard > SQL Editor
2. Run `backend/db/email-preferences-migration.sql`

This adds:
- `email_notifications_enabled` (master toggle)
- `email_order_updates` (status change emails)
- `email_ready_notifications` (ready emails)
- `email_promotions` (promotional emails)

## Step 7: Configure Backend Environment

Add to your backend `.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
# Or use VITE_SUPABASE_ANON_KEY if already set
```

## Step 8: Verify Domain in Resend

1. Go to Resend Dashboard > Domains
2. Add your domain (e.g., `elisbakery.com`)
3. Add the DNS records provided by Resend
4. Wait for verification (can take a few minutes)

**For testing**, you can use Resend's test domain, but emails will be marked as "via resend.dev".

## Step 9: Test Email Notifications

### Test Order Confirmation

1. Create a test order through your order form
2. Check that the confirmation email is sent
3. Verify email content and tracking link

### Test Status Updates

1. Update an order status in the dashboard
2. Check that the status update email is sent
3. Verify the email shows the correct status

### Test Ready Notification

1. Set an order status to 'ready'
2. Check that the ready notification email is sent
3. Verify delivery/pickup information is correct

## Email Templates

All email templates support bilingual content (English/Spanish) based on `customer_language` field:

- **Order Confirmation**: Sent when order is created
- **Status Update**: Sent when order status changes
- **Ready Notification**: Sent when order status = 'ready'
- **Cancellation**: Sent when order is cancelled (via status update)

## Email Preferences

Users can control email notifications via their profile:

```sql
-- Disable all emails
UPDATE profiles 
SET email_notifications_enabled = false 
WHERE id = 'user-id';

-- Disable only order updates
UPDATE profiles 
SET email_order_updates = false 
WHERE id = 'user-id';
```

**Note**: Edge functions should check these preferences before sending. This is a future enhancement.

## Troubleshooting

### "RESEND_API_KEY is not set" error

- Verify secrets are set: `supabase secrets list`
- Check Supabase Dashboard > Edge Functions > Settings
- Redeploy functions after setting secrets

### Emails not sending

1. Check Resend dashboard for delivery status
2. Verify domain is verified in Resend
3. Check edge function logs: `supabase functions logs send-order-confirmation`
4. Verify `FROM_EMAIL` matches your verified domain

### Edge function timeout

- Edge functions have a 60-second timeout
- Email sending should be fast, but if issues occur, check Resend API status
- Consider adding retry logic (already implemented in `edgeFunctions.ts`)

### Wrong language in emails

- Check `customer_language` field in order
- Should be 'es' or 'spanish' for Spanish
- Defaults to English if not set

## Monitoring

### View Edge Function Logs

```bash
# View logs for a specific function
supabase functions logs send-order-confirmation

# Follow logs in real-time
supabase functions logs send-order-confirmation --follow
```

### Check Resend Dashboard

- Go to Resend Dashboard > Emails
- View delivery status, opens, clicks
- Check for bounces or failures

## Production Checklist

- [ ] Domain verified in Resend
- [ ] All edge functions deployed
- [ ] Secrets configured
- [ ] Test emails sent successfully
- [ ] Tracking links work correctly
- [ ] Bilingual emails tested
- [ ] Error handling verified
- [ ] Monitoring set up

## Alternative: SendGrid

To use SendGrid instead of Resend:

1. Install SendGrid package in edge function:
   ```typescript
   import sgMail from "npm:@sendgrid/mail@^7.7.0";
   ```

2. Update edge functions to use SendGrid API
3. Set `SENDGRID_API_KEY` secret instead of `RESEND_API_KEY`

## Files Reference

- **Edge Functions**:
  - `supabase/functions/send-order-confirmation/index.ts`
  - `supabase/functions/send-status-update/index.ts`
  - `supabase/functions/send-ready-notification/index.ts`

- **Backend Utilities**:
  - `backend/utils/edgeFunctions.ts` - Helper for calling edge functions

- **Database**:
  - `backend/db/email-preferences-migration.sql` - Email preferences schema

- **Routes**:
  - `backend/routes/orders.js` - Updated to call edge functions
