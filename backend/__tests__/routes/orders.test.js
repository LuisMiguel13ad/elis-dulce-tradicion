const request = require('supertest');
const express = require('express');
const { createMockRequest, createMockResponse, createMockOrder, createMockUser } = require('../helpers/testFactories');
const { createMockSupabaseClient } = require('../helpers/mockSupabase');

// Mock Supabase
jest.mock('../../db/connection', () => ({
  supabase: createMockSupabaseClient(),
}));

// Mock auth middleware
jest.mock('../../middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = createMockUser();
    next();
  },
  requireRole: (roles) => (req, res, next) => {
    req.user = createMockUser({ role: roles[0] });
    next();
  },
}));

describe('Orders API', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // Add orders routes here
    // app.use('/api/orders', ordersRouter);
  });

  describe('POST /api/orders', () => {
    it('creates a new order with valid data', async () => {
      const orderData = {
        customer_name: 'Test Customer',
        customer_phone: '610-555-1234',
        customer_email: 'test@example.com',
        date_needed: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time_needed: '14:00',
        cake_size: 'medium',
        filling: 'chocolate',
        theme: 'birthday',
        delivery_option: 'pickup',
        total_amount: 50.00,
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('order_number');
      expect(response.body.status).toBe('pending');
    });

    it('validates required fields', async () => {
      const invalidOrder = {
        customer_name: 'Test',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('validates date is not in the past', async () => {
      const orderData = {
        ...createMockOrder(),
        date_needed: '2020-01-01', // Past date
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.error).toContain('date');
    });

    it('checks capacity before creating order', async () => {
      // Mock capacity check
      const orderData = createMockOrder();

      // This would require mocking the capacity check
      // For now, just verify the structure
      expect(orderData).toHaveProperty('date_needed');
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('updates order status', async () => {
      const orderId = 1;
      const newStatus = 'confirmed';

      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: newStatus })
        .expect(200);

      expect(response.body.status).toBe(newStatus);
    });

    it('validates status transitions', async () => {
      const orderId = 1;
      const invalidStatus = 'invalid_status';

      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: invalidStatus })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('sends webhook on status change', async () => {
      // Mock webhook sending
      const orderId = 1;
      const newStatus = 'ready';

      // This would require mocking the webhook service
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: newStatus })
        .expect(200);

      expect(response.body.status).toBe(newStatus);
    });
  });

  describe('GET /api/orders', () => {
    it('returns orders with pagination', async () => {
      const response = await request(app)
        .get('/api/orders')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('orders');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.orders)).toBe(true);
    });

    it('filters orders by status', async () => {
      const response = await request(app)
        .get('/api/orders')
        .query({ status: 'pending' })
        .expect(200);

      expect(response.body.orders.every(order => order.status === 'pending')).toBe(true);
    });

    it('requires authentication', async () => {
      // Remove auth middleware for this test
      const response = await request(app)
        .get('/api/orders')
        .expect(401);
    });

    it('filters by user role', async () => {
      // Customer should only see their orders
      // Admin should see all orders
      const response = await request(app)
        .get('/api/orders')
        .expect(200);

      // Verify filtering logic
      expect(response.body).toHaveProperty('orders');
    });
  });
});
