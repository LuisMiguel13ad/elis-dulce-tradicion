# 🔴 Critical Fixes Checklist - Quick Reference

## Must Fix Before Launch (Estimated: 3-5 days)

### 1. Authentication & Security (CRITICAL - 2-3 days)

#### Backend Session Management
- [ ] Install `express-session` and `connect-pg-simple` (or Redis)
- [ ] Configure session store in `backend/server.js`
- [ ] Set secure cookie flags (`httpOnly`, `secure`, `sameSite`)
- [ ] Create `/api/auth/login` endpoint with PIN validation
- [ ] Create `/api/auth/logout` endpoint
- [ ] Create `/api/auth/me` endpoint to verify session
- [ ] Update `backend/middleware/auth.js` to check session instead of API key

#### Frontend Authentication
- [ ] Update `src/contexts/AuthContext.tsx` to call `/api/auth/login`
- [ ] Store session cookie instead of localStorage
- [ ] Add PIN input to `src/pages/Login.tsx`
- [ ] Remove hardcoded "click to login" buttons
- [ ] Add session refresh logic

#### Environment Variables
- [ ] Remove default API key from `backend/middleware/auth.js`
- [ ] Add validation: fail if `ADMIN_API_KEY` not set
- [ ] Document required env vars in `.env.example`

**Files to modify:**
- `backend/server.js`
- `backend/middleware/auth.js`
- `src/contexts/AuthContext.tsx`
- `src/pages/Login.tsx`
- `src/lib/api.ts` (add auth endpoints)

---

### 2. Order Tracking Security Fix (CRITICAL - 30 minutes)

**Current bug:** Order tracking fetches ALL orders and filters client-side

**Fix:**
```typescript
// src/pages/OrderTracking.tsx - Line 28-35
// BEFORE (WRONG):
const orders = (await api.getAllOrders()) as any[];
const foundOrder = orders.find(...);

// AFTER (CORRECT):
const order = await api.getOrderByNumber(orderNumber);
```

**Files to modify:**
- `src/pages/OrderTracking.tsx` (line 28-35)

---

### 3. Rate Limiting (CRITICAL - 1 hour)

**Install:**
```bash
npm install express-rate-limit
```

**Add to `backend/server.js`:**
```javascript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit login attempts
  message: 'Too many login attempts, please try again later.'
});

// Apply to routes
app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);
```

**Files to modify:**
- `backend/server.js`
- `package.json` (add dependency)

---

### 4. Error Boundaries (CRITICAL - 1 hour)

**Create `src/components/ErrorBoundary.tsx`:**
```typescript
import React from 'react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              We're sorry, but something unexpected happened.
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Wrap app in `src/App.tsx`:**
```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      {/* ... rest of app */}
    </QueryClientProvider>
  </ErrorBoundary>
);
```

**Files to create:**
- `src/components/ErrorBoundary.tsx`

**Files to modify:**
- `src/App.tsx`

---

### 5. Payment Integration (CRITICAL - 1-2 days)

**Uncomment Square SDK in `backend/routes/payments.js`:**
```javascript
// Remove mock client, use real Square SDK
import { Client, Environment } from 'square';

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
});
```

**Test webhook:**
- [ ] Configure webhook URL in Square dashboard
- [ ] Test webhook signature verification
- [ ] Test payment flow end-to-end
- [ ] Handle payment failures gracefully

**Files to modify:**
- `backend/routes/payments.js`
- `backend/routes/webhooks.js`

---

### 6. Environment Variable Validation (HIGH - 1 hour)

**Create `backend/utils/validateEnv.js`:**
```javascript
const requiredVars = [
  'DATABASE_URL',
  'SQUARE_ACCESS_TOKEN',
  'SQUARE_LOCATION_ID',
  'ADMIN_API_KEY',
  'FRONTEND_URL',
];

export function validateEnv() {
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
}
```

**Call in `backend/server.js` before starting:**
```javascript
import { validateEnv } from './utils/validateEnv.js';
validateEnv();
```

**Files to create:**
- `backend/utils/validateEnv.js`

**Files to modify:**
- `backend/server.js`

---

## High Priority (Fix Soon After Launch)

### 7. Error Tracking (1 day)
- [ ] Install Sentry (`@sentry/react`, `@sentry/node`)
- [ ] Configure in frontend and backend
- [ ] Set up alerts for critical errors

### 8. Email System (1 day)
- [ ] Install `nodemailer` package
- [ ] Configure SMTP in `backend/routes/webhooks.js`
- [ ] Test email delivery
- [ ] Create email templates

### 9. Input Sanitization (1 day)
- [ ] Install `helmet` middleware
- [ ] Install `dompurify` for frontend
- [ ] Sanitize all user inputs
- [ ] Add file upload virus scanning (optional)

### 10. Monitoring (1 day)
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure structured logging (`winston`)
- [ ] Add correlation IDs
- [ ] Set up alerts

---

## Quick Wins (Do These First)

1. ✅ **Fix order tracking** (30 min) - Easiest fix, biggest security impact
2. ✅ **Add rate limiting** (1 hour) - Quick security improvement
3. ✅ **Add error boundary** (1 hour) - Prevents app crashes
4. ✅ **Environment validation** (1 hour) - Prevents config errors

---

## Testing Checklist

After each fix, test:
- [ ] Feature still works as expected
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Works in production build (`npm run build`)
- [ ] Works on mobile devices

---

## Deployment Order

1. **Week 1:** Critical fixes (1-6)
2. **Week 2:** High priority (7-10)
3. **Week 3:** Testing and polish
4. **Week 4:** Launch 🚀

---

*Last updated: December 9, 2025*
