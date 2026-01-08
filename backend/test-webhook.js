/**
 * Manual Webhook Test Script
 * Tests if the webhook notification is working correctly
 */

import dotenv from 'dotenv';
import { sendOrderWebhook } from './utils/webhook.js';

// Load environment variables
dotenv.config();

// Create a test order object
const testOrder = {
  id: 999,
  order_number: 'TEST-ORD-' + Date.now(),
  customer_name: 'Test Customer',
  customer_email: 'info@neuroviacreations.com',
  customer_phone: '(610) 279-6200',
  customer_language: 'en',
  date_needed: '2024-12-25',
  time_needed: '14:00',
  cake_size: '8 inch',
  filling: 'Chocolate',
  theme: 'Birthday',
  dedication: 'Happy Birthday Test!',
  delivery_option: 'delivery',
  delivery_address: '324 W Marshall St, Norristown, PA 19401',
  delivery_apartment: 'Suite 100',
  delivery_zone: 'local',
  total_amount: 45.99,
  status: 'pending',
  payment_status: 'paid',
  created_at: new Date().toISOString(),
};

console.log('🧪 Testing Webhook Integration...\n');
console.log('📋 Webhook URL:', process.env.ORDER_WEBHOOK_URL || 'https://n8nlocal.neurovaiagents.uk/webhook-test/order-notifications');
console.log('📦 Test Order:', testOrder.order_number);
console.log('\n⏳ Sending webhook...\n');

// Send the webhook
sendOrderWebhook(testOrder)
  .then((success) => {
    if (success) {
      console.log('\n✅ WEBHOOK TEST PASSED!');
      console.log('Check your n8n dashboard to see if the webhook was received.');
    } else {
      console.log('\n❌ WEBHOOK TEST FAILED!');
      console.log('Check the error messages above.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 WEBHOOK TEST ERROR:', error.message);
    process.exit(1);
  });


