# Phase 2: Verify Order Emails - Research

**Researched:** 2026-02-01
**Domain:** Email verification, Supabase Edge Functions, Resend API, Manual Testing
**Confidence:** HIGH

## Summary

This phase focuses on **verifying existing email functionality**, not building new features. The codebase already has a complete email notification system implemented using Supabase Edge Functions with Resend. Research confirms this is a standard, production-ready architecture.

The primary work involves systematic testing of the order confirmation email (triggered on order creation) and the ready notification email (triggered when status changes to "ready"). Testing must cover both English and Spanish emails, pickup and delivery options, and verify email deliverability including spam folder checks.

Based on the CONTEXT.md decisions: manual testing first with 5-6 test orders in production, then add automated regression tests that send real emails (not mocked).

**Primary recommendation:** Use a structured test matrix covering language (en/es) x delivery option (pickup/delivery) combinations, verify emails arrive within 60 seconds, and document all debugging steps for future troubleshooting.

## Standard Stack

The existing implementation uses established, production-ready technologies:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Supabase Edge Functions | Deno runtime | Email sending triggers | Native Supabase integration, serverless, no cold starts |
| Resend | ^4.0.0 | Email delivery API | Modern developer-focused ESP, handles SPF/DKIM automatically |
| i18next | ^25.7.2 | Language detection | Site-wide i18n, language carries through to orders |

### Supporting (Already Implemented)
| Tool | Purpose | When to Use |
|------|---------|-------------|
| Supabase CLI | Deploy functions, view logs, manage secrets | Debugging Edge Function issues |
| Resend Dashboard | Email delivery status, bounces, opens | Verify email delivery success |
| Supabase Dashboard | Function invocations, error logs | Debug function execution |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Resend | SendGrid | SendGrid is more complex setup; Resend handles SPF/DKIM automatically |
| Edge Functions | n8n/Make.com | Already have legacy Make.com fallback; Edge Functions are simpler for this use case |

**No installation needed:** Stack already deployed and configured.

## Architecture Patterns

### Existing Email Flow (Do Not Modify)
```
Order Created (backend/routes/orders.js)
    |
    v
sendOrderConfirmationEmail(order) [async, non-blocking]
    |
    v
Edge Function: send-order-confirmation
    |
    v
Resend API -> Customer Inbox
```

```
Status Changed to "ready" (backend/routes/orders.js)
    |
    v
sendReadyNotificationEmail(order) [async, non-blocking]
    |
    v
Edge Function: send-ready-notification
    |
    v
Resend API -> Customer Inbox
```

### Language Determination Pattern
```typescript
// In Order.tsx (line 456) - language comes from site toggle
customer_language: language  // From useLanguage() context

// In Edge Functions - language detection
const isSpanish = order.customer_language === 'es' || order.customer_language === 'spanish';
```

### Test Matrix Pattern
**Required combinations for comprehensive testing:**
```
| # | Language | Delivery   | Expected Template     |
|---|----------|------------|----------------------|
| 1 | English  | Pickup     | EN confirmation, EN ready with pickup location |
| 2 | English  | Delivery   | EN confirmation, EN ready with delivery address |
| 3 | Spanish  | Pickup     | ES confirmation, ES ready with pickup location |
| 4 | Spanish  | Delivery   | ES confirmation, ES ready with delivery address |
```

### Anti-Patterns to Avoid
- **Mocking emails in tests:** Decision is to send real emails to test inbox - use actual Resend test addresses
- **Testing only one language:** Both EN and ES must be verified; translation issues are common
- **Ignoring spam folders:** Always check spam/junk in addition to inbox
- **Blocking on email failures:** Email calls are async; don't wait for them in order flow

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email delivery testing | Custom SMTP checker | Resend Dashboard | Shows delivery status, bounces, opens per email |
| Edge Function debugging | Custom logging | `supabase functions logs` CLI + Dashboard | Built-in invocation logs, error tracking |
| Test email addresses | Fake email generators | Resend test addresses (`delivered@resend.dev`, etc.) | Simulate bounces, complaints safely |
| Spam folder detection | Manual checking only | Ask test recipient to check spam | Simple, reliable, matches real user behavior |

**Key insight:** The debugging infrastructure already exists in Supabase and Resend dashboards. The phase is about using these tools systematically, not building new tooling.

## Common Pitfalls

### Pitfall 1: Email Landing in Spam
**What goes wrong:** Emails arrive but go to spam folder, appearing as "not delivered"
**Why it happens:** New sending domain, SPF/DKIM misconfiguration, email content triggers filters
**How to avoid:**
1. Check SPF/DKIM records in Resend dashboard
2. Use verified domain (elisbakery.com should already be verified)
3. Always check spam folders during testing
**Warning signs:** Resend shows "delivered" but no email in inbox; check spam immediately

### Pitfall 2: Edge Function Invocation Failures
**What goes wrong:** Email never sent; customer receives no notification
**Why it happens:** Missing secrets (RESEND_API_KEY), function not deployed, authorization issues
**How to avoid:**
1. Verify secrets: `supabase secrets list`
2. Check function deployment: `supabase functions list`
3. Review function logs for errors
**Warning signs:** No log entries in Supabase Functions dashboard for the function

### Pitfall 3: Wrong Language in Email
**What goes wrong:** Customer set Spanish on site but receives English email (or vice versa)
**Why it happens:** `customer_language` field not properly set or not matching expected values
**How to avoid:**
1. Verify order record has correct `customer_language` value in database
2. Check Edge Function receives the language field in request body
3. Test language toggle before placing each test order
**Warning signs:** `customer_language` is null or unexpected value in database

### Pitfall 4: Missing Order Details in Email
**What goes wrong:** Email arrives but missing order number, delivery address, or other details
**Why it happens:** Order data not fully passed to Edge Function, template interpolation errors
**How to avoid:**
1. Log full order object in Edge Function
2. Check each field is populated in order record before status change
**Warning signs:** Template shows `${undefined}` or blank values

### Pitfall 5: Delivery Delay Beyond 1 Minute
**What goes wrong:** Email arrives but takes too long (user thinks it failed)
**Why it happens:** Edge Function cold start, Resend API delays, async queue backup
**How to avoid:**
1. Time from trigger to email receipt
2. Check Edge Function execution duration in logs
3. Check Resend dashboard for queue delays
**Warning signs:** Execution time > 10s, or email timestamps show significant delay

## Code Examples

### Viewing Edge Function Logs
```bash
# Source: Supabase CLI documentation

# List deployed functions
supabase functions list

# View logs for order confirmation function (in Supabase Dashboard)
# Navigate to: Project > Edge Functions > send-order-confirmation > Logs

# Set/verify secrets
supabase secrets list
supabase secrets set RESEND_API_KEY=re_xxx FRONTEND_URL=https://elisbakery.com

# Deploy function if needed
supabase functions deploy send-order-confirmation
supabase functions deploy send-ready-notification
```

### Test Order Data Pattern
```typescript
// Source: Existing test-orders.ts pattern in codebase

// Use obviously test data per CONTEXT.md decision
const testOrder = {
  customer_name: 'Test Customer',
  customer_email: 'your-test-email@example.com', // Use personal email to receive
  customer_phone: '+16105551234',
  customer_language: 'es', // Toggle language on site first
  date_needed: '2026-02-05',
  time_needed: '14:00',
  cake_size: '10" Round',
  filling: 'Tres Leches',
  theme: 'Test Birthday Theme',
  dedication: 'Test Dedication Message',
  delivery_option: 'pickup', // or 'delivery'
  delivery_address: delivery_option === 'delivery' ? '123 Test St, Norristown, PA 19401' : '',
  total_amount: 50.00,
};
```

### Resend Test Email Addresses
```
# Source: https://resend.com/docs/dashboard/emails/send-test-emails

# Use these to test webhook/delivery scenarios (if needed):
delivered@resend.dev     - Simulates successful delivery
bounced@resend.dev       - Simulates bounce (SMTP 550)
complained@resend.dev    - Simulates spam complaint
suppressed@resend.dev    - Simulates suppressed address

# Supports labeling: delivered+order123@resend.dev
```

### Manual Test Execution Script
```bash
# Verification steps for each test order:

# 1. Before placing order
- Note current time: __:__
- Verify site language toggle is set to: [EN/ES]
- Open browser in incognito to avoid cached language

# 2. Place test order via /order page
- Use test customer data
- Complete payment with test card
- Note order number: ORD-XXXX

# 3. Verify Order Confirmation Email
- Check inbox (wait up to 60 seconds)
- Check spam folder if not in inbox
- Verify: Subject line, language, order details, tracking link
- Note time received: __:__
- Calculate delay: ___ seconds

# 4. Change order status to "ready" in Front Desk Dashboard
- Navigate to /front-desk or /owner-dashboard
- Find order by order number
- Change status to "ready"
- Note time of status change: __:__

# 5. Verify Ready Notification Email
- Check inbox (wait up to 60 seconds)
- Check spam folder if not in inbox
- Verify: Subject line, language, pickup/delivery info, tracking link
- Note time received: __:__
- Calculate delay: ___ seconds

# 6. Cancel test order to clean up
- Change status to cancelled or delete test order
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Make.com webhooks | Supabase Edge Functions | Dec 2024 | Faster, more reliable, integrated |
| Single language | i18next with EN/ES | Dec 2024 | Full bilingual support |
| SMTP direct | Resend API | Dec 2024 | Better deliverability, dashboard monitoring |

**Note:** Legacy Make.com webhook fallback still exists in codebase but Edge Functions are primary.

## Open Questions

1. **Resend domain verification status**
   - What we know: Code expects verified domain for FROM_EMAIL
   - What's unclear: Is elisbakery.com fully verified in Resend dashboard?
   - Recommendation: Check Resend dashboard for domain status before testing; if using resend.dev sandbox, emails will be marked as "via resend.dev"

2. **Spanish translation quality**
   - What we know: Templates have Spanish translations inline in Edge Functions
   - What's unclear: Are there any grammar/localization issues?
   - Recommendation: Have Spanish speaker review emails during testing per CONTEXT.md decision

3. **Spam folder likelihood**
   - What we know: Resend handles SPF/DKIM
   - What's unclear: Current sender reputation for elisbakery.com
   - Recommendation: Test with Gmail, Outlook, Yahoo if possible; document any spam folder placements

## Sources

### Primary (HIGH confidence)
- Codebase: `supabase/functions/send-order-confirmation/index.ts` - Verified implementation
- Codebase: `supabase/functions/send-ready-notification/index.ts` - Verified implementation
- Codebase: `backend/routes/orders.js` - Email trigger integration
- Codebase: `backend/utils/edgeFunctions.ts` - Edge function utility wrapper
- [Supabase Edge Functions Logging](https://supabase.com/docs/guides/functions/logging) - Log access methods

### Secondary (MEDIUM confidence)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction) - CLI commands
- [Resend Test Emails](https://resend.com/docs/dashboard/emails/send-test-emails) - Test email addresses
- Codebase: `EMAIL_NOTIFICATIONS_IMPLEMENTATION.md` - Implementation documentation

### Tertiary (LOW confidence)
- [Email Deliverability Checklist 2026](https://mailshake.com/blog/the-ultimate-2026-cold-email-deliverability-checklist/) - General deliverability practices
- [Email Authentication Guide](https://resend.com/blog/email-authentication-a-developers-guide) - SPF/DKIM/DMARC context

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified in codebase, no external dependencies needed
- Architecture: HIGH - Existing implementation reviewed, patterns documented
- Testing approach: HIGH - Aligned with CONTEXT.md decisions
- Pitfalls: MEDIUM - Based on common patterns; actual issues may vary

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable implementation)

---

## Troubleshooting Guide Location

Per CONTEXT.md, a reusable troubleshooting guide should be created. Recommended location:
- **File:** `.planning/phases/02-verify-order-emails/02-TROUBLESHOOTING.md`
- **Contents:** Step-by-step debugging for each failure mode
- **Also document in:** VERIFICATION.md for phase completion

This guide should be created during the verification phase as issues are discovered and resolved.
