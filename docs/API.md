# API Documentation

Complete API reference for Eli's Bakery Cafe cake order system.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://api.elisdulcetradicion.com`

## API Versioning

All endpoints are versioned with `/api/v1/` prefix. Legacy routes without version prefix are still supported but deprecated.

**Version Header (Optional):**
```
X-API-Version: 1.0
```

## Authentication

Most endpoints require authentication via JWT token from Supabase Auth.

**Header:**
```
Authorization: Bearer <supabase_jwt_token>
```

**Getting a Token:**
1. Sign up/login via Supabase Auth
2. Extract `access_token` from session
3. Include in `Authorization` header

## Rate Limiting

- **General**: 100 requests per 15 minutes per IP
- **Order Creation**: 10 requests per hour per IP
- **Headers**: Rate limit info in response headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

## Endpoints

### Health Check

#### GET /api/health

Check system health and service status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0",
  "uptime": 3600,
  "services": {
    "database": {
      "status": "connected",
      "responseTime": 12
    },
    "supabase": {
      "status": "configured"
    },
    "square": {
      "status": "configured",
      "environment": "sandbox"
    }
  }
}
```

### Orders

#### GET /api/v1/orders

Get all orders with optional filtering.

**Authentication:** Required

**Query Parameters:**
- `status` (string, optional): Filter by status
- `limit` (integer, optional): Max results (default: 50, max: 100)
- `offset` (integer, optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_number": "ORD-2024-001",
      "status": "pending",
      "customer_name": "John Doe",
      "total_amount": 50.00
    }
  ]
}
```

#### GET /api/v1/orders/:id

Get order by ID.

**Authentication:** Required (users can only access their own orders unless admin)

#### GET /api/v1/orders/number/:orderNumber

Get order by order number (public endpoint for tracking).

**Authentication:** Not required

#### POST /api/v1/orders

Create a new order.

**Authentication:** Not required (rate limited)

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_phone": "610-555-1234",
  "customer_email": "customer@example.com",
  "customer_language": "en",
  "date_needed": "2024-12-25",
  "time_needed": "14:00",
  "cake_size": "medium",
  "filling": "chocolate",
  "theme": "birthday",
  "dedication": "Happy Birthday!",
  "delivery_option": "pickup",
  "delivery_address": "123 Main St",
  "delivery_apartment": "Apt 4B",
  "delivery_zip_code": "19020",
  "total_amount": 50.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "ORD-2024-001",
    "status": "pending"
  }
}
```

#### PATCH /api/v1/orders/:id/status

Update order status.

**Authentication:** Required (admin/baker only)

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Order confirmed by admin"
}
```

### Payments

#### POST /api/v1/payments/create-payment

Process payment via Square.

**Authentication:** Not required (rate limited)

**Request Body:**
```json
{
  "sourceId": "card_token_123",
  "amount": 50.00,
  "orderData": {
    "order_id": 1
  },
  "idempotencyKey": "unique_key_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pay_123",
    "status": "COMPLETED",
    "square_payment_id": "square_pay_123"
  }
}
```

### Products

#### GET /api/v1/products

Get all products.

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name_es": "Pastel de Chocolate",
      "name_en": "Chocolate Cake",
      "price": 45.99,
      "category": "cakes"
    }
  ]
}
```

#### POST /api/v1/products

Create product (admin only).

**Authentication:** Required (admin only)

### Pricing

#### POST /api/v1/pricing/calculate

Calculate order price.

**Authentication:** Not required

**Request Body:**
```json
{
  "size": "medium",
  "filling": "chocolate",
  "theme": "birthday",
  "deliveryOption": "pickup"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "basePrice": 50,
    "fillingCost": 5,
    "themeCost": 10,
    "deliveryFee": 0,
    "tax": 0,
    "subtotal": 65,
    "discount": 0,
    "total": 65
  }
}
```

### Capacity

#### GET /api/v1/capacity/available-dates

Get available dates for orders.

**Query Parameters:**
- `days` (integer, optional): Number of days ahead (default: 90)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-12-25",
      "available": true,
      "current_orders": 2,
      "max_orders": 10,
      "reason": ""
    }
  ]
}
```

## Interactive Documentation

For complete interactive API documentation, visit:
- **Development**: http://localhost:3001/api-docs
- **Production**: https://api.elisdulcetradicion.com/api-docs

## Postman Collection

Import the Postman collection from `postman/Eli_Bakery_API.postman_collection.json` for easy API testing.

## TypeScript Client

Use the provided TypeScript client library:

```typescript
import { apiClient } from '@/lib/api-client';

// Get orders
const response = await apiClient.getOrders({ status: 'pending' });

// Create order
const order = await apiClient.createOrder({
  customer_name: 'John Doe',
  // ... other fields
});
```

See `src/lib/api-client.ts` for complete API client documentation.
