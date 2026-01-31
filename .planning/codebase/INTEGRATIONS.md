# External Integrations

**Analysis Date:** 2026-01-30

## APIs & External Services

**Payment Processing:**
- Square Web Payments API - Main payment provider
  - SDK/Client: Square SDK (embedded via `https://sandbox.web.squarecdn.com/v1/square.js`)
  - Backend SDK: `square` npm package in `backend/routes/payments.js`
  - Auth: `SQUARE_ACCESS_TOKEN` (backend) and `VITE_SQUARE_APPLICATION_ID` + `VITE_SQUARE_LOCATION_ID` (frontend)
  - Environment: Sandbox or Production via `SQUARE_ENVIRONMENT`
  - Webhook: Square webhooks processed at `/api/webhooks` route
  - Webhook signature verification in `backend/routes/webhooks.js`
  - Supports: Card payments, Google Pay, Apple Pay

**Location & Mapping:**
- Google Maps Distance Matrix API - Calculate delivery distance
  - Implementation: `src/lib/googleMaps.ts` `calculateDistance()` function
  - Auth: `VITE_GOOGLE_MAPS_API_KEY` (frontend only)
  - Endpoint: `https://maps.googleapis.com/maps/api/distancematrix/json`
  - Used for: Calculating distance between bakery and delivery address
  - Fallback: Default 5 miles if API not configured or fails

- Google Maps Geocoding API - Address to coordinates conversion
  - Implementation: `src/lib/googleMaps.ts` `geocodeAddress()` function
  - Auth: Same `VITE_GOOGLE_MAPS_API_KEY`
  - Endpoint: `https://maps.googleapis.com/maps/api/geocode/json`
  - Extracts: Coordinates, postal code, city, state from addresses

- Google Maps Places API - Address validation and autocomplete
  - Implementation: `src/lib/googleMaps.ts` `validateAddress()` function
  - Auth: Same `VITE_GOOGLE_MAPS_API_KEY`
  - Endpoint: `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`
  - Component: `react-places-autocomplete` wrapper for address input

**Web Fonts:**
- Google Fonts API
  - Fonts: Playfair Display (400, 600, 700), Nunito (300, 400, 600, 700)
  - Loaded in `index.html` via `https://fonts.googleapis.com`
  - Connected in `index.html`

## Data Storage

**Databases:**
- PostgreSQL (via Supabase)
  - Connection: `DATABASE_URL` environment variable
  - Connection string format: `postgresql://postgres:password@db.rnszrscxwkdwvvlsihqc.supabase.co:5432/postgres`
  - Client: `pg` npm package (Node.js driver)
  - Pool configuration in `backend/db/connection.js`:
    - Max 20 clients, min 2 clients
    - 30-second idle timeout
    - 10-second statement timeout
    - 30-second query timeout
  - SSL required for Supabase

**File Storage:**
- Supabase Storage - Image and document uploads
  - Used in: `backend/routes/upload.js`
  - Authentication: Via Supabase session with row-level security

**Caching:**
- Browser Cache (Workbox Service Worker)
  - Configured in `vite.config.ts` workbox settings
  - Supabase API: NetworkFirst strategy, 24-hour expiration, max 50 entries
  - Custom API: NetworkFirst strategy, 5-minute expiration, max 100 entries
  - Images: CacheFirst strategy, 30-day expiration, max 100 entries
  - Max file size for caching: 5MB

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (custom OAuth/Session-based)
  - Implementation: `@supabase/supabase-js` client
  - Connection: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
  - User roles: Customer, FrontDesk, Owner
  - Session storage: Supabase manages sessions
  - Backend auth: `backend/middleware/auth.js` validates Supabase tokens
  - Service Role Key: `SUPABASE_SERVICE_ROLE_KEY` for admin operations (elevated permissions)
  - Admin API Key: `ADMIN_API_KEY` for custom admin endpoints

**User Roles:**
- Owner - Full dashboard access (`src/pages/OwnerDashboard`)
- FrontDesk - Order management and customer service (`src/pages/FrontDesk`)
- Customer - Order placement and tracking

## Monitoring & Observability

**Error Tracking:**
- Not detected - No Sentry, LogRocket, or similar configured

**Logs:**
- Console logging throughout:
  - Backend: `console.log()`, `console.error()`, `console.warn()` in `backend/`
  - Frontend: `console` methods in `src/lib/`
  - No centralized logging system detected

**Analytics:**
- Optional analytics endpoint via `VITE_ANALYTICS_ENDPOINT` (not actively configured)
- Web Vitals monitoring via `web-vitals` package (imported but not visible in core app)

## CI/CD & Deployment

**Hosting:**
- Frontend: Vercel (configured via `VERCEL_OIDC_TOKEN` in `.env.local`)
- Backend: Not specified (can be self-hosted Node.js or Vercel serverless)

**CI Pipeline:**
- GitHub Actions (found `.github/` directory reference in build config)
- Tests: `npm run test:frontend`, `npm run test:e2e` via Vitest and Playwright
- Lint: `npm run lint` via ESLint

## Environment Configuration

**Required env vars (Frontend):**
- `VITE_SUPABASE_URL` - Database/auth endpoint
- `VITE_SUPABASE_ANON_KEY` - Public key for anonymous access
- `VITE_SQUARE_APPLICATION_ID` - Square payment app ID
- `VITE_SQUARE_LOCATION_ID` - Square location ID

**Required env vars (Backend):**
- `DATABASE_URL` - PostgreSQL connection
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public key
- `SUPABASE_SERVICE_ROLE_KEY` - Elevated permissions key
- `ADMIN_API_KEY` - Custom auth for admin endpoints
- `SQUARE_ACCESS_TOKEN` - Square API token
- `SQUARE_LOCATION_ID` - Square location
- `SQUARE_WEBHOOK_SECRET` - Webhook verification

**Optional env vars:**
- `VITE_API_URL` - Custom API base URL (defaults to localhost:3001)
- `VITE_GOOGLE_MAPS_API_KEY` - Distance/geocoding API access
- `VITE_SQUARE_ENVIRONMENT` - "sandbox" or "production"
- `VITE_ANALYTICS_ENDPOINT` - Analytics service
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email fallback
- `PORT` - Backend server port

**Secrets location:**
- Development: `.env` and `.env.local` (git-ignored)
- Production: Vercel Environment Variables dashboard (for frontend)
- Backend: Deployed environment or `.env` file on hosting platform

## Webhooks & Callbacks

**Incoming Webhooks:**
- Square Payment Webhooks - `POST /api/webhooks`
  - Route handler: `backend/routes/webhooks.js`
  - Signature verification using HMAC-SHA256
  - Processes payment confirmation, refunds, and transaction events
  - Fallback email notification via Nodemailer (optional, requires SMTP config)
  - Event data stored in PostgreSQL via Supabase

**Outgoing Webhooks:**
- Not detected - Application does not expose outgoing webhook endpoints

**Internal API Endpoints:**
- `/api/orders` - Order CRUD operations
- `/api/payments/create-payment` - Process Square payment
- `/api/products` - Product catalog
- `/api/pricing` - Pricing calculations
- `/api/capacity` - Bakery capacity management
- `/api/inventory` - Inventory tracking
- `/api/delivery` - Delivery address and distance
- `/api/customers` - Customer management
- `/api/analytics` - Business analytics and reports
- `/api/upload` - File upload to Supabase Storage
- `/api/configurator` - Cake customization configuration
- Health check: `GET /health`

## Service Worker & Push Notifications

**Service Worker:**
- Workbox 7.4.0 configuration in `vite.config.ts`
- Auto-updates enabled (`registerType: 'autoUpdate'`)
- Caching strategies defined per URL pattern
- PWA manifest configured

**Push Notifications:**
- VAPID public key configured via `VITE_VAPID_PUBLIC_KEY` (not actively used in visible code)

---

*Integration audit: 2026-01-30*
