# Roadmap: Eli's Bakery - Notification Fixes

**Created:** 2025-02-01
**Milestone:** v1.1 - Email Notification Fixes
**Phases:** 4

## Overview

| Phase | Name | Goal | Requirements | Status |
|-------|------|------|--------------|--------|
| 1 | Contact Form Emails | Contact form submissions trigger emails to owner and customer | EMAIL-01, EMAIL-02, CONFIG-01, CONFIG-02, CONFIG-03, CONFIG-04, CONTENT-01, CONTENT-02, CONTENT-03 | ✓ Complete |
| 2 | Verify Order Emails | Confirm order confirmation and ready notification emails work end-to-end | EMAIL-03, EMAIL-04 | Pending |
| 3 | Dashboard Verification | Verify both dashboards have correct components, working graphs, and proper order handling | DASH-01, DASH-02, DASH-03, DASH-04, DASH-05 | Pending |
| 4 | UI/UX Verification | Ensure all UI/UX is polished, consistent, and working properly across the site | UX-01, UX-02, UX-03, UX-04, UX-05 | Pending |

---

## Phase 1: Contact Form Emails

**Goal:** Contact form submissions trigger email notifications to the owner and send auto-reply confirmation to customers.

**Plans:** 1 plan

Plans:
- [x] 01-01-PLAN.md — Wire edge function call + fix content (address/phone)

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

**Plans:** 1 plan

Plans:
- [ ] 02-01-PLAN.md — Verify email infrastructure and test all language/delivery combinations

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

## Phase 3: Dashboard Verification

**Goal:** Verify that both Owner Dashboard and Front Desk Dashboard have all necessary components, working graphs/analytics, proper order handling, and remove any unnecessary code.

**Requirements:**
- DASH-01: Owner Dashboard analytics display correctly (revenue, orders, charts)
- DASH-02: Front Desk Dashboard order queue works properly (filters, status updates)
- DASH-03: Both dashboards receive orders in real-time
- DASH-04: Remove unnecessary/unused components from both dashboards
- DASH-05: Owner Dashboard has distinct interface from Front Desk (analytics-focused)

**Success Criteria:**
1. Owner Dashboard shows accurate metrics: Revenue Today, Orders Today, Average Ticket
2. Owner Dashboard line chart (revenue trends) and pie chart (order status) render correctly with real data
3. Front Desk Dashboard displays order cards with proper filtering by status (new, preparing, pickup, delivery, done)
4. Real-time order updates work on both dashboards (new order appears within 5 seconds)
5. Order status changes from Front Desk update correctly and trigger proper workflows
6. No unused components, dead code, or placeholder functionality remains
7. Owner Dashboard has calendar view, reports section, and analytics not present in Front Desk

**Implementation Notes:**
- Audit Owner Dashboard components: OwnerSidebar, DashboardHeader, OwnerCalendar, charts
- Audit Front Desk components: KitchenRedesignedLayout, KitchenNavTabs, ModernOrderCard, OrderScheduler
- Verify useRealtimeOrders and useOrdersFeed hooks work correctly
- Remove any dev/placeholder components from src/components/dev/
- Test order flow: create order → appears in both dashboards → update status → verify state

---

## Phase 4: UI/UX Verification

**Goal:** Ensure the entire application UI/UX is polished, consistent, responsive, and working properly across all pages and interactions.

**Requirements:**
- UX-01: All pages load correctly without visual glitches
- UX-02: Responsive design works on mobile, tablet, and desktop
- UX-03: Bilingual support (English/Spanish) works consistently
- UX-04: All interactive elements (buttons, forms, modals) function correctly
- UX-05: Visual consistency across all pages (colors, typography, spacing)

**Success Criteria:**
1. All customer-facing pages (Home, Order, Track, Contact) render correctly
2. All staff-facing pages (Owner Dashboard, Front Desk, Kitchen Display) render correctly
3. Forms submit properly with validation feedback
4. Modals open/close correctly (PrintPreview, CancelOrder, FullScreenAlert)
5. Language toggle switches all visible text between English and Spanish
6. No broken images, missing icons, or layout issues on any screen size
7. Loading states and error states display appropriately
8. Navigation between pages works without errors

**Implementation Notes:**
- Test all customer pages: /, /order, /track, /contact
- Test all staff pages: /owner-dashboard, /front-desk, /kitchen-display, /bakery-dashboard
- Test on different viewport sizes (mobile, tablet, desktop)
- Verify language toggle on each page
- Check console for any JavaScript errors during navigation
- Test form validations on Order and Contact pages

---

## Dependency Graph

```
Phase 1 ─── Phase 2 ─── Phase 3 ─── Phase 4
   │           │           │           │
   │           │           │           └── UI/UX verification (final polish)
   │           │           │
   │           │           └── Dashboard verification (components + order flow)
   │           │
   │           └── Verify order emails work
   │
   └── Set up infrastructure + fix contact form
```

- Phase 2 depends on Phase 1 (edge functions must be deployed first)
- Phase 3 depends on Phase 2 (order emails verified → can test order flow in dashboards)
- Phase 4 depends on Phase 3 (dashboards verified → can do full UI/UX sweep)

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
