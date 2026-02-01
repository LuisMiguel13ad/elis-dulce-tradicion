# Roadmap: Eli's Bakery - Notification Fixes

**Created:** 2025-02-01
**Milestone:** v1.1 - Email Notification Fixes
**Phases:** 2

## Overview

| Phase | Name | Goal | Requirements | Status |
|-------|------|------|--------------|--------|
| 1 | Contact Form Emails | Contact form submissions trigger emails to owner and customer | EMAIL-01, EMAIL-02, CONFIG-01, CONFIG-02, CONFIG-03, CONFIG-04, CONTENT-01, CONTENT-02, CONTENT-03 | Pending |
| 2 | Verify Order Emails | Confirm order confirmation and ready notification emails work end-to-end | EMAIL-03, EMAIL-04 | Pending |

---

## Phase 1: Contact Form Emails

**Goal:** Contact form submissions trigger email notifications to the owner and send auto-reply confirmation to customers.

**Requirements:**
- EMAIL-01: Contact form → email to owner
- EMAIL-02: Contact form → auto-reply to customer
- CONFIG-01: Deploy Supabase Edge Functions
- CONFIG-02: Set RESEND_API_KEY
- CONFIG-03: Set OWNER_EMAIL
- CONFIG-04: Set FRONTEND_URL
- CONTENT-01: Fix placeholder address
- CONTENT-02: Standardize phone number
- CONTENT-03: Verify from email config

**Success Criteria:**
1. When a customer submits the contact form, owner receives email at info@elisbakery.com within 1 minute
2. Customer receives auto-reply confirmation email within 1 minute of submitting contact form
3. All Supabase Edge Functions are deployed and accessible
4. Ready notification email shows "324 W Marshall St, Norristown, PA 19401" (not placeholder)
5. All email templates show phone number (610) 279-6200

**Implementation Notes:**
- Add call to `send-contact-notification` edge function in `src/lib/support.ts` after database insert
- Update `supabase/functions/send-ready-notification/index.ts` to replace placeholder address
- Update all email templates to use correct phone number
- Deploy edge functions via Supabase CLI
- Set secrets in Supabase dashboard

---

## Phase 2: Verify Order Emails

**Goal:** Confirm that order confirmation emails (on order creation) and ready notification emails (on status change) work correctly end-to-end.

**Requirements:**
- EMAIL-03: Order confirmation email works
- EMAIL-04: Ready notification email works

**Success Criteria:**
1. Placing a test order sends confirmation email to customer within 1 minute
2. Changing order status to "ready" sends notification email to customer within 1 minute
3. Email content shows correct order details, tracking link, and contact info
4. Both English and Spanish email versions work correctly

**Implementation Notes:**
- Test order creation flow end-to-end
- Test status change from Front Desk dashboard
- Verify email deliverability (check spam folders)
- Test with both English and Spanish language settings

---

## Dependency Graph

```
Phase 1 ─── Phase 2
   │           │
   │           └── Verify order emails work
   │
   └── Set up infrastructure + fix contact form
```

Phase 2 depends on Phase 1 (edge functions must be deployed first).

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Resend API issues | Test with small volume first; have SMTP fallback documented |
| Edge function deployment fails | Verify Supabase CLI access and permissions before starting |
| Email goes to spam | Check SPF/DKIM records for elisbakery.com domain |
| Breaking production | Test on development environment first if available |

---
*Roadmap created: 2025-02-01*
