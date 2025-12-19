# Security Implementation Guide

This document outlines the comprehensive security measures implemented across the application.

## Overview

The application implements multiple layers of security:
1. **Backend Security Middleware**
2. **Input Validation & Sanitization**
3. **Authentication & Authorization**
4. **Rate Limiting**
5. **Row Level Security (RLS)**
6. **Error Handling & Logging**
7. **Security Headers**
8. **SQL Injection Prevention**

## Backend Security Middleware

### Authentication (`backend/middleware/auth.js`)

- **JWT Token Verification**: Verifies Supabase JWT tokens
- **API Key Support**: Admin access via API key
- **Role-Based Access**: Checks user roles (owner, baker, customer)
- **Middleware Functions**:
  - `requireAuth`: Requires authentication (JWT or API key)
  - `requireAdmin`: Requires admin role (owner or baker)
  - `requireOwner`: Requires owner role specifically

### Rate Limiting (`backend/middleware/rateLimit.js`)

- **General Limiter**: 100 requests per 15 minutes
- **Order Creation Limiter**: 10 requests per minute
- **Auth Limiter**: 5 login attempts per 15 minutes
- **Admin Limiter**: 1000 requests per minute

### Input Validation (`backend/middleware/validateInput.js`)

- **XSS Prevention**: DOMPurify sanitization
- **Input Sanitization**: Recursive object sanitization
- **Validation Functions**:
  - `validateEmail`: Email format validation
  - `validatePhone`: E.164 phone format
  - `validateDate`: Date range validation (not past, within 90 days)
  - `validateAmount`: Amount validation (positive, max $1000)
  - `validateOrderNumber`: Order number format validation

### Error Handling (`backend/middleware/errorHandler.js`)

- **Standardized Error Responses**: Consistent error format
- **Error Logging**: Logs to database (`error_logs` table)
- **Sentry Integration**: Production error tracking
- **User-Friendly Messages**: No stack traces in production

### CORS (`backend/middleware/cors.js`)

- **Whitelist Origins**: Only allowed origins
- **Credentials Support**: Allows cookies/auth headers
- **Method Restrictions**: Only allowed HTTP methods
- **Header Restrictions**: Only allowed headers

## Input Validation

### Frontend (`src/lib/validation.ts`)

All validation functions return:
```typescript
{
  valid: boolean;
  error?: string;
  value?: T; // Sanitized/validated value
}
```

**Functions:**
- `validateEmail(email)`: Email format validation
- `validatePhone(phone)`: E.164 format validation
- `validateDate(date)`: Date range validation
- `validateAmount(amount)`: Amount validation
- `validateOrderNumber(number)`: Order number format
- `sanitizeString(input)`: XSS prevention
- `sanitizeObject(obj)`: Recursive sanitization

### Backend (`backend/middleware/validateInput.js`)

- Automatic sanitization of all request inputs
- Validation middleware for specific routes
- Type checking and format validation

## Row Level Security (RLS)

### Orders Table
- **Customers**: Can view/update their own orders
- **Admins**: Can view/update all orders
- **Public**: Can view orders by order number (for tracking)

### Profiles Table
- **Users**: Can view/update their own profile
- **Admins**: Can view all profiles, update any profile

### Payments Table
- **Users**: Can view payments for their own orders
- **Admins**: Can view all payments
- **System**: Can create payments (via authenticated API)

### Reviews Table
- **Public**: Can read reviews
- **Users**: Can create/update/delete their own reviews
- **Admins**: Can manage all reviews

### Pricing Tables
- **Public**: Can read active pricing
- **Admins**: Can manage all pricing

## API Response Standardization

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message",
    "details": { ... } // Optional, for validation errors
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Security Headers (Helmet.js)

- **Content Security Policy (CSP)**: Restricts resource loading
- **HSTS**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information

## SQL Injection Prevention

- **Parameterized Queries**: All database queries use parameterized statements
- **No String Concatenation**: Never build queries with string concatenation
- **Input Validation**: All inputs validated before database operations
- **Type Checking**: Validate parameter types before queries

## Environment Variable Validation

On startup, the application:
1. Checks for required environment variables
2. Validates format of critical variables
3. Warns about missing optional variables
4. Exits if critical variables are missing

## Error Logging

Errors are logged to:
1. **Console**: Development logging
2. **Database**: `error_logs` table (production)
3. **Sentry**: Production error tracking (if configured)

## Frontend Security

### Form Validation
- Real-time validation feedback
- Disable submit buttons during API calls
- Prevent duplicate submissions (debouncing)
- Client-side validation before API calls

### XSS Prevention
- All user inputs sanitized
- React automatically escapes content
- DOMPurify for HTML content

## Setup Instructions

### 1. Install Dependencies

```bash
npm install helmet express-rate-limit validator isomorphic-dompurify
```

### 2. Run Database Migrations

```bash
# In Supabase SQL Editor, run:
# - backend/db/error-logs-schema.sql
# - backend/db/rls-policies.sql
```

### 3. Configure Environment Variables

```env
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key

# Optional but recommended
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_API_KEY=your_admin_api_key
SENTRY_DSN=your_sentry_dsn
```

### 4. Enable Realtime (if using)

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

## Testing Security

### Test Rate Limiting
```bash
# Should fail after 10 requests
for i in {1..15}; do
  curl -X POST http://localhost:3001/api/orders \
    -H "Content-Type: application/json" \
    -d '{"test": "data"}'
done
```

### Test Input Validation
```bash
# Should fail with validation error
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_email": "invalid-email"}'
```

### Test Authentication
```bash
# Should fail with 401
curl http://localhost:3001/api/orders

# Should succeed with token
curl http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Checklist

- [x] JWT token verification
- [x] Rate limiting on all routes
- [x] Input sanitization (XSS prevention)
- [x] SQL injection prevention (parameterized queries)
- [x] RLS policies on all tables
- [x] Error logging to database
- [x] Security headers (helmet.js)
- [x] CORS configuration
- [x] Environment variable validation
- [x] Standardized API responses
- [x] Frontend form validation
- [x] Duplicate submission prevention

## Monitoring

- Check `error_logs` table regularly for security issues
- Monitor rate limit violations
- Review Sentry errors (production)
- Check authentication failures

## Best Practices

1. **Never expose stack traces** in production
2. **Always validate inputs** before database operations
3. **Use parameterized queries** for all database operations
4. **Log security events** (failed auth, rate limit violations)
5. **Keep dependencies updated** (npm audit)
6. **Use HTTPS** in production
7. **Rotate API keys** regularly
8. **Review RLS policies** periodically
