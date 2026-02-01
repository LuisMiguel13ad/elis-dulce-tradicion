# Phase 1: Contact Form Emails - Research

**Researched:** 2026-02-01
**Domain:** Supabase Edge Functions + Resend Email Integration (Brownfield)
**Confidence:** HIGH

## Summary

This phase implements email notifications for contact form submissions using existing Supabase Edge Functions and the Resend email service. The edge function `send-contact-notification` already exists and is fully implemented but is never invoked after form submission. This is a brownfield integration requiring connection of existing components rather than building from scratch.

The standard approach is to invoke Supabase Edge Functions from the client after successful database operations using the `supabase.functions.invoke()` method. The edge function handles both owner notification and customer auto-reply emails via the Resend API. Key considerations include proper error handling, retry logic for network failures, and fixing content inconsistencies (placeholder address, phone number mismatches).

**Primary recommendation:** Call the existing edge function after successful contact form submission in `submitContactForm()`, add proper error handling with retry logic for network failures, and fix content inconsistencies before deployment.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Supabase Edge Functions | Deno runtime | Serverless email notification triggers | Built-in Supabase integration, global edge deployment, zero infrastructure management |
| Resend | ^4.0.0 | Transactional email delivery | Modern API-first email service built for developers, excellent deliverability, React Email support |
| @supabase/supabase-js | Latest (client) | Edge function invocation from React | Official Supabase client with built-in auth and error types |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| supabase CLI | Latest | Deploy edge functions to production | Required for deploying functions with `supabase functions deploy` |
| Deno | Latest (runtime) | Edge function execution environment | Automatically provided by Supabase Edge Functions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Resend | SendGrid, Mailgun | Resend has better DX and is modern (2026 standard), but older services have more features |
| Edge Functions | Database triggers + pg_net | Database triggers can't access external secrets easily, harder to test locally |
| Client invocation | Database webhooks | Webhooks add infrastructure complexity and potential failure points |

**Installation:**
```bash
# Client-side (already installed)
npm install @supabase/supabase-js

# Edge Functions deployment (already available)
# Functions use Deno JSR imports: jsr:@supabase/supabase-js@2
# Functions use npm imports: npm:resend@^4.0.0
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── support.ts           # Contact form submission logic (ADD edge function call here)
│   └── hooks/
│       └── useSupport.ts    # React Query hooks (already set up)
supabase/
└── functions/
    └── send-contact-notification/
        └── index.ts         # Email notification logic (READY TO USE)
```

### Pattern 1: Client-Side Edge Function Invocation After DB Operation
**What:** Call edge function after successful database insert to send emails
**When to use:** For operations that need immediate user feedback and reliable email delivery
**Example:**
```typescript
// Source: Existing pattern in src/lib/api.ts:420 + Official Supabase docs
// https://supabase.com/docs/reference/javascript/functions-invoke

export async function submitContactForm(data: ContactSubmissionData) {
  // 1. Insert into database first
  const { data: submission, error } = await supabase
    .from('contact_submissions')
    .insert({...})
    .select()
    .single();

  if (error) throw error;

  // 2. Invoke edge function for email notifications
  // Note: Edge function failures don't block form submission success
  try {
    const { data: emailResult, error: emailError } = await supabase.functions.invoke(
      'send-contact-notification',
      {
        body: { submission }
      }
    );

    if (emailError) {
      console.error('Email notification failed:', emailError);
      // Log but don't throw - form submission already succeeded
    }
  } catch (error) {
    // Network failures - implement retry logic
    console.error('Failed to invoke email function:', error);
  }

  return submission;
}
```

### Pattern 2: Edge Function with Dual Email Send
**What:** Single edge function sends both owner notification and customer auto-reply
**When to use:** Always for transactional emails triggered by user actions
**Example:**
```typescript
// Source: Existing code in supabase/functions/send-contact-notification/index.ts

Deno.serve(async (req) => {
  const { submission } = await req.json();
  const resend = new Resend(RESEND_API_KEY);

  // 1. Send to owner
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: OWNER_EMAIL,
    subject: `New Contact Form Submission: ${submission.subject}`,
    html: ownerHtml,
  });

  // 2. Send auto-reply to customer
  await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: submission.email,
    subject: `Thank you for contacting ${FROM_NAME}`,
    html: customerHtml,
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
```

### Pattern 3: Error Handling with Typed Errors
**What:** Use Supabase-specific error types to handle different failure scenarios
**When to use:** When invoking edge functions from client code
**Example:**
```typescript
// Source: https://supabase.com/docs/reference/javascript/functions-invoke
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from '@supabase/supabase-js';

try {
  const { data, error } = await supabase.functions.invoke('send-contact-notification', {...});

  if (error) {
    if (error instanceof FunctionsHttpError) {
      // Function ran but returned 4xx/5xx
      const errorMessage = await error.context.json();
      console.error('Function error:', errorMessage);
    } else if (error instanceof FunctionsRelayError) {
      // Network issue between client and Supabase
      console.error('Relay error:', error.message);
      // IMPLEMENT RETRY LOGIC HERE
    } else if (error instanceof FunctionsFetchError) {
      // Function couldn't be reached
      console.error('Fetch error:', error.message);
      // IMPLEMENT RETRY LOGIC HERE
    }
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

### Anti-Patterns to Avoid
- **Blocking on email send:** Never make the user wait for email confirmation before showing success. The database insert is the source of truth, email is secondary.
- **Using customer email in From field:** This triggers spam filters. Always use a verified domain email (orders@elisbakery.com).
- **No-reply addresses:** Using "noreply@" is bad UX and hurts deliverability. Use a real address that receives replies.
- **No retry logic:** Network failures (502/504) are expected with edge functions. Always implement retry logic for FunctionsFetchError and FunctionsRelayError.
- **Mixing domains:** Don't send transactional emails from marketing domain or vice versa. Keep them separate for better deliverability.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email delivery | Custom SMTP server or direct Gmail API | Resend API | Resend handles deliverability (SPF, DKIM, DMARC), bounce handling, rate limiting, retry logic, and compliance (GDPR, SOC 2) |
| HTML email templates | Custom template engine with string concatenation | HTML in edge function (already done) | Email HTML has complex quirks (Outlook, Gmail rendering differences). Existing templates already tested |
| Retry logic for edge functions | Manual setTimeout retry implementation | Exponential backoff library (optional) or simple 3-attempt retry | Edge function 502/504 errors are expected. Need proper backoff to avoid overwhelming service |
| Email validation | Custom regex for email format | Browser's built-in email input validation + backend check | Email validation is complex (RFC 5322). Browser handles 99% of cases |

**Key insight:** Email delivery is deceptively complex. What seems like "just send an email" involves deliverability, spam scores, authentication records, bounce handling, and compliance. Using a dedicated service (Resend) and existing edge function infrastructure is always better than custom solutions.

## Common Pitfalls

### Pitfall 1: Not Calling Edge Function After Form Submit
**What goes wrong:** Edge function exists but is never invoked. Emails never send despite working code.
**Why it happens:** Developer assumes database triggers will handle it, or forgets to wire up the client-side call.
**How to avoid:** After every database `.insert()`, explicitly call `supabase.functions.invoke()`. Add test to verify email is actually sent.
**Warning signs:** Form submits successfully, database record exists, but no emails received.

### Pitfall 2: Treating Email Failure as Form Failure
**What goes wrong:** Email fails to send, entire form submission is rolled back or shown as error to user.
**Why it happens:** Coupling email success to form submission success in UI logic.
**How to avoid:** Database insert is the source of truth. Email is a best-effort notification. Log email failures but show form success to user.
**Warning signs:** Users complain form is "broken" but submissions exist in database.

### Pitfall 3: Missing or Wrong Environment Variables
**What goes wrong:** Edge function deploys successfully but fails at runtime with "RESEND_API_KEY is not set" or emails go to wrong owner.
**Why it happens:** Secrets not set in Supabase dashboard, or using wrong variable names in code vs dashboard.
**How to avoid:** Use `supabase secrets list` to verify all secrets exist. Match exact names: RESEND_API_KEY, OWNER_EMAIL, FRONTEND_URL, FROM_EMAIL.
**Warning signs:** Edge function logs show "Error: RESEND_API_KEY is not set" or emails go to default addresses.

### Pitfall 4: Content Inconsistencies
**What goes wrong:** Emails show placeholder text "[Your Address Here]" or wrong phone numbers.
**Why it happens:** Templates copied between functions without updating constants. Multiple sources of truth for business data.
**How to avoid:** Single source of truth for business data (address, phone). Grep for placeholders before deployment. Test emails in staging.
**Warning signs:** Customer reports "your emails have placeholder text" or "wrong phone number listed".

### Pitfall 5: No Retry Logic for Network Failures
**What goes wrong:** Random email notification failures when edge function returns 502/504 (Bad Gateway/Timeout).
**Why it happens:** Edge functions can have cold starts and network hiccups. These are expected failures, not bugs.
**How to avoid:** Implement retry logic for `FunctionsRelayError` and `FunctionsFetchError`. Use exponential backoff (1s, 2s, 4s delays).
**Warning signs:** Intermittent "email not sent" reports, logs show 502/504 errors but function code is correct.

### Pitfall 6: Using Customer Email in From Field
**What goes wrong:** Emails marked as spam or rejected by mail servers as "spoofing attempt".
**Why it happens:** Developer thinks "reply-to should be customer" means "from should be customer email".
**How to avoid:** From field MUST be verified domain (orders@elisbakery.com). Use reply-to field if you want owner to reply directly to customer.
**Warning signs:** Owner never receives notifications, emails in spam folder, bounce notifications from mail servers.

## Code Examples

Verified patterns from official sources:

### Invoking Edge Function from React/TypeScript
```typescript
// Source: Official Supabase docs - https://supabase.com/docs/reference/javascript/functions-invoke
// Pattern from existing codebase: src/lib/api.ts:420

import { supabase } from './supabase';

// After successful database insert
const { data: submission, error: dbError } = await supabase
  .from('contact_submissions')
  .insert({...})
  .select()
  .single();

if (dbError) throw dbError;

// Invoke edge function (non-blocking for UI)
const { data, error } = await supabase.functions.invoke('send-contact-notification', {
  body: { submission }
});

if (error) {
  console.error('Email notification error:', error);
  // Don't throw - form submission succeeded
}
```

### Deploying Edge Functions with Secrets
```bash
# Source: Official Supabase docs - https://supabase.com/docs/guides/functions/secrets

# 1. Login and link project
supabase login
supabase link --project-ref your-project-ref

# 2. Set secrets (production)
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set OWNER_EMAIL=owner@elisbakery.com
supabase secrets set FRONTEND_URL=https://elisbakery.com

# 3. Verify secrets
supabase secrets list

# 4. Deploy edge function
supabase functions deploy send-contact-notification
```

### Resend Email Send (Edge Function)
```typescript
// Source: https://resend.com/docs/api-reference/emails/send-email
// Already implemented in supabase/functions/send-contact-notification/index.ts

import { Resend } from "npm:resend@^4.0.0";

const resend = new Resend(RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from: "Eli's Bakery <orders@elisbakery.com>",
  to: "customer@example.com",
  subject: "Thank you for contacting us",
  html: "<p>Your message has been received...</p>",
});

if (error) {
  console.error("Resend error:", error);
  throw new Error("Failed to send email");
}

return data; // { id: "49a3999c-0ce1-..." }
```

### Retry Logic for Edge Function Network Failures
```typescript
// Source: Supabase community recommendation - https://github.com/orgs/supabase/discussions/17258
// Pattern: Simple 3-attempt retry with exponential backoff

async function invokeWithRetry(functionName: string, body: any, maxAttempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, { body });

      if (error) {
        // Only retry on network/relay errors, not function logic errors
        if (error instanceof FunctionsFetchError || error instanceof FunctionsRelayError) {
          lastError = error;
          if (attempt < maxAttempts) {
            const delayMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }
        } else {
          // FunctionsHttpError - don't retry
          throw error;
        }
      }

      return { data, error };
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) throw error;

      const delayMs = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Database triggers (pg_cron, pg_net) | Client-invoked edge functions | 2023-2024 | Easier testing, better error visibility, can access external secrets |
| SendGrid/Mailgun | Resend | 2023-2025 | Better DX, modern API, React Email support, becoming standard for new projects |
| SMTP relay | REST API email services | 2020+ | Simpler auth, better error handling, built-in deliverability features |
| Mixing transactional + marketing emails | Separate domains/IPs | Ongoing best practice | Protects transactional email reputation from marketing spam complaints |

**Deprecated/outdated:**
- **No-reply addresses:** Gmail and Outlook now deprioritize or flag these as spam. Use real addresses that accept replies.
- **Hardcoded email templates in database:** Modern approach uses code-based templates (React Email, HTML in functions) for version control and type safety.
- **Database triggers for external API calls:** Edge functions are now the standard for calling external services (like email APIs) from Supabase.

## Open Questions

Things that couldn't be fully resolved:

1. **Has RESEND_API_KEY been created and set in production?**
   - What we know: Edge function code expects this secret, deployment requires it
   - What's unclear: Whether the Resend account is set up and API key generated
   - Recommendation: Verify Resend account exists, generate API key if needed, set as Supabase secret before deploying

2. **Should email failures block form submission or be silent?**
   - What we know: Industry best practice is to NOT block on email failures
   - What's unclear: User's preference for this specific application
   - Recommendation: Default to non-blocking (show success even if email fails), log failures for monitoring

3. **What is the correct phone number?**
   - What we know: Contact page shows (610) 279-6200, some email templates show (610) 910-9067
   - What's unclear: Which is the current, correct business phone
   - Recommendation: Verify with owner which phone number is correct, update all templates to match

4. **Should retry logic be implemented in Phase 1 or deferred?**
   - What we know: Network failures (502/504) with edge functions are expected, retry logic is recommended
   - What's unclear: Whether to implement immediately or defer to later phase for simplicity
   - Recommendation: Implement basic retry (3 attempts) in Phase 1 to avoid intermittent failure reports

## Sources

### Primary (HIGH confidence)
- Supabase Edge Functions Official Docs - [Functions Invoke Reference](https://supabase.com/docs/reference/javascript/functions-invoke)
- Supabase Edge Functions Official Docs - [Deployment Guide](https://supabase.com/docs/guides/functions/deploy)
- Supabase Edge Functions Official Docs - [Environment Variables/Secrets](https://supabase.com/docs/guides/functions/secrets)
- Supabase Edge Functions Official Docs - [Error Handling](https://supabase.com/docs/guides/functions/error-handling)
- Resend Official Docs - [Send Email API Reference](https://resend.com/docs/api-reference/emails/send-email)
- Existing codebase - supabase/functions/send-contact-notification/index.ts (verified working code)
- Existing codebase - src/lib/api.ts:420 (verified edge function invocation pattern)

### Secondary (MEDIUM confidence)
- [Mailtrap: 12 Transactional Email Best Practices 2026](https://mailtrap.io/blog/transactional-emails-best-practices/) - From address and domain separation guidance
- [MailerSend: 16 Transactional Email Best Practices](https://www.mailersend.com/blog/transactional-email-best-practices) - No-reply address pitfalls
- [Buttercups Tech: How to Deploy Supabase Edge Functions](https://www.buttercups.tech/blog/back-end/how-to-deploy-supabase-edge-functions-step-by-step-guide) - Deployment workflow verification
- [involve.me: 5 Contact Forms That Went Wrong](https://www.involve.me/blog/forms-that-went-horribly-wrong-and-how-to-fix-them) - Common form submission pitfalls

### Tertiary (LOW confidence)
- [GitHub Discussion #17258](https://github.com/orgs/supabase/discussions/17258) - Community reports of 502/504 errors requiring retry logic
- [Shadhujan Medium: Supabase Edge Functions Guide 2026](https://shadhujan.medium.com/how-to-keep-your-free-supabase-project-alive-forever-using-edge-functions-a-step-by-step-guide-6557fe59be90) - Cold start considerations

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation for Supabase and Resend, existing working code in codebase
- Architecture: HIGH - Verified patterns from official docs and existing codebase implementation (src/lib/api.ts)
- Pitfalls: HIGH - Based on official documentation, known issues in GitHub discussions, and industry best practices
- Content fixes: HIGH - Direct examination of codebase files revealed exact issues (placeholder address, phone inconsistencies)
- Retry logic: MEDIUM - Community recommendation verified in GitHub discussions, not in official docs but widely accepted pattern

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable technology, Supabase and Resend APIs are mature)
