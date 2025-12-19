# Customer Support Features Implementation

## Overview
Complete customer support system for the bakery website including contact forms, order issue reporting, FAQ enhancements, and admin management tools.

## Features Implemented

### 1. Contact Form (`/contact`)
- **Location**: `src/pages/Contact.tsx`
- **Features**:
  - Name, email, phone, message fields
  - Subject dropdown (General, Order Issue, Custom Request, Feedback)
  - Image attachment support (max 5MB)
  - Honeypot spam protection
  - Rate limiting (max 3 submissions per hour per IP)
  - Pre-fills order number when accessed from order tracking
  - Auto-reply confirmation email to customer
  - Notification email to owner

### 2. Order Issue Reporting (`/order-issue`)
- **Location**: `src/pages/OrderIssue.tsx`
- **Features**:
  - Report issues with completed orders
  - Issue categories: Wrong order, Quality issue, Late delivery, Other
  - Photo upload support (up to 3 photos)
  - Automatic order lookup by order number
  - Email notifications to owner and customer
  - Status tracking (open, investigating, resolved, closed)

### 3. Enhanced FAQ Page (`/faq`)
- **Location**: `src/pages/FAQ.tsx`
- **New Features**:
  - Search functionality
  - Category filtering (All, Ordering, Delivery, Payment, Custom Cakes)
  - "Was this helpful?" feedback system
  - Category badges on questions
  - Improved UI with accordion layout

### 4. Order Tracking Help Integration
- **Location**: `src/pages/OrderTracking.tsx`
- **Features**:
  - "Need help with this order?" button
  - Direct links to contact form and issue reporting
  - Pre-filled order information

### 5. Phone Click-to-Call
- **Implementation**: Already present in:
  - `src/components/home/LocationSection.tsx`
  - `src/pages/FAQ.tsx`
  - `src/pages/Contact.tsx`
- Uses `tel:+16109109067` links for mobile devices

### 6. Admin Dashboard Integration
- **Location**: `src/pages/OwnerDashboard.tsx`
- **New Tab**: "Support" with two sub-tabs:
  - **Contact Messages**: `src/components/admin/ContactSubmissionsManager.tsx`
    - View all contact form submissions
    - Filter by status (new, read, responded, resolved)
    - Update submission status
    - Add admin notes
    - Use response templates
  - **Order Issues**: `src/components/admin/OrderIssuesManager.tsx`
    - View all reported order issues
    - Filter by status (open, investigating, resolved, closed)
    - Update issue status
    - Add admin responses and resolution notes
    - View issue photos

### 7. Email Notifications
- **Edge Functions**:
  - `supabase/functions/send-contact-notification/index.ts`
    - Sends notification to owner when contact form is submitted
    - Sends auto-reply confirmation to customer
  - `supabase/functions/send-order-issue-notification/index.ts`
    - Sends priority alert to owner when order issue is reported
    - Sends confirmation to customer

### 8. Database Schema
- **Location**: `backend/db/customer-support-schema.sql`
- **Tables Created**:
  - `contact_submissions` - Stores all contact form submissions
  - `order_issues` - Stores reported order issues
  - `response_templates` - Admin response templates (for future use)
  - `faq_feedback` - Tracks FAQ helpful/not helpful votes
  - `contact_rate_limits` - Rate limiting for spam protection

### 9. API Functions
- **Location**: `src/lib/support.ts`
- **Functions**:
  - `submitContactForm()` - Submit contact form with validation
  - `submitOrderIssue()` - Report order issue
  - `getContactSubmissions()` - Admin: Get all submissions
  - `getOrderIssues()` - Admin: Get all issues
  - `updateContactSubmissionStatus()` - Admin: Update submission status
  - `updateOrderIssueStatus()` - Admin: Update issue status
  - `getResponseTemplates()` - Get response templates
  - `submitFAQFeedback()` - Submit FAQ helpful/not helpful vote

### 10. React Hooks
- **Location**: `src/lib/hooks/useSupport.ts`
- **Hooks**:
  - `useSubmitContactForm()` - Submit contact form mutation
  - `useSubmitOrderIssue()` - Submit order issue mutation
  - `useContactSubmissions()` - Query contact submissions
  - `useOrderIssues()` - Query order issues
  - `useUpdateContactSubmissionStatus()` - Update submission status
  - `useUpdateOrderIssueStatus()` - Update issue status
  - `useResponseTemplates()` - Query response templates
  - `useSubmitFAQFeedback()` - Submit FAQ feedback

## Setup Instructions

### 1. Database Migration
Run the SQL schema file to create the necessary tables:
```sql
-- Execute: backend/db/customer-support-schema.sql
```

### 2. Environment Variables
Ensure these are set in your Supabase project:
- `RESEND_API_KEY` - For email notifications
- `OWNER_EMAIL` - Owner email for notifications
- `FROM_EMAIL` - Sender email address
- `FROM_NAME` - Sender name
- `FRONTEND_URL` - Your website URL

### 3. Deploy Edge Functions
Deploy the email notification functions:
```bash
supabase functions deploy send-contact-notification
supabase functions deploy send-order-issue-notification
```

### 4. Set Up Database Triggers
The schema includes triggers for:
- Auto-updating `updated_at` timestamps
- Rate limiting for contact form submissions

### 5. Configure RLS Policies
Add Row Level Security policies for:
- `contact_submissions` - Only owners can view all, customers can view their own
- `order_issues` - Only owners can view all, customers can view their own
- `faq_feedback` - Public read, authenticated write
- `response_templates` - Owner only

## Usage

### For Customers

1. **Contact Form**:
   - Navigate to `/contact`
   - Fill out the form
   - Attach image if needed
   - Submit (max 3 per hour)

2. **Report Order Issue**:
   - Navigate to `/order-issue?orderNumber=ORD-XXX`
   - Or click "Report Issue" button on order tracking page
   - Select issue category
   - Describe the problem
   - Upload photos if available
   - Submit

3. **FAQ Feedback**:
   - Navigate to `/faq`
   - Search or filter by category
   - Click "Yes" or "No" on helpful question

### For Admins

1. **View Contact Submissions**:
   - Go to Owner Dashboard → Support → Contact Messages
   - Filter by status
   - Click "View" to see details
   - Update status and add notes

2. **Manage Order Issues**:
   - Go to Owner Dashboard → Support → Order Issues
   - Filter by status
   - Click "View" to see details
   - Add admin response and resolution notes
   - Update status

## Response Templates (Future Enhancement)

The system includes support for response templates. To use:
1. Add templates to `response_templates` table
2. Templates will appear in Contact Submissions Manager
3. Select template to auto-fill admin notes

## Email Notifications

### Contact Form Submission
- **Owner**: Receives notification with submission details
- **Customer**: Receives auto-reply confirmation

### Order Issue Report
- **Owner**: Receives priority alert with issue details and photos
- **Customer**: Receives confirmation that issue was received

## Rate Limiting

Contact form submissions are rate-limited to 3 per hour per IP address. This prevents spam while allowing legitimate users to submit multiple inquiries.

## Security Features

1. **Honeypot Field**: Hidden field that bots fill but humans don't
2. **Rate Limiting**: Prevents spam submissions
3. **IP Tracking**: Tracks submissions by IP for rate limiting
4. **File Validation**: Image type and size validation
5. **RLS Policies**: Database-level security

## Future Enhancements

1. **Live Chat Integration**: Add Crisp, Intercom, or Tawk.to
2. **Response Templates UI**: Admin UI for managing templates
3. **Daily Digest**: Email digest of all submissions/issues
4. **SMS Notifications**: Add SMS alerts for urgent issues
5. **Customer Portal**: Allow customers to view their submission history

## Files Created/Modified

### New Files
- `backend/db/customer-support-schema.sql`
- `src/lib/support.ts`
- `src/lib/hooks/useSupport.ts`
- `src/pages/Contact.tsx`
- `src/pages/OrderIssue.tsx`
- `src/components/admin/ContactSubmissionsManager.tsx`
- `src/components/admin/OrderIssuesManager.tsx`
- `supabase/functions/send-contact-notification/index.ts`
- `supabase/functions/send-order-issue-notification/index.ts`

### Modified Files
- `src/pages/FAQ.tsx` - Added search, categories, feedback
- `src/pages/OrderTracking.tsx` - Added help buttons
- `src/pages/OwnerDashboard.tsx` - Added Support tab
- `src/App.tsx` - Added routes for Contact and OrderIssue

## Testing Checklist

- [ ] Contact form submission works
- [ ] Rate limiting prevents spam
- [ ] Email notifications sent correctly
- [ ] Order issue reporting works
- [ ] FAQ search and filtering works
- [ ] FAQ feedback submission works
- [ ] Admin can view and manage submissions
- [ ] Admin can view and manage issues
- [ ] Phone click-to-call works on mobile
- [ ] Image uploads work correctly
- [ ] Order pre-filling works from tracking page

## Support

For issues or questions about the customer support system, refer to this documentation or check the code comments in the implementation files.

