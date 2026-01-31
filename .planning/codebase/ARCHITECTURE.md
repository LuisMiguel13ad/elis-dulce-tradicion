# Architecture

**Analysis Date:** 2026-01-30

## Pattern Overview

**Overall:** Layered client-server architecture with React frontend, Node.js/Express backend, and Supabase for authentication & database.

**Key Characteristics:**
- Separation of concerns: UI layer (React), business logic layer (contexts + hooks), API layer (fetch/React Query)
- Component-driven UI with shadcn/ui design system
- Typed API contracts via TypeScript interfaces in `src/types/`
- React Query for server state management with optimized caching
- Supabase for auth, PostgreSQL database, and storage
- Express backend for REST API with middleware-based request processing

## Layers

**Presentation (React Components):**
- Purpose: Render UI, handle user interactions, collect form data
- Location: `src/components/` and `src/pages/`
- Contains: Page components, feature components, shared UI components, hooks
- Depends on: Contexts, custom hooks, UI libraries, utilities
- Used by: React Router, App.tsx

**Business Logic (Contexts + Hooks):**
- Purpose: Manage application state (auth, language, data fetching), coordinate business operations
- Location: `src/contexts/`, `src/hooks/`, `src/lib/`
- Contains: AuthContext (authentication state), LanguageContext (i18n), React Query hooks, custom domain logic
- Depends on: API client, Supabase SDK, React Query
- Used by: Components via React hooks

**API Integration Layer:**
- Purpose: Abstract HTTP communication and provide typed methods for backend interaction
- Location: `src/lib/api.ts`, `src/lib/api-client.ts`
- Contains: Typed request/response interfaces, API endpoints, error handling, retry logic
- Depends on: Fetch API, environment configuration
- Used by: React Query hooks, components

**Backend API (Express):**
- Purpose: Handle business logic, database operations, external service integration
- Location: `backend/routes/`, `backend/middleware/`, `backend/utils/`
- Contains: Route handlers, validation, authentication, rate limiting, error handling
- Depends on: PostgreSQL (via Supabase), Stripe SDK, Node libraries
- Used by: Frontend via HTTP calls

**Data Storage:**
- Purpose: Persist application data and support auth
- Location: Supabase (PostgreSQL) + local storage for drafts
- Contains: Orders, products, customers, user profiles, inventory
- Used by: Backend API, frontend (via Supabase RLS policies)

## Data Flow

**Order Creation Flow:**

1. User fills out `Order.tsx` form with cake configuration
2. Form data stored locally in localStorage (draft) via `STORAGE_KEY = 'bakery_order_draft'`
3. User submits → validation via `validateOrderDateTimeComplete()` from `src/lib/validation.ts`
4. `useCreateOrder()` mutation called from `src/lib/queries/orders.ts`
5. Mutation calls `api.createOrder(orderData)` from `src/lib/api.ts`
6. API client POSTs to `/api/v1/orders` on backend
7. Backend route handler in `backend/routes/orders.js` validates request via `validateOrder` middleware
8. Handler calls Supabase API to insert into `orders` table
9. Response returned to frontend
10. React Query invalidates order cache via `queryClient.invalidateQueries()`
11. Component navigates to confirmation page
12. Order details fetched and displayed

**Authentication Flow:**

1. User navigates to login at `src/pages/Login.tsx`
2. Credentials submitted through login form
3. `AuthContext.tsx` `signIn()` method called
4. Calls Supabase `auth.signInWithPassword()` - handled by Supabase Auth
5. On success, Supabase returns session with JWT
6. `AuthContext` fetches user profile from `user_profiles` table
7. User object stored in context state
8. Protected routes in `App.tsx` check `hasRole()` to determine access
9. Subsequent API requests include JWT token from `getAuthToken()` in api-client

**Real-time Order Updates:**

1. Bakery dashboard (`src/pages/FrontDesk.tsx`) subscribes to order changes
2. Uses `useOptimizedRealtime()` hook to listen for Supabase realtime updates
3. Supabase emits changes on `orders` table insert/update/delete
4. Hook updates React state, components re-render with new data
5. WebSocket connection maintained by Supabase client

**State Management:**

- **Global State:** Authentication (AuthContext), Language preference (LanguageContext)
- **Server State:** Orders, products, pricing via React Query (queryClient in `src/lib/queryClient.ts`)
- **Local State:** Form inputs, UI toggles, component-level data in useState
- **Persistent Local State:** Order draft in localStorage, auth session in Supabase storage

## Key Abstractions

**ApiClient:**
- Purpose: Centralized HTTP request handler with retry logic, auth token injection, error normalization
- Examples: `src/lib/api-client.ts`, `src/lib/api.ts`
- Pattern: Singleton client with typed methods per endpoint, automatic bearer token addition

**React Query Hooks:**
- Purpose: Encapsulate data fetching, caching, and cache invalidation for each entity
- Examples: `src/lib/queries/orders.ts`, `src/lib/queries/pricing.ts`
- Pattern: Custom hooks wrapping useQuery/useMutation, consistent queryKey structure for cache invalidation

**Contexts:**
- Purpose: Provide app-wide state without prop drilling
- Examples: `src/contexts/AuthContext.tsx`, `src/contexts/LanguageContext.tsx`
- Pattern: createContext + Provider component wrapping app, useContext hooks to consume

**Validation Layer:**
- Purpose: Centralize business rule validation (order dates, pricing, lead times)
- Examples: `src/lib/validation.ts` (frontend), `backend/middleware/validation.js` (backend)
- Pattern: Reusable validators called from components and routes

**Supabase Integration:**
- Purpose: Abstract Supabase client initialization and common queries
- Examples: `src/lib/supabase.ts`
- Pattern: Single client instance exported, typed functions for common operations (getUserProfile, updateUserProfile)

## Entry Points

**Frontend:**
- Location: `src/main.tsx`
- Triggers: Browser loads index.html
- Responsibilities: Mount React app, initialize performance monitoring, i18n setup

**App Root:**
- Location: `src/App.tsx`
- Triggers: React renders root component
- Responsibilities: Set up providers (QueryClientProvider, AuthProvider, LanguageProvider, ThemeProvider), define routes, lazy load pages

**Page Routes:**
- Location: `src/pages/*.tsx`
- Triggers: React Router navigates to path
- Responsibilities: Render page layout, coordinate data fetching, handle page-specific logic

**Backend Server:**
- Location: `backend/server.js`
- Triggers: `npm run server` or Node process starts
- Responsibilities: Initialize Express app, load middleware, register route handlers, start listening on PORT

**Backend Routes:**
- Location: `backend/routes/*.js`
- Triggers: HTTP request matches route pattern
- Responsibilities: Parse request, validate input, call database/external APIs, return response

## Error Handling

**Strategy:** Multi-level error catching with user-friendly toast notifications and graceful degradation

**Patterns:**

- **API Client:** `src/lib/api-client.ts` wraps fetch calls in try-catch, normalizes errors to ApiError interface with code + message
- **Components:** Components wrap query/mutation in error boundaries, display error toast via `toast.error()` from sonner library
- **Forms:** Validation errors shown inline via react-hook-form error display
- **Backend:** Express error handler middleware `backend/middleware/errorHandler.js` catches unhandled errors, returns consistent {success: false, error: {...}} response
- **Database:** Supabase errors caught and logged, RPC calls validate data before returning

**Example Error Flow:**
1. API call fails in mutation
2. React Query catches error, passes to onError handler
3. Component displays toast: `toast.error("Failed to create order")`
4. User can retry or navigate away

## Cross-Cutting Concerns

**Logging:**
- Frontend: Console logging in development, minimal in production
- Backend: Structured logging via Node logger (if configured), request/response logging in middleware
- Performance: Web Vitals tracked via `src/lib/performance.ts` and sent to analytics

**Validation:**
- Frontend: Zod schemas in components and react-hook-form integration
- Backend: Middleware validators (`backend/middleware/validation.js`) run before handlers
- Database: PostgreSQL constraints and Supabase RLS policies enforce data integrity

**Authentication:**
- Frontend: Supabase JWT stored in localStorage, injected into API requests via `getAuthToken()` in api-client
- Backend: `requireAuth` middleware checks bearer token, validates JWT, attaches user to request
- Routes: Protected routes use `ProtectedRoute` component checking `hasRole()`

**Rate Limiting:**
- Backend: `generalLimiter` and `orderCreationLimiter` middleware from `backend/middleware/rateLimit.js`
- Applied globally and per-endpoint as needed

**CORS:**
- Frontend: Requests to backend via axios/fetch from localhost/production domains
- Backend: `backend/middleware/cors.js` whitelist frontend origins, handle preflight

**Internationalization:**
- Frontend: i18next configuration in `src/lib/i18n.ts`, translations in `src/locales/{en,es}/`
- Components: Use `useLanguage()` hook to get `t()` translation function
- Strings: All user-facing text keyed in translation files

**Performance:**
- Code splitting: Routes lazy loaded via React.lazy(), Vite manual chunks configured in `vite.config.ts`
- Caching: React Query stale times configured in `queryKeys` (5 min for pricing, 30 sec for orders)
- Images: Compression via `src/lib/imageCompression.ts`, lazy loading via `react-lazy-load-image-component`
- PWA: Service worker via `vite-plugin-pwa`, offline support, runtime caching strategies

