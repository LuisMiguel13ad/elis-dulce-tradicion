# Manual Test Scripts

## Test Script 1: Complete Order Flow (New Customer)

### Prerequisites
- Clear browser cache
- Use incognito/private mode
- Start on homepage

### Steps
1. **Homepage**
   - [ ] Page loads within 3 seconds
   - [ ] Hero section displays correctly
   - [ ] Navigation menu works
   - [ ] "Order Now" button visible and clickable

2. **Navigate to Order Page**
   - [ ] Click "Order Now" button
   - [ ] Order page loads
   - [ ] Form displays correctly

3. **Fill Order Form**
   - [ ] Select date needed (tomorrow or later)
   - [ ] Select time needed
   - [ ] Enter customer name: "Test Customer"
   - [ ] Enter email: "test@example.com"
   - [ ] Enter phone: "610-555-1234"
   - [ ] Select cake size: "8 inch"
   - [ ] Select filling: "Chocolate"
   - [ ] Enter theme: "Birthday"
   - [ ] Enter dedication: "Happy Birthday!"
   - [ ] Verify price updates correctly

4. **Upload Reference Image**
   - [ ] Click "Upload Reference Image"
   - [ ] Select image file (JPG, < 5MB)
   - [ ] Verify image preview displays
   - [ ] Verify upload completes

5. **Select Delivery Option**
   - [ ] Select "Delivery"
   - [ ] Enter address: "123 Main St"
   - [ ] Enter city: "Bensalem"
   - [ ] Enter zip: "19020"
   - [ ] Verify delivery fee added to total

6. **Proceed to Payment**
   - [ ] Click "Proceed to Payment"
   - [ ] Payment page loads
   - [ ] Order summary displays correctly
   - [ ] Total amount matches

7. **Complete Payment**
   - [ ] Enter test card: 4111 1111 1111 1111
   - [ ] Enter expiry: 12/25
   - [ ] Enter CVV: 123
   - [ ] Enter zip: 19020
   - [ ] Click "Pay Now"
   - [ ] Payment processes

8. **Order Confirmation**
   - [ ] Confirmation page displays
   - [ ] Order number shown
   - [ ] Order details correct
   - [ ] "Track Order" button works

9. **Email Verification**
   - [ ] Check email inbox
   - [ ] Confirmation email received
   - [ ] Email contains correct order details
   - [ ] Tracking link in email works

10. **Order Tracking**
    - [ ] Navigate to order tracking page
    - [ ] Enter order number
    - [ ] Order details display correctly
    - [ ] Status shows "pending" or "confirmed"

### Expected Results
- Order created successfully
- Payment processed
- Confirmation email sent
- Order tracking works
- All data accurate

---

## Test Script 2: User Registration and Login

### Steps
1. **Navigate to Signup**
   - [ ] Click "Sign Up" in navigation
   - [ ] Signup page loads

2. **Fill Registration Form**
   - [ ] Enter name: "Test User"
   - [ ] Enter email: "newuser@example.com"
   - [ ] Enter password: "SecurePass123!"
   - [ ] Confirm password: "SecurePass123!"
   - [ ] Accept terms and conditions
   - [ ] Click "Sign Up"

3. **Email Confirmation**
   - [ ] Check email inbox
   - [ ] Confirmation email received
   - [ ] Click confirmation link
   - [ ] Account activated

4. **Login**
   - [ ] Navigate to login page
   - [ ] Enter email: "newuser@example.com"
   - [ ] Enter password: "SecurePass123!"
   - [ ] Click "Login"
   - [ ] Successfully logged in
   - [ ] Redirected to customer dashboard

5. **Logout**
   - [ ] Click logout button
   - [ ] Logged out successfully
   - [ ] Redirected to homepage

### Expected Results
- Account created
- Email confirmation sent
- Login works
- Logout works
- Protected routes inaccessible after logout

---

## Test Script 3: Order Cancellation and Refund

### Prerequisites
- Order already placed (from Test Script 1)
- Order status: "confirmed" or "pending"

### Steps
1. **Navigate to Order Tracking**
   - [ ] Go to order tracking page
   - [ ] Enter order number
   - [ ] Order details display

2. **Cancel Order**
   - [ ] Click "Cancel Order" button
   - [ ] Cancellation modal opens
   - [ ] Select cancellation reason
   - [ ] Enter optional notes
   - [ ] Confirm cancellation

3. **Verify Cancellation**
   - [ ] Order status updated to "cancelled"
   - [ ] Cancellation email received
   - [ ] Refund information in email

4. **Verify Refund**
   - [ ] Check Square dashboard
   - [ ] Refund processed
   - [ ] Refund amount correct
   - [ ] Refund confirmation email received

### Expected Results
- Order cancelled successfully
- Refund processed
- Customer notified
- No partial charges

---

## Test Script 4: Admin Dashboard

### Prerequisites
- Login as owner/admin

### Steps
1. **Access Dashboard**
   - [ ] Login as owner
   - [ ] Navigate to `/owner-dashboard`
   - [ ] Dashboard loads

2. **View Metrics**
   - [ ] Today's orders displayed
   - [ ] Revenue metrics shown
   - [ ] Pending orders count correct
   - [ ] Charts render correctly

3. **View Orders**
   - [ ] Click "Orders" tab
   - [ ] Order list displays
   - [ ] Search functionality works
   - [ ] Filter by status works

4. **Update Order Status**
   - [ ] Select an order
   - [ ] Update status to "in_progress"
   - [ ] Status updates
   - [ ] Customer receives notification

5. **View Analytics**
   - [ ] Click "Analytics" tab
   - [ ] Revenue charts display
   - [ ] Popular items shown
   - [ ] Peak times chart visible

6. **Export Reports**
   - [ ] Click "Reports" tab
   - [ ] Click "Daily Sales Report"
   - [ ] CSV file downloads
   - [ ] File contains correct data

### Expected Results
- Dashboard loads correctly
- All metrics accurate
- Order management works
- Reports export correctly

---

## Test Script 5: Mobile Order Flow

### Prerequisites
- Use mobile device or browser DevTools mobile emulation
- Test on actual mobile device if possible

### Steps
1. **Homepage on Mobile**
   - [ ] Page loads quickly
   - [ ] Layout adapts to mobile
   - [ ] Navigation menu works (hamburger menu)
   - [ ] Touch targets adequate size

2. **Order Form on Mobile**
   - [ ] Form displays correctly
   - [ ] Date picker works (mobile native)
   - [ ] Text inputs usable
   - [ ] Camera capture works for image upload
   - [ ] Form scrollable

3. **Payment on Mobile**
   - [ ] Payment form displays correctly
   - [ ] Card input works
   - [ ] Keyboard appropriate (numeric for card)
   - [ ] Submit button accessible

4. **Order Tracking on Mobile**
   - [ ] Tracking page displays correctly
   - [ ] Order details readable
   - [ ] Status updates visible
   - [ ] Buttons touch-friendly

### Expected Results
- Mobile experience smooth
- All functionality works
- No horizontal scrolling
- Touch interactions work

---

## Test Script 6: Error Scenarios

### Steps
1. **Invalid Login**
   - [ ] Enter wrong email
   - [ ] Enter wrong password
   - [ ] Error message displayed
   - [ ] After 5 attempts, account locked

2. **Network Failure**
   - [ ] Disable network (DevTools)
   - [ ] Try to submit form
   - [ ] Error message displayed
   - [ ] User can retry when online

3. **Payment Decline**
   - [ ] Use declined card: 4000 0000 0000 0002
   - [ ] Error message displayed
   - [ ] User can retry with different card
   - [ ] Order not created

4. **Invalid Order Data**
   - [ ] Try to order for past date
   - [ ] Error message displayed
   - [ ] Try to order with less than 24h notice
   - [ ] Error message displayed

5. **404 Page**
   - [ ] Navigate to non-existent page
   - [ ] Custom 404 page displays
   - [ ] Navigation links work

### Expected Results
- All errors handled gracefully
- Error messages clear and helpful
- User can recover from errors
- No data loss

---

## Test Script 7: Performance Testing

### Steps
1. **Lighthouse Audit**
   - [ ] Open Chrome DevTools
   - [ ] Run Lighthouse audit
   - [ ] Performance score > 90
   - [ ] Accessibility score > 90
   - [ ] Best Practices score > 90
   - [ ] SEO score > 90

2. **Network Throttling**
   - [ ] Set to "Slow 3G"
   - [ ] Page loads in < 10 seconds
   - [ ] Critical content visible first

3. **Bundle Size Check**
   - [ ] Open Network tab
   - [ ] Reload page
   - [ ] Check bundle sizes
   - [ ] Total < 500KB (gzipped)

4. **Runtime Performance**
   - [ ] Open Performance tab
   - [ ] Record page interaction
   - [ ] Check for jank
   - [ ] FPS stays near 60

### Expected Results
- All performance targets met
- No performance regressions
- Smooth user experience

---

## Test Script 8: Security Testing

### Steps
1. **SQL Injection Test**
   - [ ] In order form, enter: `'; DROP TABLE orders; --`
   - [ ] Submit form
   - [ ] Verify no SQL executed
   - [ ] Order created normally (or error handled)

2. **XSS Test**
   - [ ] In form field, enter: `<script>alert('XSS')</script>`
   - [ ] Submit form
   - [ ] Verify script not executed
   - [ ] Output sanitized

3. **Authentication Bypass**
   - [ ] Try to access `/owner-dashboard` without login
   - [ ] Verify redirect to login
   - [ ] Try to access API endpoint directly
   - [ ] Verify 401/403 response

4. **Rate Limiting**
   - [ ] Submit contact form 4 times quickly
   - [ ] Verify 4th submission blocked
   - [ ] Rate limit message displayed

5. **Sensitive Data**
   - [ ] Check browser console
   - [ ] Verify no API keys visible
   - [ ] Check localStorage
   - [ ] Verify no sensitive data stored

### Expected Results
- All security measures working
- No vulnerabilities found
- User data protected

---

## Test Execution Checklist

Use this checklist to track test execution:

```
Test Script 1: Complete Order Flow
  Executed: [ ] Yes [ ] No
  Date: ___________
  Result: [ ] Pass [ ] Fail [ ] Blocked
  Notes: _________________________________

Test Script 2: User Registration
  Executed: [ ] Yes [ ] No
  Date: ___________
  Result: [ ] Pass [ ] Fail [ ] Blocked
  Notes: _________________________________

Test Script 3: Order Cancellation
  Executed: [ ] Yes [ ] No
  Date: ___________
  Result: [ ] Pass [ ] Fail [ ] Blocked
  Notes: _________________________________

Test Script 4: Admin Dashboard
  Executed: [ ] Yes [ ] No
  Date: ___________
  Result: [ ] Pass [ ] Fail [ ] Blocked
  Notes: _________________________________

Test Script 5: Mobile Order Flow
  Executed: [ ] Yes [ ] No
  Date: ___________
  Result: [ ] Pass [ ] Fail [ ] Blocked
  Notes: _________________________________

Test Script 6: Error Scenarios
  Executed: [ ] Yes [ ] No
  Date: ___________
  Result: [ ] Pass [ ] Fail [ ] Blocked
  Notes: _________________________________

Test Script 7: Performance Testing
  Executed: [ ] Yes [ ] No
  Date: ___________
  Result: [ ] Pass [ ] Fail [ ] Blocked
  Notes: _________________________________

Test Script 8: Security Testing
  Executed: [ ] Yes [ ] No
  Date: ___________
  Result: [ ] Pass [ ] Fail [ ] Blocked
  Notes: _________________________________
```
