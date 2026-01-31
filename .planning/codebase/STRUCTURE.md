# Codebase Structure

**Analysis Date:** 2026-01-30

## Directory Layout

```
elis-dulce-tradicion/
├── src/                           # React frontend application
│   ├── main.tsx                   # App entry point, renders React DOM
│   ├── App.tsx                    # Root component, router setup, providers
│   ├── pages/                     # Page components (route-level)
│   ├── components/                # Reusable UI components organized by feature
│   ├── lib/                       # Utility libraries, API client, hooks, queries
│   ├── contexts/                  # React context providers (auth, language)
│   ├── hooks/                     # Custom React hooks
│   ├── types/                     # TypeScript type definitions
│   ├── utils/                     # Helper functions
│   ├── locales/                   # i18n translation files (en, es)
│   ├── assets/                    # Static images and media
│   ├── __tests__/                 # Frontend unit and integration tests
│   └── test/                      # Test utilities and mocks
│
├── backend/                       # Node.js/Express REST API server
│   ├── server.js                  # Express app setup, middleware, routes
│   ├── routes/                    # API endpoint handlers
│   ├── middleware/                # Request validation, auth, rate limiting, error handling
│   ├── db/                        # Database migrations and schema
│   ├── utils/                     # Shared backend utilities
│   ├── lib/                       # Backend libraries
│   ├── jobs/                      # Scheduled tasks (cron, webhooks)
│   ├── __tests__/                 # Backend unit tests
│   └── uploads/                   # File upload directory
│
├── supabase/                      # Supabase Edge Functions
│   ├── functions/                 # Serverless functions for webhooks, notifications
│   └── functions/_shared/         # Shared utilities for edge functions
│
├── e2e/                           # Playwright end-to-end tests
│
├── vite.config.ts                 # Vite build configuration with code splitting
├── vitest.config.ts               # Vitest unit test configuration
├── tsconfig.json                  # TypeScript compiler options
├── package.json                   # Frontend dependencies
│
└── .planning/
    └── codebase/                  # Architecture documentation (this directory)
```

## Directory Purposes

**src/ (Frontend Root):**
- Purpose: React application source code, UI layer, client-side business logic
- Contains: Components, pages, hooks, contexts, utilities, types
- Key files: `main.tsx` (entry), `App.tsx` (root), pages directory

**src/pages/:**
- Purpose: Route-level page components, each maps to a URL path
- Contains: Index.tsx, Order.tsx, Login.tsx, FrontDesk.tsx, OwnerDashboard.tsx, etc.
- Key files:
  - `Index.tsx` - home page
  - `Order.tsx` - cake order form (largest component, ~1000 lines)
  - `FrontDesk.tsx` - bakery staff dashboard
  - `OwnerDashboard.tsx` - owner analytics and management
  - `Login.tsx`, `Signup.tsx` - auth pages
  - `PaymentCheckout.tsx`, `OrderConfirmation.tsx` - checkout flow

**src/components/:**
- Purpose: Reusable UI components organized by feature domain
- Contains: Subdirectories by feature (ui, dashboard, order, payment, auth, etc.)
- Key subdirectories:
  - `ui/` - Base UI primitives from shadcn (Button, Card, Dialog, Form, etc.)
  - `shared/` - Components used across multiple features (headers, footers, modals)
  - `dashboard/` - Dashboard layout and management components (DashboardLayout, OrderScheduler, etc.)
  - `order/` - Order-specific components (OrderForm, PriceCalculator, etc.)
  - `payment/` - Payment integration (StripePayment, PaymentMethodSelector)
  - `forms/` - Form components (FormField wrappers, input components)
  - `admin/` - Admin-only features
  - `kitchen/` - Kitchen/bakery display components
  - `auth/` - Authentication components (ProtectedRoute, LoginForm)
  - `animations/` - Reusable animations (Framer Motion)

**src/lib/:**
- Purpose: Reusable libraries and utilities for app logic and data fetching
- Contains: API client, queries, validation, state machine, i18n, PWA setup
- Key files:
  - `api.ts`, `api-client.ts` - HTTP client with typed methods, retry logic
  - `supabase.ts` - Supabase client initialization and common queries
  - `queryClient.ts` - React Query client config with queryKeys factory
  - `queries/orders.ts`, `queries/pricing.ts`, etc. - React Query hooks
  - `validation.ts` - Zod schemas and validators for orders, dates, prices
  - `pricing.ts` - Pricing calculation logic
  - `i18n.ts` - i18next configuration
  - `pwa.ts` - Service worker registration
  - `analytics.ts` - Event tracking
  - `square.ts` - Square SDK wrapper
  - `hooks/` - Custom hooks (useOptimizedPricing, useDebounce, etc.)

**src/contexts/:**
- Purpose: App-wide state via React Context
- Contains: AuthContext, LanguageContext
- Key files:
  - `AuthContext.tsx` - Manages user session, login/logout, role checking
  - `LanguageContext.tsx` - Manages language preference (en/es)

**src/hooks/:**
- Purpose: Custom React hooks for component logic
- Contains: Hooks for auth, orders, forms, mobile detection, etc.
- Key files:
  - `useOrdersFeed.ts` - Real-time orders subscription
  - `useOptimizedRealtime.ts` - Supabase realtime with optimizations
  - `useGeolocation.ts` - Browser geolocation
  - `use-mobile.tsx` - Mobile device detection
  - `use-toast.ts` - Toast notifications

**src/types/:**
- Purpose: Shared TypeScript type definitions for frontend and backend
- Contains: Order, Auth, Product, Customer types
- Key files:
  - `order.ts` - Order, OrderStatus, OrderLine types
  - `auth.ts` - AuthUser, UserRole, UserProfile types
  - `index.ts` - Exports all types, API response types

**src/locales/:**
- Purpose: Internationalization translation files
- Contains: Language-specific JSON files
- Key files:
  - `en/translation.json` - English strings
  - `es/translation.json` - Spanish strings

**src/assets/:**
- Purpose: Static images organized by page/feature
- Contains: brand logos, gallery images, product images, etc.
- Key subdirectories: `brand/`, `gallery/`, `products/`, `about/`

**backend/:**
- Purpose: Express.js REST API server
- Contains: Routes, middleware, database utilities, job processing
- Key files: `server.js` (app setup), `package.json` (dependencies)

**backend/routes/:**
- Purpose: API endpoint handlers organized by resource
- Contains: Route files, each handling GET/POST/PATCH/DELETE for a resource
- Key files:
  - `orders.js` - Order CRUD and lifecycle operations
  - `payments.js` - Payment processing (Stripe integration)
  - `products.js` - Product catalog
  - `customers.js` - Customer management
  - `capacity.js` - Available delivery dates and capacity
  - `analytics.js` - Revenue, orders, customer analytics
  - `webhooks.js` - Stripe webhook handling
  - `delivery.js` - Delivery scheduling
  - `inventory.js` - Inventory management

**backend/middleware/:**
- Purpose: Express middleware for cross-cutting concerns
- Contains: Auth validation, input validation, rate limiting, CORS, error handling
- Key files:
  - `auth.js` - JWT verification, user extraction
  - `validation.js` - Request body/params validation
  - `rateLimit.js` - Rate limiting for API endpoints
  - `cors.js` - CORS policy configuration
  - `errorHandler.js` - Global error handling

**backend/db/:**
- Purpose: Database schema and migration management
- Contains: SQL migration files
- Key files: Migration files in `migrations/` subdirectory

**supabase/functions/:**
- Purpose: Serverless Edge Functions for webhooks and notifications
- Contains: Functions triggered by Supabase events or webhooks
- Key files:
  - `create-payment-intent/index.ts` - Stripe payment intent creation
  - `send-order-confirmation/index.ts` - Email on order creation
  - `send-status-update/index.ts` - Customer notification on status change
  - `send-ready-notification/index.ts` - Notify customer order is ready
  - `send-cancelled-notification/index.ts` - Cancellation email

**e2e/:**
- Purpose: End-to-end tests using Playwright
- Contains: Test scenarios for full user flows
- Examples: Order creation flow, payment flow, dashboard operations

## Key File Locations

**Entry Points:**

| File | Purpose |
|------|---------|
| `src/main.tsx` | React app entry point, mounts to #root |
| `src/App.tsx` | Root component, providers, routing |
| `backend/server.js` | Express server setup, middleware registration |
| `public/index.html` | HTML template with #root div |

**Configuration:**

| File | Purpose |
|------|---------|
| `vite.config.ts` | Build config, alias mapping (@/ → ./src/), code splitting setup |
| `vitest.config.ts` | Unit test runner configuration |
| `tsconfig.app.json` | TypeScript compiler options, path aliases |
| `package.json` | Frontend dependencies and scripts |
| `backend/package.json` | Backend dependencies and scripts |

**Core Logic:**

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Authentication state, session management |
| `src/lib/api.ts` | Typed API methods for all endpoints |
| `src/lib/queryClient.ts` | React Query config, queryKeys factory |
| `src/lib/validation.ts` | Zod schemas for order validation |
| `backend/middleware/auth.js` | JWT validation for protected routes |
| `backend/utils/response.js` | Standard response formatting |

**Testing:**

| File | Purpose |
|------|---------|
| `src/__tests__/` | Frontend unit tests |
| `backend/__tests__/` | Backend unit tests |
| `e2e/` | End-to-end test specs |

## Naming Conventions

**Files:**

- **Components:** PascalCase (Button.tsx, OrderForm.tsx, DashboardLayout.tsx)
- **Utility functions:** camelCase (formatPrice.ts, validateOrder.ts, debounce.ts)
- **Hooks:** camelCase with "use" prefix (useOrders.ts, useAuth.ts, useGeolocation.ts)
- **Contexts:** PascalCase + "Context" suffix (AuthContext.tsx, LanguageContext.tsx)
- **Types:** PascalCase, interfaces usually have uppercase (Order, UserProfile, ApiResponse)
- **Test files:** Same name as source + .test.ts or .spec.ts suffix (Order.test.tsx)

**Directories:**

- **Feature directories:** lowercase (dashboard, order, payment, auth, components/shared)
- **Page directory:** lowercase (pages)
- **Library directory:** lowercase (lib)
- **Type directory:** lowercase (types)

**React Components:**

- Named exports for main component (not default)
- Example: `export const OrderForm = () => {...}`
- subcomponents in same file or separate files in parent directory

**API Methods:**

- Verb-noun pattern: `getOrders()`, `createOrder()`, `updateOrderStatus()`, `deleteOrder()`
- Async functions return Promise<T>

## Where to Add New Code

**New Feature (e.g., New Order Type):**

1. **Type definitions:** Add to `src/types/order.ts` or new type file
2. **Primary code:**
   - Component: `src/components/{feature}/NewFeatureComponent.tsx`
   - Page: `src/pages/NewFeaturePage.tsx`
   - Hooks: `src/hooks/useNewFeature.ts`
3. **Tests:** `src/__tests__/{feature}/NewFeature.test.tsx`
4. **API integration:** Add to `src/lib/api.ts` and `src/lib/queries/orders.ts`
5. **Backend:** New route in `backend/routes/newfeature.js`, register in `backend/server.js`

**New Component (UI/Feature):**

1. **Location:** `src/components/{featureCategory}/NewComponent.tsx`
2. **Base components:** Import from `src/components/ui/` (Button, Card, Dialog, etc.)
3. **Styling:** Use Tailwind CSS classes, follow existing component patterns
4. **Props:** Define TypeScript interface, use React.FC<Props>
5. **Test:** Create `src/components/{featureCategory}/NewComponent.test.tsx`

**New Utility/Library:**

- **Generic utility:** `src/utils/newUtility.ts`
- **Domain-specific library:** `src/lib/newLibrary.ts`
- **Custom hook:** `src/hooks/useNewHook.ts` or `src/lib/hooks/useNewHook.ts`
- **API integration:** Methods in `src/lib/api.ts`

**New Database Operations:**

1. **Type:** Add to `src/types/order.ts` or appropriate type file
2. **React Query hook:** Add to `src/lib/queries/{entity}.ts`
3. **Backend route:** Create/update `backend/routes/{entity}.js`
4. **Validation:** Add to `backend/middleware/validation.js`
5. **Database migration:** Add SQL to `backend/db/migrations/`
6. **Supabase function:** If webhook needed, add to `supabase/functions/{operation}/`

**New Page:**

1. **File:** Create `src/pages/NewPage.tsx`
2. **Route:** Add to routes in `src/App.tsx` with lazy loading
3. **Layout:** Wrap in DashboardLayout or PageLayout if needed
4. **Protection:** Wrap in ProtectedRoute if auth required

## Special Directories

**src/__tests__/:**
- Purpose: Frontend test files mirroring src structure
- Generated: No (manually written)
- Committed: Yes
- Organization: `__tests__/{feature}/*.test.tsx`

**backend/uploads/:**
- Purpose: Store uploaded files (images, documents)
- Generated: Yes (created by upload handler)
- Committed: No (should be in .gitignore)
- Files: Reference images for orders, product images

**dist/, dev-dist/:**
- Purpose: Built output from Vite build and dev server
- Generated: Yes (by vite build and vite dev)
- Committed: No
- Contents: Bundle-split JS chunks, CSS, assets

**node_modules/:**
- Purpose: Installed npm packages
- Generated: Yes (by npm install)
- Committed: No (only package-lock.json committed)

**supabase/.temp/:**
- Purpose: Supabase CLI local development temp files
- Generated: Yes (by supabase-cli)
- Committed: No

**logs/:**
- Purpose: Application log files
- Generated: Yes (by backend server)
- Committed: No

