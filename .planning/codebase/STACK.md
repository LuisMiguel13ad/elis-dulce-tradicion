# Technology Stack

**Analysis Date:** 2026-01-30

## Languages

**Primary:**
- TypeScript 5.8.3 - Frontend components and utilities in `src/`
- JavaScript (ES Modules) - Node.js backend in `backend/`

**HTML/CSS:**
- HTML5 - Pages in `index.html`
- Tailwind CSS 3.4.17 - Styling throughout the application

## Runtime

**Frontend:**
- Node.js (ES Modules supported) - Required for development
- Browser environment (modern browsers with ES2020+ support)

**Backend:**
- Node.js - `backend/server.js` runs Express server
- PostgreSQL - Database connection via `backend/db/connection.js`

**Package Manager:**
- npm - `package.json` and `package-lock.json`
- Lockfile: Present

## Frameworks

**Core Frontend:**
- React 18.3.1 - UI library (`src/components/`, `src/pages/`)
- React Router DOM 6.30.1 - Routing in `src/main.tsx`
- Vite 5.4.19 - Build tool and dev server

**UI & Components:**
- Radix UI (extensive) - 20+ component libraries (@radix-ui/react-*) for headless UI primitives
- shadcn/ui pattern - Component architecture with Tailwind CSS
- Framer Motion 12.23.24 - Animations
- Embla Carousel React 8.6.0 - Carousel component

**Backend:**
- Express 4.x (implied from `express` import) - HTTP server in `backend/server.js`
- Helmet - Security headers middleware in `backend/server.js`
- Workbox 7.4.0 - Service Worker caching strategy

**State Management:**
- React Hook Form 7.61.1 - Form state and validation
- XState 5.25.0 - Order state machine in `src/lib/orderStateMachine.ts`
- @xstate/react 6.0.0 - React integration for XState

**Data Fetching:**
- @tanstack/react-query 5.83.0 - Server state management and caching
- Supabase JS Client 2.78.0 - Database and auth queries

**Form Validation:**
- Zod 3.25.76 - Schema validation
- @hookform/resolvers 3.10.0 - Hook Form integration

**Testing:**
- Vitest - Unit test runner (configured in `package.json` scripts)
- Playwright - E2E test framework (test:e2e script)

**Build/Dev Tools:**
- @vitejs/plugin-react-swc 3.11.0 - React with SWC compiler
- TypeScript ESLint 8.38.0 - Linting
- ESLint 9.32.0 - Code analysis
- Rollup Plugin Visualizer 6.0.5 - Bundle analysis
- Lovable Tagger 1.1.11 - Component tagging (dev mode)
- Autoprefixer 10.4.21 - CSS vendor prefixes
- PostCSS 8.5.6 - CSS processing
- Vite Bundle Visualizer 1.2.1 - Build analysis

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.78.0 - Database and authentication
  - Used throughout: `src/lib/`, `backend/db/connection.js`
  - Provides PostgreSQL client and user auth

- @tanstack/react-query 5.83.0 - API data fetching and caching
  - Prevents redundant API calls
  - Handles loading/error states

- Zod 3.25.76 - Runtime type validation
  - Validates API responses and form inputs

- React Hook Form 7.61.1 - Form state management
  - Reduces unnecessary re-renders
  - Built-in validation support

**Payments & Transactions:**
- Square SDK - Payment processing via `backend/routes/payments.js`
  - SquareClient configuration in `backend/routes/payments.js`
  - Web Payments SDK loaded in `index.html` from `https://sandbox.web.squarecdn.com/v1/square.js`
  - Square Web Payments utilities in `src/lib/square.ts`

**Location & Maps:**
- @react-google-maps/api 2.20.7 - Google Maps integration
- Google Maps Distance Matrix API - Distance calculation in `src/lib/googleMaps.ts`
- Google Maps Places API - Address validation and geocoding
- react-places-autocomplete 7.3.0 - Address autocomplete

**UI/UX Libraries:**
- Sonner 1.7.4 - Toast notifications
- Recharts 2.15.4 - Charts and graphs for dashboard
- Canvas Confetti 1.9.4 - Celebration animations
- Framer Motion 12.23.24 - Page transitions and animations

**Internationalization:**
- i18next 25.7.2 - Translation framework
- react-i18next 16.5.0 - React integration
- i18next-browser-languagedetector 8.2.0 - Auto language detection

**Utilities:**
- lodash 4.17.21 - Utility functions
- date-fns 3.6.0 - Date manipulation
- Tailwind Merge 2.6.0 - CSS class merging
- clsx 2.1.1 - Conditional CSS classes
- class-variance-authority 0.7.1 - Component variants
- Input OTP 1.4.2 - OTP input fields
- Vaul 0.9.9 - Drawer component

**Progressive Web App:**
- vite-plugin-pwa 1.2.0 - PWA configuration in `vite.config.ts`
- workbox-window 7.4.0 - Service Worker communication
- Web Vitals 5.1.0 - Core Web Vitals monitoring

**Image Handling:**
- browser-image-compression 2.0.2 - Client-side image compression
- react-lazy-load-image-component 1.6.3 - Lazy loading
- react-to-print 3.2.0 - Print functionality

**Other:**
- node-cron 4.2.1 - Scheduled tasks (backend)
- dicons 1.1.7 - Icon library
- lucide-react 0.462.0 - Icon components
- cmdk 1.1.1 - Command palette
- react-window 2.2.3 - Virtual scrolling for large lists
- react-resizable-panels 2.1.9 - Resizable panel layouts
- react-day-picker 8.10.1 - Date picker component

## Configuration

**Environment:**

Frontend environment variables loaded via Vite:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe public key (appears in package but not actively used)
- `VITE_SQUARE_APPLICATION_ID` - Square payment app ID
- `VITE_SQUARE_LOCATION_ID` - Square location ID
- `VITE_SQUARE_ENVIRONMENT` - "sandbox" or "production"
- `VITE_GOOGLE_MAPS_API_KEY` - Optional, for distance calculation
- `VITE_API_URL` - Backend API base URL (defaults to `http://localhost:3001`)
- `VITE_ANALYTICS_ENDPOINT` - Optional analytics endpoint
- `VITE_VAPID_PUBLIC_KEY` - Push notification key

Backend environment variables in `backend/.env`:
- `DATABASE_URL` - PostgreSQL connection string to Supabase
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role (elevated permissions)
- `ADMIN_API_KEY` - Custom API key for admin endpoints
- `SQUARE_ACCESS_TOKEN` - Square API token for backend payment processing
- `SQUARE_LOCATION_ID` - Square location ID
- `SQUARE_ENVIRONMENT` - "sandbox" or "production"
- `SQUARE_WEBHOOK_SECRET` - Webhook signature verification
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration (fallback)
- `PORT` - Server port (defaults to 3001)

**Build Configuration:**
- `vite.config.ts` - Main Vite config with:
  - Dev server on port 5178
  - Manual code splitting: react-vendor, ui-vendor, query-vendor, supabase-vendor, i18n-vendor, motion-vendor
  - Feature-based chunks: dashboard, order
  - PWA configuration with Workbox caching strategies
  - Service Worker caching for Supabase, API, and images
  - Component tagging in dev mode
  - Bundle visualization in analyze mode

- `tsconfig.json` - TypeScript configuration:
  - Path alias: `@/*` → `./src/*`
  - Lenient: noImplicitAny: false, strictNullChecks: false

- `tsconfig.app.json` - App-specific TypeScript config
- `tsconfig.node.json` - Node/build tool TypeScript config

## Platform Requirements

**Development:**
- Node.js 18+ (ES Modules support)
- npm 8+
- Modern code editor (VS Code recommended)
- Vite dev server runs on `http://localhost:5178`

**Production:**
- Node.js 18+ for backend
- PostgreSQL database (via Supabase)
- Square Merchant Account (for payments)
- Supabase project with authentication enabled
- Google Maps API key (optional, for delivery distance calculation)
- SMTP credentials (optional, for email fallback)

**Deployment Target:**
- Frontend: Vercel (configured with `VERCEL_OIDC_TOKEN` in `.env.local`)
- Backend: Can run on any Node.js-compatible host or Vercel serverless
- Database: Hosted on Supabase (PostgreSQL)

---

*Stack analysis: 2026-01-30*
