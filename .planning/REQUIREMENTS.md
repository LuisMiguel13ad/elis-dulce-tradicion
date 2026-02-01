# Requirements: Eli's Bakery - Notification Fixes

**Defined:** 2025-02-01
**Core Value:** Customers receive email confirmations at each stage; staff are alerted instantly when orders come in.

## v1 Requirements

Requirements for this fix cycle. Each maps to roadmap phases.

### Email Notifications

- [ ] **EMAIL-01**: Contact form submission triggers email notification to owner (info@elisbakery.com)
- [ ] **EMAIL-02**: Contact form submission sends auto-reply confirmation to customer
- [ ] **EMAIL-03**: Order confirmation email sends when order is placed (verify working)
- [ ] **EMAIL-04**: Ready for pickup/delivery email sends when order status changes to "ready" (verify working)

### Configuration

- [ ] **CONFIG-01**: Supabase Edge Functions are deployed (send-order-confirmation, send-ready-notification, send-contact-notification)
- [ ] **CONFIG-02**: RESEND_API_KEY is set in Supabase secrets
- [ ] **CONFIG-03**: OWNER_EMAIL is set to info@elisbakery.com in Supabase secrets
- [ ] **CONFIG-04**: FRONTEND_URL is set correctly in Supabase secrets

### Content Fixes

- [ ] **CONTENT-01**: Ready notification email shows actual bakery address (324 W Marshall St, Norristown, PA 19401)
- [ ] **CONTENT-02**: All email templates use correct phone number (610) 279-6200
- [ ] **CONTENT-03**: Email "from" address and name are correctly configured

## v2 Requirements

Deferred to future release. Not in current scope.

### Enhanced Notifications

- **NOTIF-V2-01**: SMS notifications for order status changes
- **NOTIF-V2-02**: Push notifications via service worker
- **NOTIF-V2-03**: Notification preferences per customer

### Delivery Tracking

- **DELIV-01**: out_for_delivery status workflow implementation
- **DELIV-02**: delivered status workflow implementation
- **DELIV-03**: Driver assignment and tracking

## Out of Scope

Explicitly excluded from this cycle.

| Feature | Reason |
|---------|--------|
| Inventory management | Separate milestone, larger scope |
| Refund processing | Manual via Square dashboard |
| New features | Focus on fixing existing functionality first |
| Test coverage improvements | Separate technical debt milestone |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| EMAIL-01 | Phase 1 | Pending |
| EMAIL-02 | Phase 1 | Pending |
| EMAIL-03 | Phase 2 | Pending |
| EMAIL-04 | Phase 2 | Pending |
| CONFIG-01 | Phase 1 | Pending |
| CONFIG-02 | Phase 1 | Pending |
| CONFIG-03 | Phase 1 | Pending |
| CONFIG-04 | Phase 1 | Pending |
| CONTENT-01 | Phase 1 | Pending |
| CONTENT-02 | Phase 1 | Pending |
| CONTENT-03 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2025-02-01*
*Last updated: 2025-02-01 after initial definition*
