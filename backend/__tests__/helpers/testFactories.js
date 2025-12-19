/**
 * Test data factories for creating mock objects
 */

const createMockUser = (overrides = {}) => ({
  id: 'user_123',
  email: 'test@example.com',
  role: 'customer',
  full_name: 'Test User',
  phone: '610-555-1234',
  preferred_language: 'en',
  created_at: new Date().toISOString(),
  ...overrides,
});

const createMockOrder = (overrides = {}) => ({
  id: 1,
  order_number: 'ORD-2024-001',
  user_id: 'user_123',
  status: 'pending',
  customer_name: 'Test Customer',
  customer_phone: '610-555-1234',
  customer_email: 'customer@example.com',
  customer_language: 'en',
  date_needed: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  time_needed: '14:00',
  cake_size: 'medium',
  filling: 'chocolate',
  theme: 'birthday',
  dedication: 'Happy Birthday!',
  delivery_option: 'pickup',
  delivery_address: null,
  delivery_apartment: null,
  delivery_zip_code: null,
  total_amount: 50.00,
  payment_status: 'pending',
  payment_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

const createMockProduct = (overrides = {}) => ({
  id: 1,
  name_es: 'Pastel de Chocolate',
  name_en: 'Chocolate Cake',
  description_es: 'Delicioso pastel de chocolate',
  description_en: 'Delicious chocolate cake',
  price: 45.99,
  category: 'cakes',
  image_url: null,
  is_available: true,
  created_at: new Date().toISOString(),
  ...overrides,
});

const createMockPayment = (overrides = {}) => ({
  id: 'pay_123',
  order_id: 1,
  amount: 50.00,
  currency: 'USD',
  status: 'COMPLETED',
  payment_method: 'card',
  square_payment_id: 'square_pay_123',
  created_at: new Date().toISOString(),
  ...overrides,
});

const createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  ...overrides,
});

const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis(),
  };
  return res;
};

const createMockNext = () => jest.fn();

module.exports = {
  createMockUser,
  createMockOrder,
  createMockProduct,
  createMockPayment,
  createMockRequest,
  createMockResponse,
  createMockNext,
};
