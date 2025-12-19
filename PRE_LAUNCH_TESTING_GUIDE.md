# Pre-Launch Testing Guide

## Overview
This document provides comprehensive testing procedures and checklists to ensure the bakery website is ready for production launch.

## Table of Contents
1. [Functional Testing Checklist](#functional-testing-checklist)
2. [Cross-Browser Testing](#cross-browser-testing)
3. [Device Testing](#device-testing)
4. [Performance Testing](#performance-testing)
5. [Security Testing](#security-testing)
6. [Email Testing](#email-testing)
7. [Payment Testing](#payment-testing)
8. [Error Handling Testing](#error-handling-testing)
9. [Real-World Scenario Testing](#real-world-scenario-testing)
10. [Load Testing](#load-testing)
11. [Test Execution Log](#test-execution-log)

---

## Functional Testing Checklist

### Authentication & User Management
- [ ] **User Registration Flow**
  - [ ] Navigate to `/signup`
  - [ ] Fill all required fields
  - [ ] Submit form
  - [ ] Verify email confirmation sent
  - [ ] Click confirmation link
  - [ ] Verify account activated
  - [ ] Test validation errors (empty fields, invalid email, weak password)
  - [ ] Test duplicate email registration

- [ ] **User Login**
  - [ ] Navigate to `/login`
  - [ ] Enter valid credentials
  - [ ] Verify successful login
  - [ ] Verify redirect to appropriate dashboard
  - [ ] Test invalid credentials (wrong email/password)
  - [ ] Test non-existent user
  - [ ] Test locked account (after multiple failed attempts)

- [ ] **User Logout**
  - [ ] Click logout button
  - [ ] Verify session cleared
  - [ ] Verify redirect to home page
  - [ ] Verify protected routes inaccessible

- [ ] **Password Reset**
  - [ ] Click "Forgot Password" link
  - [ ] Enter registered email
  - [ ] Verify reset email sent
  - [ ] Click reset link in email
  - [ ] Enter new password
  - [ ] Verify password updated
  - [ ] Test login with new password

### Order Creation
- [ ] **Basic Order Flow**
  - [ ] Navigate to `/order`
  - [ ] Select date needed (future date)
  - [ ] Select time needed
  - [ ] Enter customer information
  - [ ] Select cake size
  - [ ] Select filling
  - [ ] Enter theme
  - [ ] Add dedication (optional)
  - [ ] Verify price calculation updates correctly
  - [ ] Submit order form

- [ ] **Image Upload**
  - [ ] Click "Upload Reference Image"
  - [ ] Select valid image file (JPG, PNG)
  - [ ] Verify image preview displays
  - [ ] Verify image uploads successfully
  - [ ] Test invalid file types (rejected)
  - [ ] Test file size limit (5MB max)
  - [ ] Test mobile camera capture

- [ ] **Price Calculation**
  - [ ] Test each cake size price
  - [ ] Test filling price additions
  - [ ] Test delivery fee ($15)
  - [ ] Test pickup (no delivery fee)
  - [ ] Verify total matches sum of components
  - [ ] Test promo code application (if applicable)
  - [ ] Verify price updates on form changes

- [ ] **Delivery Address Validation**
  - [ ] Select "Delivery" option
  - [ ] Enter valid address
  - [ ] Verify address autocomplete works
  - [ ] Test invalid address (shows error)
  - [ ] Test out-of-service-area address
  - [ ] Verify zip code validation
  - [ ] Test apartment/unit field

- [ ] **Order Form Validation**
  - [ ] Submit empty form (all errors shown)
  - [ ] Test each field validation individually
  - [ ] Test date validation (past dates rejected)
  - [ ] Test minimum lead time (24 hours)
  - [ ] Test maximum advance time (90 days)
  - [ ] Verify error messages are clear and helpful

### Payment Processing
- [ ] **Payment Flow**
  - [ ] Complete order form
  - [ ] Click "Proceed to Payment"
  - [ ] Enter test card details
  - [ ] Submit payment
  - [ ] Verify payment processing
  - [ ] Verify redirect to confirmation page
  - [ ] Verify order number displayed

- [ ] **Test Cards**
  - [ ] Successful payment: `4111 1111 1111 1111`
  - [ ] Declined card: `4000 0000 0000 0002`
  - [ ] Insufficient funds: `4000 0000 0000 9995`
  - [ ] Expired card: `4000 0000 0000 0069`
  - [ ] Invalid CVV: `4000 0000 0000 0127`
  - [ ] 3D Secure (if applicable)

- [ ] **Payment Amount Verification**
  - [ ] Verify payment amount matches order total
  - [ ] Test with delivery fee
  - [ ] Test without delivery fee (pickup)
  - [ ] Verify no duplicate charges possible
  - [ ] Check Square dashboard for transaction

### Order Management
- [ ] **Order Confirmation**
  - [ ] Verify confirmation email received
  - [ ] Check email contains correct order details
  - [ ] Verify order number in email
  - [ ] Verify tracking link in email works
  - [ ] Check email renders correctly (desktop & mobile)

- [ ] **Order Tracking**
  - [ ] Navigate to `/order-tracking`
  - [ ] Enter order number
  - [ ] Verify order details displayed
  - [ ] Verify current status shown
  - [ ] Test with invalid order number
  - [ ] Test with non-existent order number

- [ ] **Order Status Updates**
  - [ ] As admin, update order status to "confirmed"
  - [ ] Verify customer receives email notification
  - [ ] Update to "in_progress"
  - [ ] Update to "ready"
  - [ ] Verify ready notification sent
  - [ ] Update to "out_for_delivery"
  - [ ] Update to "delivered"
  - [ ] Update to "completed"
  - [ ] Verify each status change reflected in tracking

- [ ] **Order Cancellation**
  - [ ] Navigate to order tracking
  - [ ] Click "Cancel Order"
  - [ ] Enter cancellation reason
  - [ ] Confirm cancellation
  - [ ] Verify cancellation email sent
  - [ ] Verify refund processed (if applicable)
  - [ ] Verify order status updated to "cancelled"

- [ ] **Refund Processing**
  - [ ] Cancel order within refund window
  - [ ] Verify refund amount calculated correctly
  - [ ] Verify refund processed in Square
  - [ ] Verify refund confirmation email sent
  - [ ] Check refund status in order details

### Customer Features
- [ ] **Review Submission**
  - [ ] Navigate to completed order
  - [ ] Click "Write Review"
  - [ ] Submit review with rating
  - [ ] Verify review appears on site
  - [ ] Test review validation (required fields)

- [ ] **Customer Dashboard**
  - [ ] Login as customer
  - [ ] Navigate to `/customer-dashboard`
  - [ ] Verify order history displayed
  - [ ] Verify saved addresses shown
  - [ ] Test address management (add/edit/delete)
  - [ ] Test preferences management

### Admin Features
- [ ] **Admin Dashboard Access**
  - [ ] Login as owner
  - [ ] Navigate to `/owner-dashboard`
  - [ ] Verify dashboard loads
  - [ ] Verify metrics displayed correctly
  - [ ] Test non-owner access (should be blocked)

- [ ] **Kitchen Display**
  - [ ] Navigate to `/kitchen-display`
  - [ ] Verify orders displayed
  - [ ] Test status updates
  - [ ] Verify real-time updates work
  - [ ] Test filtering and sorting

- [ ] **Pricing Management**
  - [ ] Navigate to pricing settings
  - [ ] Update cake size prices
  - [ ] Update filling prices
  - [ ] Verify changes saved
  - [ ] Verify new orders use updated prices

- [ ] **Capacity Management**
  - [ ] Navigate to capacity settings
  - [ ] Set max orders per day
  - [ ] Block specific dates
  - [ ] Verify blocked dates unavailable in order form
  - [ ] Test capacity reached scenario

- [ ] **Search and Filtering**
  - [ ] Test order search by order number
  - [ ] Test order search by customer name
  - [ ] Test filtering by status
  - [ ] Test filtering by date range
  - [ ] Verify search results accurate

### Content Management
- [ ] **FAQ Management**
  - [ ] Add new FAQ
  - [ ] Edit existing FAQ
  - [ ] Delete FAQ
  - [ ] Test FAQ search on frontend
  - [ ] Test FAQ categories
  - [ ] Test FAQ feedback

- [ ] **Gallery Management**
  - [ ] Upload new gallery image
  - [ ] Edit image details
  - [ ] Delete image
  - [ ] Verify image displays on gallery page
  - [ ] Test image categories

- [ ] **Business Settings**
  - [ ] Update business hours
  - [ ] Update contact information
  - [ ] Update service area
  - [ ] Verify changes reflected on site

---

## Cross-Browser Testing

### Desktop Browsers
- [ ] **Chrome (Latest)**
  - [ ] All functional tests pass
  - [ ] No console errors
  - [ ] Styles render correctly
  - [ ] Animations work smoothly

- [ ] **Firefox (Latest)**
  - [ ] All functional tests pass
  - [ ] No console errors
  - [ ] Styles render correctly
  - [ ] Animations work smoothly

- [ ] **Safari (Latest)**
  - [ ] All functional tests pass
  - [ ] No console errors
  - [ ] Styles render correctly
  - [ ] Animations work smoothly
  - [ ] Date picker works correctly

- [ ] **Edge (Latest)**
  - [ ] All functional tests pass
  - [ ] No console errors
  - [ ] Styles render correctly
  - [ ] Animations work smoothly

### Mobile Browsers
- [ ] **Mobile Chrome (Android)**
  - [ ] All functional tests pass
  - [ ] Touch interactions work
  - [ ] Forms are usable
  - [ ] Images load correctly
  - [ ] Camera capture works

- [ ] **Mobile Safari (iOS)**
  - [ ] All functional tests pass
  - [ ] Touch interactions work
  - [ ] Forms are usable
  - [ ] Images load correctly
  - [ ] Camera capture works
  - [ ] Date picker works correctly

### Browser-Specific Issues to Check
- [ ] Date input format consistency
- [ ] File upload button styling
- [ ] Autocomplete behavior
- [ ] Form validation messages
- [ ] Modal/dialog behavior
- [ ] Scroll behavior
- [ ] Print styles (if applicable)

---

## Device Testing

### Desktop Resolutions
- [ ] **1920x1080 (Full HD)**
  - [ ] Layout displays correctly
  - [ ] No horizontal scrolling
  - [ ] Text readable
  - [ ] Images properly sized

- [ ] **1366x768 (Laptop)**
  - [ ] Layout displays correctly
  - [ ] No horizontal scrolling
  - [ ] Text readable
  - [ ] Images properly sized

### Tablet Resolutions
- [ ] **768x1024 (iPad Portrait)**
  - [ ] Layout adapts correctly
  - [ ] Touch targets adequate size
  - [ ] Forms usable
  - [ ] Navigation works

- [ ] **1024x768 (iPad Landscape)**
  - [ ] Layout adapts correctly
  - [ ] Touch targets adequate size
  - [ ] Forms usable
  - [ ] Navigation works

### Mobile Resolutions
- [ ] **375x667 (iPhone SE)**
  - [ ] Layout adapts correctly
  - [ ] Touch targets adequate size (min 44x44px)
  - [ ] Forms usable
  - [ ] Text readable without zooming
  - [ ] Images load quickly

- [ ] **414x896 (iPhone 11 Pro Max)**
  - [ ] Layout adapts correctly
  - [ ] Touch targets adequate size
  - [ ] Forms usable
  - [ ] Text readable
  - [ ] Safe area respected

### Device-Specific Testing
- [ ] Touch gestures (swipe, pinch, zoom)
- [ ] Keyboard behavior (mobile keyboards)
- [ ] Orientation changes (portrait/landscape)
- [ ] Safe area insets (notches, home indicators)
- [ ] Camera access on mobile
- [ ] Location services (if used)

---

## Performance Testing

### Lighthouse Scores (Target: > 90)
- [ ] **Performance Score: > 90**
  - [ ] First Contentful Paint (FCP) < 1.5s
  - [ ] Largest Contentful Paint (LCP) < 2.5s
  - [ ] Time to Interactive (TTI) < 3s
  - [ ] Total Blocking Time (TBT) < 200ms
  - [ ] Cumulative Layout Shift (CLS) < 0.1

- [ ] **Accessibility Score: > 90**
  - [ ] All images have alt text
  - [ ] Proper heading hierarchy
  - [ ] Color contrast meets WCAG AA
  - [ ] Keyboard navigation works
  - [ ] Screen reader compatible
  - [ ] ARIA labels where needed

- [ ] **Best Practices Score: > 90**
  - [ ] HTTPS enabled
  - [ ] No console errors
  - [ ] No deprecated APIs
  - [ ] Proper image formats
  - [ ] Security headers set

- [ ] **SEO Score: > 90**
  - [ ] Meta tags present
  - [ ] Structured data (JSON-LD)
  - [ ] Sitemap.xml accessible
  - [ ] Robots.txt configured
  - [ ] Canonical URLs set

### Bundle Size
- [ ] **Total Bundle Size < 500KB (gzipped)**
  - [ ] Main bundle size
  - [ ] Vendor bundle size
  - [ ] CSS bundle size
  - [ ] Image optimization verified

### Network Performance
- [ ] **3G Network Test**
  - [ ] Page loads in < 10s on 3G
  - [ ] Critical content visible first
  - [ ] Images lazy load

- [ ] **4G Network Test**
  - [ ] Page loads in < 3s on 4G
  - [ ] Smooth interactions

### Runtime Performance
- [ ] No memory leaks during extended use
- [ ] Smooth scrolling (60fps)
- [ ] Animations perform smoothly
- [ ] No jank during interactions
- [ ] Efficient re-renders (React)

---

## Security Testing

### Injection Attacks
- [ ] **SQL Injection**
  - [ ] Test form inputs with SQL commands
  - [ ] Verify queries use parameterized statements
  - [ ] Test database queries for injection vulnerabilities

- [ ] **XSS (Cross-Site Scripting)**
  - [ ] Test form inputs with `<script>` tags
  - [ ] Test URL parameters with scripts
  - [ ] Verify output is sanitized
  - [ ] Test stored XSS in user-generated content

- [ ] **Command Injection**
  - [ ] Test file upload with malicious filenames
  - [ ] Verify file handling is secure

### Authentication & Authorization
- [ ] **Authentication Required**
  - [ ] Protected routes redirect to login
  - [ ] API endpoints require authentication
  - [ ] Session expires after inactivity
  - [ ] JWT tokens expire correctly

- [ ] **Authorization Checks**
  - [ ] Customers cannot access admin routes
  - [ ] Users cannot access other users' data
  - [ ] RLS policies prevent unauthorized access
  - [ ] Role-based access control works

### CSRF Protection
- [ ] **CSRF Tokens**
  - [ ] Forms include CSRF tokens
  - [ ] API requests include CSRF tokens
  - [ ] Invalid tokens rejected

### Rate Limiting
- [ ] **Contact Form Rate Limiting**
  - [ ] Max 3 submissions per hour per IP
  - [ ] Rate limit message displayed
  - [ ] Rate limit resets after hour

- [ ] **Login Rate Limiting**
  - [ ] Max 5 failed attempts per 15 minutes
  - [ ] Account locked after max attempts
  - [ ] Lockout message displayed

- [ ] **API Rate Limiting**
  - [ ] API endpoints have rate limits
  - [ ] Rate limit headers returned
  - [ ] 429 status code on limit exceeded

### Data Protection
- [ ] **Sensitive Data**
  - [ ] No API keys in frontend code
  - [ ] No passwords in console logs
  - [ ] No sensitive data in localStorage
  - [ ] Credit card data never stored

- [ ] **Data Encryption**
  - [ ] HTTPS enforced
  - [ ] Sensitive data encrypted at rest
  - [ ] Passwords hashed (bcrypt/argon2)

### Security Headers
- [ ] **Content Security Policy (CSP)**
  - [ ] CSP header set
  - [ ] No inline scripts (or nonce used)
  - [ ] External resources whitelisted

- [ ] **Other Headers**
  - [ ] X-Frame-Options: DENY
  - [ ] X-Content-Type-Options: nosniff
  - [ ] Referrer-Policy set
  - [ ] Permissions-Policy set
  - [ ] Strict-Transport-Security (HSTS)

---

## Email Testing

### Email Delivery
- [ ] **Order Confirmation Email**
  - [ ] Email received within 30 seconds
  - [ ] Check spam folder if not in inbox
  - [ ] Email contains correct order details
  - [ ] Order number matches
  - [ ] Tracking link works
  - [ ] Email renders correctly (desktop)
  - [ ] Email renders correctly (mobile)

- [ ] **Status Update Emails**
  - [ ] Confirmed status email
  - [ ] In progress email
  - [ ] Ready notification email
  - [ ] Out for delivery email
  - [ ] Delivered email

- [ ] **Cancellation Email**
  - [ ] Cancellation email sent
  - [ ] Refund information included
  - [ ] Links work correctly

- [ ] **Refund Confirmation**
  - [ ] Refund email sent
  - [ ] Refund amount correct
  - [ ] Refund status included

- [ ] **Review Request**
  - [ ] Review request sent after delivery
  - [ ] Review link works
  - [ ] Email timing correct

### Email Content
- [ ] All links in emails work
- [ ] Images in emails load
- [ ] Email branding consistent
- [ ] Bilingual emails (if applicable)
- [ ] Unsubscribe links (if applicable)

### Email Providers
- [ ] Test with Gmail
- [ ] Test with Outlook
- [ ] Test with Yahoo
- [ ] Test with Apple Mail
- [ ] Verify not marked as spam

---

## Payment Testing

### Successful Payments
- [ ] **Test Card: 4111 1111 1111 1111**
  - [ ] Payment processes successfully
  - [ ] Order created correctly
  - [ ] Confirmation email sent
  - [ ] Square dashboard shows transaction
  - [ ] Amount matches order total

### Declined Payments
- [ ] **Declined Card: 4000 0000 0000 0002**
  - [ ] Error message displayed clearly
  - [ ] User can retry payment
  - [ ] Order not created
  - [ ] No charge attempted

- [ ] **Insufficient Funds: 4000 0000 0000 9995**
  - [ ] Error message displayed
  - [ ] User can retry with different card

- [ ] **Expired Card: 4000 0000 0000 0069**
  - [ ] Error message displayed
  - [ ] User prompted to use different card

- [ ] **Invalid CVV: 4000 0000 0000 0127**
  - [ ] CVV validation error
  - [ ] User can correct and retry

### Payment Amount Verification
- [ ] Payment amount matches order total exactly
- [ ] Delivery fee included when applicable
- [ ] No delivery fee for pickup orders
- [ ] Promo codes applied correctly
- [ ] No duplicate charges possible

### Refund Testing
- [ ] Refund processes correctly
- [ ] Refund amount matches original charge
- [ ] Refund appears in Square dashboard
- [ ] Customer receives refund confirmation
- [ ] Refund status updates in order

### 3D Secure (if applicable)
- [ ] 3D Secure flow works
- [ ] User can complete authentication
- [ ] Payment processes after authentication

---

## Error Handling Testing

### Network Failures
- [ ] **Offline Detection**
  - [ ] Offline indicator shown
  - [ ] User notified of offline status
  - [ ] Forms saved locally (if applicable)

- [ ] **Network Timeout**
  - [ ] Timeout message displayed
  - [ ] User can retry request
  - [ ] No data loss

- [ ] **Slow Network**
  - [ ] Loading indicators shown
  - [ ] User can cancel long requests
  - [ ] Graceful degradation

### Server Errors
- [ ] **500 Internal Server Error**
  - [ ] Error page displayed
  - [ ] User-friendly error message
  - [ ] User can retry or go back
  - [ ] Error logged for debugging

- [ ] **404 Not Found**
  - [ ] Custom 404 page displayed
  - [ ] Navigation links available
  - [ ] Search functionality available

- [ ] **503 Service Unavailable**
  - [ ] Maintenance message displayed
  - [ ] User notified of temporary issue

### Form Validation Errors
- [ ] **Clear Error Messages**
  - [ ] Errors displayed near relevant fields
  - [ ] Error messages are helpful
  - [ ] Errors clear when fixed
  - [ ] Required fields clearly marked

- [ ] **Validation Timing**
  - [ ] Real-time validation (as user types)
  - [ ] Validation on blur
  - [ ] Validation on submit

### Payment Failures
- [ ] **Payment Error Recovery**
  - [ ] Error message displayed clearly
  - [ ] User can retry payment
  - [ ] Order data preserved
  - [ ] No partial charges

---

## Real-World Scenario Testing

### New Customer Journey
1. [ ] Customer visits homepage
2. [ ] Customer browses gallery
3. [ ] Customer views menu
4. [ ] Customer reads FAQ
5. [ ] Customer creates account
6. [ ] Customer places order
7. [ ] Customer receives confirmation
8. [ ] Customer tracks order
9. [ ] Customer receives ready notification
10. [ ] Customer picks up/delivery received
11. [ ] Customer submits review

### Returning Customer Journey
1. [ ] Customer logs in
2. [ ] Customer views order history
3. [ ] Customer uses saved address
4. [ ] Customer places new order
5. [ ] Customer receives confirmation

### Order Modification
1. [ ] Customer places order
2. [ ] Customer realizes mistake
3. [ ] Customer cancels order
4. [ ] Customer receives refund
5. [ ] Customer places corrected order

### Baker Workflow
1. [ ] Baker logs in
2. [ ] Baker views kitchen display
3. [ ] Baker sees new orders
4. [ ] Baker updates order status
5. [ ] Baker marks order ready
6. [ ] Customer receives notification

### Owner Workflow
1. [ ] Owner logs in
2. [ ] Owner views dashboard
3. [ ] Owner checks analytics
4. [ ] Owner manages pricing
5. [ ] Owner manages capacity
6. [ ] Owner exports reports
7. [ ] Owner manages content (FAQ, Gallery)

---

## Load Testing

### Concurrent Users
- [ ] **100 Concurrent Users**
  - [ ] API handles load
  - [ ] Database queries perform well
  - [ ] No timeouts
  - [ ] Response times acceptable

- [ ] **500 Concurrent Users**
  - [ ] System remains stable
  - [ ] No crashes
  - [ ] Graceful degradation

### Database Performance
- [ ] Query execution time < 100ms (average)
- [ ] No N+1 query problems
- [ ] Indexes used correctly
- [ ] Connection pooling working

### Memory & CPU
- [ ] No memory leaks
- [ ] CPU usage reasonable
- [ ] Server remains responsive

---

## Test Execution Log

### Test Session Template
```
Date: ___________
Tester: ___________
Browser: ___________
Device: ___________
Environment: [ ] Development [ ] Staging [ ] Production

Tests Executed: ___ / ___
Passed: ___
Failed: ___
Blocked: ___

Issues Found:
1. [Issue description]
   - Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
   - Status: [ ] Open [ ] Fixed [ ] Verified

2. [Issue description]
   - Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
   - Status: [ ] Open [ ] Fixed [ ] Verified

Notes:
_________________________________________________________________
_________________________________________________________________
```

---

## Sign-Off Checklist

Before launching to production, ensure:

- [ ] All critical bugs fixed
- [ ] All high-priority bugs fixed
- [ ] Performance targets met
- [ ] Security testing passed
- [ ] Payment processing verified
- [ ] Email delivery confirmed
- [ ] Cross-browser testing complete
- [ ] Mobile testing complete
- [ ] Documentation updated
- [ ] Team trained on new features
- [ ] Rollback plan prepared
- [ ] Monitoring configured
- [ ] Backup strategy in place

**Sign-Off:**
- [ ] QA Lead: _________________ Date: _______
- [ ] Tech Lead: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______

---

## Notes

- Run tests in a staging environment that mirrors production
- Test with real payment cards in Square sandbox mode
- Use browser DevTools to simulate different network conditions
- Test with screen readers for accessibility
- Document all bugs found with screenshots/videos
- Retest after bug fixes
- Keep test data separate from production data
