import type { Order } from '@/types/order';

export const createMockUser = (overrides = {}) => ({
  id: 'user_123',
  email: 'test@example.com',
  profile: {
    id: 'user_123',
    role: 'customer' as const,
    full_name: 'Test User',
    phone: '610-555-1234',
    preferred_language: 'en',
    ...overrides,
  },
});

export const createMockOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 1,
  order_number: 'ORD-2024-001',
  status: 'pending',
  customer_name: 'Test Customer',
  customer_phone: '610-555-1234',
  customer_language: 'en',
  date_needed: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  time_needed: '14:00',
  cake_size: 'medium',
  filling: 'chocolate',
  theme: 'birthday',
  dedication: 'Happy Birthday!',
  delivery_option: 'pickup',
  total_amount: 50.00,
  payment_status: 'pending',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockPricingBreakdown = (overrides = {}) => ({
  basePrice: 50,
  fillingCost: 5,
  themeCost: 10,
  deliveryFee: 15,
  tax: 0,
  subtotal: 80,
  discount: 0,
  total: 80,
  ...overrides,
});

export const createMockProduct = (overrides = {}) => ({
  id: 1,
  name_es: 'Pastel de Chocolate',
  name_en: 'Chocolate Cake',
  description_es: 'Delicioso pastel de chocolate',
  description_en: 'Delicious chocolate cake',
  price: 45.99,
  category: 'cakes',
  image_url: null,
  ...overrides,
});

export const createMockAddress = (overrides = {}) => ({
  id: 1,
  address: '123 Main St',
  apartment: 'Apt 4B',
  zip_code: '19020',
  city: 'Bensalem',
  state: 'PA',
  is_default: true,
  ...overrides,
});
