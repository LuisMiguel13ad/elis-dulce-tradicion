# Developer Documentation

Complete guide for developers working on Eli's Bakery Cafe cake order system.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Local Development Setup](#local-development-setup)
3. [Environment Variables](#environment-variables)
4. [Database Schema](#database-schema)
5. [Authentication Flow](#authentication-flow)
6. [Payment Integration](#payment-integration)
7. [API Documentation](#api-documentation)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

## Architecture Overview

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for routing
- Supabase for authentication
- i18next for internationalization

**Backend:**
- Node.js with Express
- PostgreSQL (via Supabase)
- Square API for payments
- Resend for email notifications
- Winston for logging

### System Architecture

```
┌─────────────┐
│   Frontend  │ (React + Vite)
│  Port 5178  │
└──────┬──────┘
       │
       │ HTTP/REST
       │
┌──────▼──────┐
│   Backend   │ (Express + Node.js)
│  Port 3001  │
└──────┬──────┘
       │
       ├──► Supabase (PostgreSQL + Auth)
       ├──► Square API (Payments)
       └──► Resend (Email)
```

### Project Structure

```
├── src/                    # Frontend source
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── lib/              # Utilities and API clients
│   ├── contexts/         # React contexts
│   └── types/            # TypeScript types
├── backend/              # Backend source
│   ├── routes/           # API route handlers
│   ├── middleware/       # Express middleware
│   ├── db/               # Database schemas and migrations
│   └── utils/            # Utility functions
├── e2e/                  # End-to-end tests
└── docs/                 # Documentation
```

## Local Development Setup

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL (or Supabase account)
- Square Developer Account (for payments)
- Git

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd elis-dulce-tradicion
```

### Step 2: Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### Step 3: Environment Setup

Create `.env` file in root directory:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Square
SQUARE_APPLICATION_ID=your_square_app_id
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_LOCATION_ID=your_square_location_id
SQUARE_ENVIRONMENT=sandbox

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# API
VITE_API_URL=http://localhost:3001
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret
ADMIN_API_KEY=your_admin_api_key
```

### Step 4: Database Setup

1. Create Supabase project at https://supabase.com
2. Run migrations from `backend/db/`:
   - `supabase-auth-schema.sql`
   - `schema.sql`
   - `pricing-schema.sql`
   - `delivery-schema-updates.sql`
   - `capacity-inventory-schema.sql`
   - `customer-management-schema.sql`

### Step 5: Run Development Servers

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend
npm run dev
```

Frontend: http://localhost:5178
Backend: http://localhost:3001
API Docs: http://localhost:3001/api-docs

## Environment Variables

### Frontend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key | Optional |

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `SQUARE_APPLICATION_ID` | Square application ID | Yes |
| `SQUARE_ACCESS_TOKEN` | Square access token | Yes |
| `SQUARE_LOCATION_ID` | Square location ID | Yes |
| `SQUARE_ENVIRONMENT` | `sandbox` or `production` | Yes |
| `RESEND_API_KEY` | Resend API key for emails | Yes |
| `PORT` | Server port (default: 3001) | No |
| `NODE_ENV` | `development` or `production` | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `ADMIN_API_KEY` | Admin API key | Yes |

## Database Schema

### Core Tables

**orders**
- Stores all cake orders
- Links to users, payments, and delivery information
- Tracks status through order lifecycle

**payments**
- Payment records from Square
- Links to orders
- Tracks payment status

**products**
- Product catalog (cakes, breads, etc.)
- Bilingual names and descriptions
- Pricing information

**profiles**
- User profiles extending Supabase auth
- Role-based access (customer, baker, owner)
- Customer preferences

**customer_addresses**
- Saved delivery addresses
- Links to user profiles
- Default address support

### Key Relationships

```
users (Supabase Auth)
  └── profiles (1:1)
      └── customer_addresses (1:many)
      └── orders (1:many)
          └── payments (1:1)
          └── order_status_history (1:many)
```

See `backend/db/schema.sql` for complete schema.

## Authentication Flow

### User Authentication

1. User signs up/logs in via Supabase Auth
2. Frontend receives JWT token
3. Token stored in localStorage
4. Token sent in `Authorization: Bearer <token>` header
5. Backend validates token via Supabase

### Role-Based Access

- **customer**: Can view own orders, create orders
- **baker**: Can view all orders, update status
- **owner**: Full access to all features

### API Authentication

Protected endpoints require:
```
Authorization: Bearer <supabase_jwt_token>
```

Public endpoints:
- `GET /api/orders/number/:orderNumber` (order tracking)
- `GET /api/products`
- `POST /api/orders` (order creation)

## Payment Integration

### Square Integration

1. Frontend uses Square Web Payments SDK
2. Customer enters card details
3. Square returns payment token
4. Frontend sends token to backend
5. Backend processes payment via Square API
6. Payment status stored in database

### Payment Flow

```
Customer → Square SDK → Payment Token
    ↓
Frontend → Backend API
    ↓
Backend → Square API → Process Payment
    ↓
Backend → Database → Store Payment Record
    ↓
Backend → Frontend → Confirmation
```

### Webhooks

Square sends webhooks for payment events:
- Payment completed
- Payment failed
- Refund processed

Webhook endpoint: `POST /api/webhooks/square`

## API Documentation

### Base URL

- Development: `http://localhost:3001`
- Production: `https://api.elisdulcetradicion.com`

### API Versioning

All endpoints are prefixed with `/api/v1/`

### Swagger Documentation

Interactive API documentation available at:
- Development: http://localhost:3001/api-docs
- Production: https://api.elisdulcetradicion.com/api-docs

### Postman Collection

Import `postman/Eli_Bakery_API.postman_collection.json` into Postman.

### Common Endpoints

**Orders**
- `GET /api/v1/orders` - List orders
- `GET /api/v1/orders/:id` - Get order
- `POST /api/v1/orders` - Create order
- `PATCH /api/v1/orders/:id/status` - Update status

**Payments**
- `POST /api/v1/payments/create-payment` - Process payment

**Products**
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product

**Health**
- `GET /api/health` - System health check

See Swagger docs for complete API reference.

## Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build frontend:
```bash
npm run build
```

2. Deploy `dist/` folder
3. Set environment variables in hosting platform
4. Configure redirects for SPA routing

### Backend Deployment (Railway/Render)

1. Set environment variables
2. Deploy from `backend/` directory
3. Run database migrations
4. Configure health check endpoint

### Database Migrations

Run migrations in order:
```bash
# Connect to Supabase SQL Editor
# Run each migration file sequentially
```

### Environment Setup

Ensure all environment variables are set in production:
- Supabase credentials
- Square credentials
- Email service credentials
- Security keys

## Testing

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend && npm test

# E2E tests
npm run test:e2e
```

See `TESTING_GUIDE.md` for detailed testing documentation.

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify Supabase credentials
- Check network connectivity
- Verify database migrations ran

**Payment Processing Fails**
- Verify Square credentials
- Check Square environment (sandbox vs production)
- Review Square webhook logs

**Authentication Issues**
- Verify Supabase JWT token
- Check token expiration
- Verify CORS settings

**API Errors**
- Check backend logs: `backend/logs/`
- Verify environment variables
- Check rate limiting

### Logs

- Backend logs: `backend/logs/combined.log`
- Error logs: `backend/logs/error.log`
- Access logs: Check hosting platform logs

### Getting Help

1. Check logs for error messages
2. Review API documentation
3. Check GitHub issues
4. Contact development team

## Additional Resources

- [API Documentation](./docs/API.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Deployment Guide](./PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Square Integration](./backend/SQUARE_SETUP.md)
