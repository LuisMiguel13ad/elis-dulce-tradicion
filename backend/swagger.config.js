import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "Eli's Bakery Cafe API",
      version: '1.0.0',
      description: 'Comprehensive API documentation for the cake order system',
      contact: {
        name: 'API Support',
        email: 'support@elisdulcetradicion.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.elisdulcetradicion.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from Supabase Auth',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Error code',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  description: 'Human-readable error message',
                  example: 'Invalid input data',
                },
                details: {
                  type: 'object',
                  description: 'Additional error details',
                },
              },
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            order_number: { type: 'string', example: 'ORD-2024-001' },
            user_id: { type: 'string', format: 'uuid', nullable: true },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'in_progress', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled'],
              example: 'pending',
            },
            customer_name: { type: 'string', example: 'John Doe' },
            customer_phone: { type: 'string', example: '610-555-1234' },
            customer_email: { type: 'string', format: 'email', example: 'customer@example.com' },
            customer_language: { type: 'string', enum: ['en', 'es'], example: 'en' },
            date_needed: { type: 'string', format: 'date', example: '2024-12-25' },
            time_needed: { type: 'string', format: 'time', example: '14:00' },
            cake_size: { type: 'string', example: 'medium' },
            filling: { type: 'string', example: 'chocolate' },
            theme: { type: 'string', example: 'birthday' },
            dedication: { type: 'string', nullable: true, example: 'Happy Birthday!' },
            delivery_option: { type: 'string', enum: ['pickup', 'delivery'], example: 'pickup' },
            delivery_address: { type: 'string', nullable: true },
            delivery_apartment: { type: 'string', nullable: true },
            delivery_zip_code: { type: 'string', nullable: true },
            total_amount: { type: 'number', format: 'float', example: 50.00 },
            payment_status: { type: 'string', enum: ['pending', 'completed', 'failed', 'refunded'], example: 'pending' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'pay_123' },
            order_id: { type: 'integer', example: 1 },
            amount: { type: 'number', format: 'float', example: 50.00 },
            currency: { type: 'string', example: 'USD' },
            status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELED'], example: 'COMPLETED' },
            payment_method: { type: 'string', example: 'card' },
            square_payment_id: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name_es: { type: 'string', example: 'Pastel de Chocolate' },
            name_en: { type: 'string', example: 'Chocolate Cake' },
            description_es: { type: 'string', nullable: true },
            description_en: { type: 'string', nullable: true },
            price: { type: 'number', format: 'float', example: 45.99 },
            category: { type: 'string', example: 'cakes' },
            image_url: { type: 'string', nullable: true },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Orders', description: 'Order management endpoints' },
      { name: 'Payments', description: 'Payment processing endpoints' },
      { name: 'Products', description: 'Product catalog endpoints' },
      { name: 'Pricing', description: 'Pricing calculation endpoints' },
      { name: 'Capacity', description: 'Capacity and availability endpoints' },
      { name: 'Delivery', description: 'Delivery management endpoints' },
      { name: 'Customers', description: 'Customer management endpoints' },
      { name: 'Analytics', description: 'Analytics and reporting endpoints' },
      { name: 'Inventory', description: 'Inventory management endpoints' },
      { name: 'Webhooks', description: 'Webhook endpoints' },
      { name: 'Health', description: 'System health check endpoints' },
    ],
  },
  apis: [
    join(__dirname, 'routes/**/*.js'),
    join(__dirname, 'server.js'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
