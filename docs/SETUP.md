# Setup Guide

Complete step-by-step guide to set up the Eli's Bakery Cafe application for local development and production deployment.

## Prerequisites

Before you begin, ensure you have the following installed and configured:

### Required Software

- **Node.js** version 18.20.8 or higher
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
- **npm** or **yarn** package manager
  - npm comes with Node.js
  - Verify installation: `npm --version`
- **Git** for version control
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`
- **Code Editor** (VS Code recommended)
  - Download from [code.visualstudio.com](https://code.visualstudio.com/)
  - Recommended extensions:
    - ESLint
    - Prettier
    - TypeScript and JavaScript Language Features
    - Tailwind CSS IntelliSense

### Required Accounts & API Keys

1. **Supabase Account** (Free tier sufficient for development)
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Square Developer Account**
   - Sign up at [developer.squareup.com](https://developer.squareup.com)
   - Create a sandbox application
   - Get sandbox application ID and access token
   - Configure webhook endpoints

3. **Google Maps API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable **Places API** and **Geocoding API**
   - Create API key with restrictions (recommended)

4. **Email Service** (Choose one)
   - **Resend** (Recommended): Sign up at [resend.com](https://resend.com)
   - **SendGrid**: Sign up at [sendgrid.com](https://sendgrid.com)
   - Get API key

5. **Make.com Webhook** (Optional, for automation)
   - Sign up at [make.com](https://make.com)
   - Create webhook URL for order notifications

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd elis-dulce-tradicion
```

### Step 2: Install Dependencies

#### Frontend Dependencies

```bash
npm install
```

This will install all frontend dependencies including:
- React and React Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- TanStack Query
- And more...

#### Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 3: Environment Variables Setup

#### Frontend Environment Variables

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Fill in the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Square Payment Configuration
VITE_SQUARE_APPLICATION_ID=sandbox-sq0idb-xxxxx

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Backend API URL
VITE_BACKEND_URL=http://localhost:3001

# Environment
VITE_NODE_ENV=development
```

#### Backend Environment Variables

Create `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Fill in the following variables:

```env
# Database Configuration (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Service role key, NOT anon key

# Square Payment Configuration
SQUARE_ACCESS_TOKEN=EAAAlxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SQUARE_LOCATION_ID=Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SQUARE_WEBHOOK_SIGNATURE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Maps API
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Service (Resend or SendGrid)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# OR
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Make.com Webhook (Optional)
MAKE_COM_WEBHOOK_URL=https://hook.integromat.com/xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key-change-in-production-min-32-chars

# Admin API Key (for internal API calls)
ADMIN_API_KEY=bakery-secret-key-123-change-in-production
```

### Step 4: Supabase Project Setup

#### 4.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `elis-bakery-cafe`
   - Database Password: (save this securely)
   - Region: Choose closest to you
4. Wait for project to be created (2-3 minutes)

#### 4.2 Run Database Schema

1. Go to SQL Editor in Supabase dashboard
2. Copy contents of `backend/db/schema.sql` (if exists) or run migrations
3. Execute the SQL to create all tables

Alternatively, run migrations:

```bash
cd backend
npm run migrate
```

#### 4.3 Enable Realtime

1. Go to Database → Replication in Supabase dashboard
2. Enable Realtime for the following tables:
   - `orders`
   - `order_status_history`
   - `payments`

#### 4.4 Set Up Storage Buckets

1. Go to Storage in Supabase dashboard
2. Create bucket: `reference-images`
   - Set to Public
   - Enable file size limit: 5MB
3. Create bucket: `review-images`
   - Set to Public
   - Enable file size limit: 5MB

#### 4.5 Configure Row Level Security (RLS)

RLS policies should be configured in your schema. Verify they exist:

```sql
-- Example: Orders table RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can view their own orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Bakers can view all orders
CREATE POLICY "Bakers can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role IN ('baker', 'owner', 'admin')
    )
  );
```

#### 4.6 Get Project Credentials

1. Go to Project Settings → API
2. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (backend only, never expose to frontend)

### Step 5: Square Sandbox Setup

#### 5.1 Create Application

1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Click "New Application"
3. Fill in:
   - Application Name: `Eli's Bakery Cafe`
   - Environment: Sandbox
4. Click "Create Application"

#### 5.2 Get Credentials

1. In your application, go to "Credentials"
2. Copy:
   - Application ID → `VITE_SQUARE_APPLICATION_ID`
   - Access Token → `SQUARE_ACCESS_TOKEN`
   - Location ID → `SQUARE_LOCATION_ID`

#### 5.3 Configure Webhooks

1. Go to "Webhooks" in Square dashboard
2. Add webhook endpoint: `https://your-backend-url.com/api/webhooks/square`
3. Subscribe to events:
   - `payment.updated`
   - `refund.updated`
4. Copy Webhook Signature Key → `SQUARE_WEBHOOK_SIGNATURE_KEY`

### Step 6: Database Migrations

#### 6.1 Run Initial Migration

```bash
cd backend
npm run migrate
```

This will:
- Create all necessary tables
- Set up indexes
- Configure RLS policies
- Create triggers and functions

#### 6.2 Seed Test Data (Optional)

```bash
cd backend
npm run seed
```

This creates:
- Test users (customer, baker, owner)
- Sample orders
- Test products

### Step 7: Start Development Servers

#### 7.1 Start Backend Server

```bash
cd backend
npm run dev
```

Backend will start on `http://localhost:3001`

Verify it's running:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-09T12:00:00.000Z"
}
```

#### 7.2 Start Frontend Server

In a new terminal:

```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

Open in browser: `http://localhost:5173`

### Step 8: Verify Setup

1. **Health Check**
   - Visit: `http://localhost:3001/api/health`
   - Should return `{"status": "ok"}`

2. **Frontend Loads**
   - Visit: `http://localhost:5173`
   - Should see homepage

3. **Database Connection**
   - Check backend logs for successful database connection
   - No connection errors should appear

4. **Supabase Connection**
   - Check browser console for Supabase connection
   - No authentication errors

## Testing Setup

### Run Frontend Tests

```bash
npm run test
```

### Run Backend Tests

```bash
cd backend
npm run test
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Generate Coverage Report

```bash
npm run test:coverage
```

Coverage reports will be in `coverage/` directory.

## Deployment Guide

### Frontend Deployment (Vercel)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables**
   - Add all `VITE_*` variables from `.env`
   - Use production values:
     - `VITE_SUPABASE_URL` (production project)
     - `VITE_SQUARE_APPLICATION_ID` (production Square app)
     - `VITE_GOOGLE_MAPS_API_KEY` (production key)
     - `VITE_BACKEND_URL` (production backend URL)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Get production URL

5. **Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

### Backend Deployment (Railway)

1. **Create Account**
   - Sign up at [railway.app](https://railway.app)

2. **New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Port: Railway auto-assigns (use `PORT` env var)

4. **Environment Variables**
   - Add all backend environment variables
   - Use production values:
     - `DATABASE_URL` (production Supabase)
     - `SUPABASE_SERVICE_ROLE_KEY` (production)
     - `SQUARE_ACCESS_TOKEN` (production Square)
     - `NODE_ENV=production`
     - `FRONTEND_URL` (your Vercel URL)

5. **Deploy**
   - Railway will automatically deploy on push
   - Get backend URL from Railway dashboard

6. **Update CORS**
   - In backend code, update CORS to allow production frontend URL
   - Or use environment variable: `FRONTEND_URL`

### Backend Deployment (Render)

Alternative to Railway:

1. **Create Account**
   - Sign up at [render.com](https://render.com)

2. **New Web Service**
   - Connect GitHub repository
   - Settings:
     - Name: `elis-bakery-backend`
     - Environment: Node
     - Build Command: `cd backend && npm install`
     - Start Command: `cd backend && npm start`
     - Plan: Free or Starter

3. **Environment Variables**
   - Add all backend environment variables (same as Railway)

4. **Deploy**
   - Render will build and deploy
   - Get backend URL

### Post-Deployment Checklist

- [ ] Update Square webhook URL to production backend
- [ ] Test payment processing in production mode
- [ ] Verify email notifications work
- [ ] Test order creation end-to-end
- [ ] Check CORS settings allow frontend domain
- [ ] Verify SSL certificates (automatic on Vercel/Railway)
- [ ] Set up monitoring and alerts
- [ ] Configure error tracking (Sentry)
- [ ] Test all critical user flows

## Troubleshooting

### Common Issues

#### Backend won't start

**Error**: `Port 3001 already in use`
- Solution: Kill process using port 3001 or change PORT in `.env`

**Error**: `Database connection failed`
- Check `DATABASE_URL` is correct
- Verify Supabase project is active
- Check network firewall allows connections

#### Frontend won't build

**Error**: `Cannot find module`
- Solution: Delete `node_modules` and `package-lock.json`, then `npm install`

**Error**: `Environment variable not found`
- Check `.env` file exists and has all required variables
- Restart dev server after changing `.env`

#### Supabase connection issues

**Error**: `Invalid API key`
- Verify you're using the correct key (anon vs service_role)
- Check key hasn't been rotated

**Error**: `RLS policy violation`
- Check RLS policies are correctly configured
- Verify user has correct role in `user_profiles` table

#### Square payment issues

**Error**: `Invalid access token`
- Verify you're using sandbox token for development
- Check token hasn't expired

**Error**: `Webhook signature verification failed`
- Verify `SQUARE_WEBHOOK_SIGNATURE_KEY` is correct
- Check webhook endpoint is accessible

## Next Steps

After setup is complete:

1. Review [FEATURES.md](./FEATURES.md) for available features
2. Read [DEVELOPER.md](./DEVELOPER.md) for development guidelines
3. Check [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) for security best practices
4. Review [API.md](./API.md) for API documentation

## Support

If you encounter issues:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review error logs in console
3. Check Supabase logs in dashboard
4. Open an issue on GitHub
