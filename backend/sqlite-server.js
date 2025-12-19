import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔧 Environment check:');
console.log(`   SQUARE_ACCESS_TOKEN: ${process.env.SQUARE_ACCESS_TOKEN ? '✅ Loaded' : '❌ Missing'}`);
console.log(`   SQUARE_LOCATION_ID: ${process.env.SQUARE_LOCATION_ID ? '✅ Loaded' : '❌ Missing'}`);
console.log(`   SQUARE_ENVIRONMENT: ${process.env.SQUARE_ENVIRONMENT || 'Not set'}`);
console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
console.log(`   RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL || 'Not set'}`);

import ordersRouter from './routes/orders-sqlite.js';
import paymentsRouter from './routes/payments-sqlite.js';
import uploadRouter from './routes/upload.js';
import productsRouter from './routes/products.js';
import newsletterRouter from './routes/newsletter.js';
import configuratorRouter from './routes/configurator.js';

const app = express();
const PORT = 3001;

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:4567', 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'SQLite',
    message: 'Backend running with SQLite database'
  });
});

// API routes
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/products', productsRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/configurator', configuratorRouter);

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🎂 ============================================');
  console.log('   ELI\'S BAKERY - FULL BACKEND SERVER');
  console.log('   ============================================');
  console.log(`   ✅ Server running at http://localhost:${PORT}`);
  console.log(`   ✅ Health check: http://localhost:${PORT}/health`);
  console.log(`   ✅ Frontend: http://localhost:5174`);
  console.log(`   ✅ Dashboard: http://localhost:5174/bakery-dashboard`);
  console.log('   ============================================');
  console.log('   📊 Database: SQLite (bakery.db)');
  console.log('   📦 Test orders loaded');
  console.log('   🔧 All endpoints active');
  console.log('   ============================================');
  console.log('\n   📋 Available endpoints:');
  console.log('   - GET  /api/orders');
  console.log('   - POST /api/orders');
  console.log('   - GET  /api/orders/:id');
  console.log('   - PATCH /api/orders/:id/status');
  console.log('   - POST /api/payments/create-checkout');
  console.log('   - POST /api/newsletter/subscribe');
  console.log('   ============================================\n');
});

