const request = require('supertest');
const express = require('express');
const { createMockRequest, createMockResponse, createMockPayment, createMockOrder } = require('../helpers/testFactories');
const { createMockSupabaseClient } = require('../helpers/mockSupabase');

// Mock Square SDK
jest.mock('square', () => ({
  Client: jest.fn(() => ({
    paymentsApi: {
      createPayment: jest.fn().mockResolvedValue({
        result: {
          payment: {
            id: 'square_pay_123',
            status: 'COMPLETED',
            amountMoney: {
              amount: 5000,
              currency: 'USD',
            },
          },
        },
      }),
      getPayment: jest.fn().mockResolvedValue({
        result: {
          payment: {
            id: 'square_pay_123',
            status: 'COMPLETED',
          },
        },
      }),
      cancelPayment: jest.fn().mockResolvedValue({
        result: {
          payment: {
            id: 'square_pay_123',
            status: 'CANCELED',
          },
        },
      }),
    },
  })),
}));

describe('Payments API', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    // Add payments routes here
  });

  describe('POST /api/payments', () => {
    it('processes payment successfully', async () => {
      const paymentData = {
        order_id: 1,
        amount: 50.00,
        source_id: 'card_token_123',
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('COMPLETED');
    });

    it('validates payment amount', async () => {
      const invalidPayment = {
        order_id: 1,
        amount: -10, // Invalid amount
        source_id: 'card_token_123',
      };

      const response = await request(app)
        .post('/api/payments')
        .send(invalidPayment)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('handles Square API errors', async () => {
      // Mock Square API error
      const { Client } = require('square');
      const mockClient = new Client();
      mockClient.paymentsApi.createPayment.mockRejectedValueOnce(
        new Error('Square API error')
      );

      const paymentData = {
        order_id: 1,
        amount: 50.00,
        source_id: 'card_token_123',
      };

      const response = await request(app)
        .post('/api/payments')
        .send(paymentData)
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/payments/refund', () => {
    it('processes refund successfully', async () => {
      const refundData = {
        payment_id: 'pay_123',
        amount: 50.00,
        reason: 'Order cancelled',
      };

      const response = await request(app)
        .post('/api/payments/refund')
        .send(refundData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('COMPLETED');
    });
  });
});
