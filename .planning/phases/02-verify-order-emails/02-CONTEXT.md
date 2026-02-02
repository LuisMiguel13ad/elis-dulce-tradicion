# Phase 2: Verify Order Emails - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Confirm that order confirmation emails (on order creation) and ready notification emails (on status change) work correctly end-to-end. This is verification of existing functionality, not building new features. Fix any issues discovered during testing.

</domain>

<decisions>
## Implementation Decisions

### Testing Approach
- Manual testing first, then add automated tests for regression
- Automated tests should send real emails to a test inbox (not mocked)
- Comprehensive manual testing: all variations including delivery options, cake sizes, both languages
- Verify emails don't land in spam - check spam folders during testing
- Acceptable email delivery delay: under 1 minute

### Test Data Strategy
- Test in production, cancel orders after verification
- Use personal test email addresses to receive and verify emails
- Use obviously test data: names like "Test Customer", addresses like "123 Test St"
- Create 5-6 test orders to cover main variations: pickup/delivery, English/Spanish, different cake types

### Failure Investigation
- First check: Supabase Edge Function logs for invocation errors
- Document debugging steps in both VERIFICATION.md and create reusable troubleshooting guide
- Fix issues in this phase - verification becomes fix-and-verify until emails work
- Under 1 minute delivery is the success threshold

### Language Coverage
- Language determined by site toggle - customer's selected language carries through to order and emails
- Test every scenario in both English and Spanish (full matrix)
- Full translation audit of Spanish email content
- Fix any translation issues found during this phase

### Claude's Discretion
- Specific test case organization
- Troubleshooting guide format and location
- Automated test framework/structure

</decisions>

<specifics>
## Specific Ideas

- Site has English/Spanish toggle on home page that switches entire site and order form
- Language preference should carry through to email templates
- Emails should arrive within 60 seconds of trigger event

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 02-verify-order-emails*
*Context gathered: 2026-02-01*
