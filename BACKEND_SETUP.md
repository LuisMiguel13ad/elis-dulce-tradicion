# Backend Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (can use Supabase or standalone)
- Square Developer Account
- Make.com account

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory with the following:

```env
# Backend Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5174

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/elis_bakery

# Square Payment Configuration
SQUARE_APPLICATION_ID=your_square_application_id
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_LOCATION_ID=your_square_location_id
SQUARE_ENVIRONMENT=sandbox
SQUARE_WEBHOOK_SECRET=your_square_webhook_secret

# Make.com Webhooks
MAKE_COM_WEBHOOK_URL=https://hook.us2.make.com/your_webhook_url
MAKE_COM_WHATSAPP_WEBHOOK=https://hook.us2.make.com/your_whatsapp_webhook_url
```

## Database Setup

1. Create the database:
```bash
createdb elis_bakery
```

2. Run the schema:
```bash
psql elis_bakery < backend/db/schema.sql
```

Or if using Supabase, connect to your Supabase database and run the SQL from `backend/db/schema.sql`.

## Running the Backend

Development mode:
```bash
npm run server:dev
```

Production mode:
```bash
npm run server
```

## Square Webhook Setup

1. In Square Developer Dashboard, go to Webhooks
2. Add webhook endpoint: `https://your-domain.com/api/webhooks/square`
3. Subscribe to events: `payment.created`, `payment.updated`
4. Copy the webhook secret to your `.env` file

## Make.com Setup

Create two scenarios in Make.com:

### Scenario 1: Order Confirmation Email
- Trigger: Webhook (use `MAKE_COM_WEBHOOK_URL`)
- Action: Send email with order details
- Template should include: order number, customer info, cake details, pickup/delivery info

### Scenario 2: Ready for Pickup Notification
- Trigger: Webhook (same URL, different scenario)
- Action: Send email to customer when order is ready
- Include: order number, pickup instructions

### Scenario 3: WhatsApp Bakery Notification (Optional)
- Trigger: Webhook (use `MAKE_COM_WHATSAPP_WEBHOOK`)
- Action: Send WhatsApp message to bakery phone number
- Include: order number, customer name, date/time needed

## API Endpoints

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/number/:orderNumber` - Get order by order number
- `POST /api/orders` - Create order (usually called by webhook)
- `PATCH /api/orders/:id/status` - Update order status

### Payments
- `POST /api/payments/create-checkout` - Create Square checkout session
- `GET /api/payments/square/:paymentId` - Get payment by Square ID
- `GET /api/payments/order/:orderId` - Get payment by order ID

### Webhooks
- `POST /api/webhooks/square` - Square webhook endpoint
- `POST /api/webhooks/make-com/:scenario` - Manual Make.com trigger

## Testing

Test the Square webhook locally using ngrok:
```bash
ngrok http 3001
```

Then use the ngrok URL in Square webhook settings.



