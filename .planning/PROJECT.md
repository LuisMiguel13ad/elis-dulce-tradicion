# Eli's Bakery - Custom Cake Ordering Platform

## What This Is

A bilingual (English/Spanish) custom cake ordering website for Eli's Bakery in Norristown, PA. Customers can design custom cakes, pay via Square, and track their orders. Staff manage orders through two dashboards: an Owner dashboard for analytics and a Front Desk dashboard with DoorDash-style real-time alerts when new orders arrive.

## Core Value

Customers can order custom cakes online and receive email confirmations at each stage — order placed, ready for pickup/delivery. Staff are alerted instantly when orders come in.

## Requirements

### Validated

<!-- Shipped and working -->

- ✓ **Custom cake ordering** — Size, filling, theme, dedication, reference image upload
- ✓ **Square payment processing** — Secure checkout with card/Apple Pay/Google Pay
- ✓ **Order tracking** — Customers can track order status via order number
- ✓ **Owner dashboard** — Analytics, order management, business metrics
- ✓ **Front Desk dashboard** — Real-time order queue with DoorDash-style alerts
- ✓ **Real-time notifications** — Full-screen popup + sound + browser notification when orders arrive
- ✓ **Bilingual support** — English and Spanish throughout the site
- ✓ **Delivery zones** — Zone-based delivery with distance calculation via Google Maps
- ✓ **Contact form** — Inquiry submission with attachment support
- ✓ **Email templates exist** — Order confirmation, ready notification, contact notification (Resend + Supabase Edge Functions)

### Active

<!-- Current scope - fixes to implement -->

- [ ] **NOTIF-01**: Contact form triggers email notification to owner
- [ ] **NOTIF-02**: Contact form sends auto-reply to customer
- [ ] **NOTIF-03**: Verify Supabase Edge Functions are deployed and working
- [ ] **FIX-01**: Update placeholder address in ready notification email to actual bakery address
- [ ] **FIX-02**: Standardize phone number to (610) 279-6200 across all email templates
- [ ] **FIX-03**: Set OWNER_EMAIL environment variable to info@elisbakery.com

### Out of Scope

<!-- Explicit boundaries -->

- Inventory management — Deferred to future milestone
- Delivery tracking (out_for_delivery/delivered states) — States exist but workflow not implemented
- SMS notifications — Email only for now
- Refund processing — Manual via Square dashboard

## Context

**Business:**
- Eli's Bakery, 324 W Marshall St, Norristown, PA 19401
- Phone: (610) 279-6200
- Hours: 5:00 AM - 10:00 PM, 365 days
- Owner email: info@elisbakery.com

**Technical Environment:**
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Node.js + Express
- Database: PostgreSQL via Supabase
- Auth: Supabase Auth with role-based access (customer, baker, owner)
- Payments: Square Web Payments SDK
- Email: Resend via Supabase Edge Functions
- Real-time: Supabase Realtime subscriptions
- Hosting: Vercel (frontend)

**Codebase State:**
- Live in production
- Codebase mapped: `.planning/codebase/` (7 documents)
- Known tech debt documented in `.planning/codebase/CONCERNS.md`

## Constraints

- **Live Site**: Changes must not break production — test thoroughly
- **Email Provider**: Using Resend (requires RESEND_API_KEY in Supabase secrets)
- **Payment Provider**: Square only (Stripe code exists but not active)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Resend for email | Simple API, good deliverability, Supabase Edge Function compatible | — Pending |
| Square for payments | Already integrated and working | ✓ Good |
| Supabase for backend | Real-time, auth, storage in one platform | ✓ Good |
| Bilingual from start | Serves Spanish-speaking community in Norristown | ✓ Good |

---
*Last updated: 2025-02-01 after initialization*
