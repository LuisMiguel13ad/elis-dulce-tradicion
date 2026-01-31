# Codebase Concerns

**Analysis Date:** 2026-01-30

## Tech Debt

**Type Safety - Excessive Use of `any` Type:**
- Issue: Multiple files disable TypeScript strict checking with `@typescript-eslint/no-explicit-any` and cast to `any` throughout the codebase
- Files: `src/pages/Order.tsx`, `src/contexts/AuthContext.tsx`, `src/test/mocks/handlers.ts`, `src/components/order/OrderStatusFlow.tsx`, `src/components/order/OrderFilters.tsx`, `src/hooks/useOrderSearch.ts`, and 35+ more files
- Impact: Loss of type safety, increased runtime errors, difficult refactoring, harder to catch bugs during development. With 396 occurrences of `null|undefined` handling scattered across 102 files, this creates maintenance burden and potential for subtle bugs.
- Fix approach: Incrementally replace `any` casts with proper types. Start with high-risk areas like authentication (`src/contexts/AuthContext.tsx`) and API responses. Use TypeScript strict mode more aggressively.

**Unimplemented Capacity Logic:**
- Issue: Capacity utilization hardcoded to 0.5 with TODO comment
- Files: `src/lib/api.ts` line 311
- Impact: Dashboard metrics show fake data, business owners cannot track actual bakery capacity
- Fix approach: Implement real capacity calculation based on orders per date and bakery configuration

**Incomplete State Machine Transitions:**
- Issue: Order state machine missing transitions to `out_for_delivery` and `delivered` states are not properly integrated in workflow
- Files: `src/lib/orderStateMachine.ts` (defines states but workflow skips delivery tracking), `src/pages/Order.tsx`, `src/components/order/OrderStatusFlow.tsx`
- Impact: Orders jump from `ready` directly to `completed`, no delivery tracking capability, customers cannot see delivery status
- Fix approach: Complete delivery workflow by adding `out_for_delivery` transitions, integrate with delivery provider API or manual tracking

**Test Data Mixed with Production:**
- Issue: Test data generation and localStorage mock data mixed with production code
- Files: `src/test-orders.ts`, `src/utils/generateTestData.ts`, localStorage operations scattered throughout
- Impact: Risk of test data leaking into production, unclear data source in components, difficult to distinguish real orders from test orders
- Fix approach: Move all test utilities behind feature flags or environment checks. Use separate test database/API endpoints

**localStorage Token Management Anti-Pattern:**
- Issue: Direct retrieval of auth tokens from localStorage in components for API calls
- Files: `src/components/order/OrderStatusFlow.tsx` (lines 100, 121, 146), `src/components/order/FilterPanel.tsx`
- Impact: Security risk - tokens exposed in fetch headers without refresh token handling. Token rotation not implemented. Tokens not cleared on logout in some places.
- Fix approach: Move all auth headers to centralized API client. Implement token refresh interceptor. Use secure HTTP-only cookies if possible.

**Placeholder/Simulated Data in Production:**
- Issue: API responses return placeholder or hardcoded data
- Files: `src/lib/api.ts` (totalCustomers: 0, lowStockItems: 0), `src/pages/OwnerDashboard.tsx` (export report simulation with setTimeout)
- Impact: Dashboard metrics are misleading, business logic depends on fake data
- Fix approach: Replace all placeholder values with real database queries. Remove simulated delays and toast messages for operations that should be real

## Known Bugs

**Google Maps Loading Race Condition:**
- Symptoms: Address autocomplete fails silently, suggestions don't load even though Google Maps script is loaded
- Files: `src/components/AddressVerification.tsx` lines 48-55
- Trigger: Navigate to order page with slow network connection, try to auto-complete address immediately
- Workaround: Manual entry fallback exists but may not be obvious to users
- Fix approach: Add loading spinner feedback, implement better timeout handling with retry logic

**Auth Session Timeout Hard-Stop at 4 Seconds:**
- Symptoms: User loading state forces complete in 4 seconds even if profile fetch is still running, incomplete user data loads
- Files: `src/contexts/AuthContext.tsx` lines 31-33, 84-86 (3000ms timeout inside)
- Trigger: Load dashboard with slow Supabase connection
- Workaround: Fallback to partial user object without profile, may cause permission checks to fail
- Fix approach: Use Promise.race more carefully, extend timeout to network conditions, implement exponential backoff

**Order Status Fetch Without Error Boundaries:**
- Symptoms: Status update fails silently if API is unreachable, no user feedback
- Files: `src/components/order/OrderStatusFlow.tsx` lines 94-113, 115-132
- Trigger: Loss of internet connection while status transitions loading
- Workaround: User may retry, but no indication of failure
- Fix approach: Add error UI, implement retry mechanism with exponential backoff

**Missing Order Search Security Check:**
- Symptoms: Comments mention "Security Fix" but validation appears incomplete
- Files: `src/pages/OrderTracking.tsx` lines 40-41 comment says "Security Fix: Fetch ONLY the specific order by number" but implementation unclear
- Trigger: User can enumerate order numbers sequentially to access other customers' orders
- Workaround: None documented
- Fix approach: Implement proper RLS (Row Level Security) in Supabase, validate user permissions server-side before returning order data

## Security Considerations

**Cross-Site Scripting (XSS) Risk - User-Generated Content:**
- Risk: Images uploaded by customers (reference images) rendered without sanitization, reference text could contain malicious input
- Files: `src/components/order/ReferenceImageViewer.tsx`, `src/lib/storage.ts`, image storage handlers
- Current mitigation: Images stored in Supabase bucket, but no content policy verification
- Recommendations: Implement image validation on upload (MIME type, dimensions, file signature). Sanitize user-provided text fields before rendering. Consider Content Security Policy headers.

**Authentication Token Exposure:**
- Risk: Bearer tokens in Authorization headers, tokens visible in network inspector if not using HTTPS
- Files: `src/components/order/OrderStatusFlow.tsx` (multiple API calls with Bearer token), throughout codebase
- Current mitigation: Supabase client handles token refresh, but direct localStorage access is fragile
- Recommendations: Enforce HTTPS only in production. Move to HTTP-only secure cookies. Implement token rotation. Add request signing.

**Unvalidated User Input in Order Details:**
- Risk: Custom order requirements, cake design descriptions not validated for length/SQL injection/script injection
- Files: `src/pages/Order.tsx` (custom text fields), `src/lib/validation.ts` (validates lead time but not content)
- Current mitigation: None visible
- Recommendations: Implement input sanitization using DOMPurify or similar. Server-side validation required for all user inputs. Use parameterized queries.

**Admin Access Not Properly Gated:**
- Risk: Admin dashboard (`src/pages/OwnerDashboard.tsx`) accessible but no role-based access control visible
- Files: `src/pages/OwnerDashboard.tsx`, protected routes rely on `src/components/auth/ProtectedRoute.tsx`
- Current mitigation: ProtectedRoute checks user role
- Recommendations: Verify ProtectedRoute properly checks user.role server-side. Implement rate limiting on admin endpoints. Log admin actions.

## Performance Bottlenecks

**Large Order.tsx Component (974 lines):**
- Problem: Single component handling order form, pricing, validation, file uploads, animations
- Files: `src/pages/Order.tsx`
- Cause: Poor separation of concerns, multiple responsibilities in one component
- Impact: Slow renders, difficult to optimize, bundle size includes entire form even if user navigates away
- Improvement path: Split into smaller components (OrderSizeSelector, FillingSelector, PricingBreakdown, DateTimeSelector, AddressForm). Lazy load image upload component. Implement React.memo on expensive sub-components.

**Debounced localStorage Writes Without Cleanup:**
- Problem: Draft saves trigger on every form change with 1s debounce, but no cleanup on unmount in some components
- Files: `src/pages/Order.tsx` lines 215-227 (good: has cleanup), but similar patterns in `src/components/order/FilterPanel.tsx`
- Impact: Multiple timers running simultaneously, memory leaks on page transitions
- Improvement path: Use custom useDebounce hook that ensures cleanup. Consider using sessionStorage for drafts. Implement max write frequency.

**ImageCompression Called on Every File Change:**
- Problem: Browser image compression invoked for every file selection without chunking or worker thread
- Files: `src/lib/imageCompression.ts`, `src/components/order/ReferenceImageViewer.tsx`
- Impact: Blocks UI thread during compression, noticeable lag on large images
- Improvement path: Move compression to Web Worker, show progress indicator, implement cancel token

**Google Maps Script Loaded on All Pages:**
- Problem: Google Maps API loaded globally even if not needed
- Files: `src/components/AddressVerification.tsx` (loads script on mount), checked in multiple components
- Impact: Unnecessary bandwidth, slower page loads for users who don't need address verification
- Improvement path: Lazy load Google Maps script only when AddressVerification component mounts. Use dynamic import.

**Console Logging in Production (186 occurrences):**
- Problem: console.log/error/warn calls throughout production code not stripped in build
- Files: 54 files contain console statements
- Impact: Performance degradation in production, console clutter, potential security info leak
- Improvement path: Use environment-based logging. Strip console in production build. Implement proper logging service (Sentry, etc.) for errors.

## Fragile Areas

**AuthContext with Complex Timeout Logic:**
- Files: `src/contexts/AuthContext.tsx` lines 29-73
- Why fragile: Multiple competing timeouts (4s hard limit, 3s race condition), clearTimeout calls scattered across conditions, promise race could resolve in unexpected order
- Safe modification: Don't add more timeouts. Refactor to single clear timeout pattern. Add integration tests for edge cases.
- Test coverage: No visible auth timeout tests. Need tests for: slow network, instant connection, simultaneous auth events

**Order State Machine Without Comprehensive Tests:**
- Files: `src/lib/orderStateMachine.ts`, `src/pages/Order.tsx` (state transitions), `src/pages/BakerStation.tsx`
- Why fragile: State transitions can fail silently (API error), UI doesn't always reflect true server state, `canTransition()` logic could get out of sync with actual database rules
- Safe modification: Add comprehensive state transition tests before modifying. Test all role+status combinations. Mock API failures.
- Test coverage: `src/__tests__/orderStateMachine.test.ts` exists but need to verify it covers all 8 states × 3 roles = 24 combinations

**OrderStatusFlow Component - Manual API Calls:**
- Files: `src/components/order/OrderStatusFlow.tsx` lines 94-153
- Why fragile: Direct fetch calls with manual token handling, error handling is minimal (console.error only), loading states not always properly managed
- Safe modification: Replace with api.ts wrapper functions. Add error boundary. Implement optimistic updates.
- Test coverage: No tests visible for this component's API interactions

**AddressVerification - Multiple Fallback Paths:**
- Files: `src/components/AddressVerification.tsx`
- Why fragile: Complex fallback logic between Google Maps API, manual entry, and state management. Many edge cases (user clicks away, Google rejects, etc.)
- Safe modification: Add comprehensive testing for all entry paths. Document user flow clearly.
- Test coverage: Likely low - address verification is complex and behavior may vary by browser

## Scaling Limits

**localStorage Usage Throughout App:**
- Current capacity: Browser quota typically 5-10MB
- Limit: App stores order drafts, filter presets, sort preferences, language choice. Could exceed quota with multiple users/sessions.
- Impact: When limit exceeded, app fails silently in some browsers, localStorage.setItem throws
- Scaling path: Implement IndexedDB for large data, sync to backend, implement quota monitoring

**Hard-Coded Order Time Slots:**
- Current capacity: TIME_OPTIONS array in `src/pages/Order.tsx` has 11 fixed slots (10:00-20:00)
- Limit: Cannot adjust for seasonal hours, special events, or per-product availability
- Impact: Business cannot be flexible with operating hours
- Scaling path: Move time slots to database configuration (`src/lib/cms.ts` can help). Implement capacity-per-timeslot tracking.

**Single API Endpoint Rate Limits:**
- Current capacity: No visible rate limiting or request batching
- Limit: Rapid order page loads could hammer server (validation, capacity checks)
- Impact: Potential DoS vulnerability
- Scaling path: Implement client-side request deduplication. Add API rate limiting middleware. Cache validation results.

**Real-Time Order Updates Without Backpressure:**
- Current capacity: Real-time listeners in `src/hooks/useRealtimeOrders.ts` subscribe to all order changes
- Limit: With 100+ concurrent orders, could overwhelm browser memory
- Impact: Dashboard slows down as order volume increases
- Scaling path: Implement pagination in real-time listeners. Add filtering at subscription level. Implement virtual scrolling (`react-window` already imported).

## Dependencies at Risk

**Stripe.js and Square Payment Integration:**
- Risk: Two separate payment providers integrated, test data uses mocks, production integration not clearly separated
- Files: `src/components/payment/StripeCheckoutForm.tsx`, `src/components/payment/SquarePaymentForm.tsx`, `src/test/mocks/square.ts`
- Impact: Unclear which provider is active, switching providers requires code changes, test data could leak to production
- Migration plan: Consolidate to single provider (recommend Stripe for better ecosystem). Move provider selection to environment config. Implement payment provider abstraction layer.

**React Query (TanStack Query) v5.83:**
- Risk: Major version bump from v4, no visible migration issues but query patterns seem incomplete
- Files: `src/lib/hooks/useOptimizedPricing.ts`, throughout hooks
- Impact: Cache invalidation issues, potential data staleness
- Migration plan: Verify all queries have proper cache keys. Add invalidation on mutations. Use `refetchOnWindowFocus: false` if needed for performance.

**XState v5 with React v18:**
- Risk: Complex state machine library, minimal usage visible (orderStateMachine exists but not heavily utilized)
- Files: `src/lib/orderStateMachine.ts`, `src/types/orderState.ts`
- Impact: Over-engineered state management, maintenance burden if not used consistently
- Migration plan: Either fully commit to xstate for all workflows or remove it. Current hybrid approach (xstate + React hooks) is confusing.

**Google Maps and Google Places API:**
- Risk: Dependency on Google services for address autocomplete, potential breaking changes in API
- Files: `src/components/AddressVerification.tsx`, `src/lib/googleMaps.ts`
- Impact: Address verification broken if Google changes API, fallback is manual entry only
- Migration plan: Consider OpenStreetMap/Nominatim alternative. Implement fallback address provider.

## Missing Critical Features

**No Order Delivery Tracking:**
- Problem: States defined but not used - `out_for_delivery` and `delivered` states exist but workflow doesn't reach them
- Blocks: Customers cannot track delivery, driver location not visible, delivery confirmation missing
- Impact: Poor customer experience, no proof of delivery, disputes on "order received"
- Fix: Implement delivery provider integration or manual status updates from driver app

**No Inventory Management:**
- Problem: lowStockItems returns 0 (placeholder), no stock levels tracked per item/date
- Blocks: Cannot prevent overbooking, no warnings when ingredients running low, menu items always available
- Impact: Cannot fulfill orders, no capacity management
- Fix: Integrate with inventory database, track stock per item per date, auto-disable unavailable items

**No Refund/Return Process:**
- Problem: Cancellation exists but no refund workflow documented or implemented
- Blocks: Cannot process customer refunds, no refund tracking, payment status not fully utilized
- Impact: Lost revenue, customer disputes
- Fix: Implement refund workflow with payment provider integration, track refund status separately from order status

**No Notification/Communication System:**
- Problem: Status changes don't trigger customer notifications
- Files: No email/SMS triggers visible, only in-app toast messages
- Blocks: Customers don't know order status changes, missed pickup notifications
- Impact: High customer support load, missed orders, negative reviews
- Fix: Add order status webhooks, trigger email/SMS on key events, implement notification preferences

## Test Coverage Gaps

**Order Page Component - No Unit Tests:**
- What's not tested: 974-line Order.tsx component (entire form flow, validation, pricing calculations, draft saving)
- Files: `src/pages/Order.tsx` - no corresponding test file
- Risk: Complex pricing logic, validation rules, and state management untested. Refactoring extremely risky.
- Priority: **High** - this is customer-facing critical path

**API Client Methods - Incomplete Testing:**
- What's not tested: `src/lib/api.ts` (515 lines) - no unit tests for API methods, error handling untested
- Files: `src/lib/api.ts` - test mocks exist but no tests of actual api.ts behavior
- Risk: Backend integration issues discovered in production
- Priority: **High** - gateway to all backend communication

**Authentication Flow - Edge Cases Not Tested:**
- What's not tested: Session timeout, token refresh, profile fetch failures, concurrent auth requests
- Files: `src/contexts/AuthContext.tsx` - unit tests in `src/__tests__/frontend/AuthContext.test.tsx` but may not cover timeouts
- Risk: Auth failures in production environments with slow network
- Priority: **High** - blocks all features

**Payment Processing - Mock Only:**
- What's not tested: Real Stripe/Square integration, payment failures, refunds, duplicate charges
- Files: `src/components/payment/SquarePaymentForm.tsx` - mocked in tests only
- Risk: Payment issues only discovered when customers attempt payment
- Priority: **Critical** - revenue impact

**Address Verification - No Coverage:**
- What's not tested: Google Maps autocomplete, fallback to manual entry, validation of address format
- Files: `src/components/AddressVerification.tsx` (551 lines) - no tests
- Risk: Address formatting issues, invalid deliveries, silent failures
- Priority: **High** - impacts delivery success

**OrderStateMachine - Incomplete Coverage:**
- What's not tested: All state transitions with all roles, invalid transitions, concurrent transition attempts
- Files: `src/lib/orderStateMachine.ts`, `src/__tests__/orderStateMachine.test.ts`
- Risk: Invalid state transitions allowed, permissions bypassed
- Priority: **High** - data integrity issue

**E2E Tests - Not Clear:**
- What's not tested: Full user flows (order creation → payment → delivery tracking)
- Files: `src/test-orders.ts` seems to be test data, not actual e2e tests. `test:e2e` npm script references playwright
- Risk: Integration issues between components
- Priority: **Medium** - but essential before production scale

## Recommendations by Priority

**Critical (Fix Before Scale):**
1. Implement proper role-based access control and security checks
2. Fix localStorage token exposure - move to secure HTTP-only cookies
3. Complete payment processing tests with real provider integration
4. Implement delivery tracking workflow (out_for_delivery, delivered states)
5. Add inventory management and capacity checking

**High (Fix This Quarter):**
1. Reduce Order.tsx complexity - split into smaller components
2. Add comprehensive tests for API client, auth flow, address verification
3. Fix Google Maps loading race conditions
4. Replace placeholder data with real queries
5. Implement proper error boundaries throughout app

**Medium (Technical Debt):**
1. Reduce `any` type usage - improve TypeScript strictness
2. Remove console logging from production build
3. Implement centralized API client to replace direct fetch calls
4. Consolidate to single payment provider
5. Implement proper logging/monitoring service

---

*Concerns audit: 2026-01-30*
