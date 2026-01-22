/**
 * Test Order Seeder - Creates diverse test orders for testing dashboards & calendar
 * Run this in browser console or import in a component
 */

import { toast } from 'sonner';

// Sample image URLs from assets
const TEST_IMAGES = [
  '/src/assets/ButterflyBirthdayCake.jpg',
  '/src/assets/weddingCake.jpg',
  '/src/assets/PawPatrolBirthdayCake.jpg',
  '/src/assets/RealMadridBirthdayCake.jpg',
  '/src/assets/CarBirthdayCake.jpg',
  '/src/assets/GraduationCake.jpg',
  '/src/assets/BabyShowerCake.jpg',
  '/src/assets/AnniversaryCake.jpg',
  '/src/assets/QuinceaneraCake.jpg',
  '/src/assets/ChristmasCake.jpg',
];

// Generate date relative to today
const getDate = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

// Generate dates for this week (Mon-Sun spread)
const getWeekDay = (dayOfWeek: number) => {
  // dayOfWeek: 0=Sunday, 1=Monday, etc.
  const today = new Date();
  const currentDay = today.getDay();
  const diff = dayOfWeek - currentDay;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diff);
  return targetDate.toISOString().split('T')[0];
};

export const TEST_ORDERS = [
  // ============ TODAY'S URGENT ORDERS ============
  // Order 1: DUE IN 2 HOURS - URGENT
  {
    id: 100001,
    order_number: 'ORD-2001',
    customer_name: 'Maria Garcia',
    customer_phone: '+16105551234',
    customer_email: 'maria.garcia@test.com',
    customer_language: 'es',
    date_needed: getDate(0), // TODAY
    time_needed: (() => {
      const now = new Date();
      now.setHours(now.getHours() + 2);
      return `${String(now.getHours()).padStart(2, '0')}:00`;
    })(),
    cake_size: '8" Round',
    filling: 'Tres Leches',
    theme: 'Butterfly Garden Birthday',
    dedication: '¡Feliz Cumpleaños Sofia! 🦋',
    special_instructions: 'Purple and pink butterflies. Edible flowers on top.',
    reference_image_path: TEST_IMAGES[0],
    delivery_option: 'pickup',
    status: 'in_progress',
    payment_status: 'paid',
    total_amount: 45.00,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },

  // Order 2: DUE IN 4 HOURS
  {
    id: 100002,
    order_number: 'ORD-2002',
    customer_name: 'Roberto Sanchez',
    customer_phone: '+16105552345',
    customer_email: 'roberto.s@test.com',
    customer_language: 'es',
    date_needed: getDate(0), // TODAY
    time_needed: (() => {
      const now = new Date();
      now.setHours(now.getHours() + 4);
      return `${String(now.getHours()).padStart(2, '0')}:00`;
    })(),
    cake_size: '1/2 Sheet',
    filling: 'Chocolate Fudge, Dulce de Leche',
    theme: 'Real Madrid Soccer Theme',
    dedication: '¡Felicidades Campeón!',
    special_instructions: 'Include Real Madrid logo. White and gold colors.',
    reference_image_path: TEST_IMAGES[3],
    delivery_option: 'pickup',
    status: 'confirmed',
    payment_status: 'paid',
    total_amount: 75.00,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },

  // Order 3: DUE LATER TODAY
  {
    id: 100003,
    order_number: 'ORD-2003',
    customer_name: 'Linda Thompson',
    customer_phone: '+16105553456',
    customer_email: 'linda.t@test.com',
    customer_language: 'en',
    date_needed: getDate(0), // TODAY
    time_needed: '18:00',
    cake_size: '10" Round',
    filling: 'Red Velvet, Cream Cheese',
    theme: 'Graduation Celebration 2024',
    dedication: 'Congratulations Graduate! 🎓',
    special_instructions: 'Cap and diploma decoration. School colors: blue and gold.',
    reference_image_path: TEST_IMAGES[5],
    delivery_option: 'pickup',
    status: 'confirmed',
    payment_status: 'paid',
    total_amount: 65.00,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },

  // ============ TOMORROW'S ORDERS ============
  // Order 4: Tomorrow morning
  {
    id: 100004,
    order_number: 'ORD-2004',
    customer_name: 'Jennifer & Michael Smith',
    customer_phone: '+16105555678',
    customer_email: 'jmsmith@test.com',
    customer_language: 'en',
    date_needed: getDate(1), // TOMORROW
    time_needed: '10:00',
    cake_size: '12" Round (3 Tier)',
    filling: 'Vanilla Bean, Fresh Strawberry, Champagne',
    theme: 'Elegant White Wedding',
    dedication: 'Jennifer & Michael - Forever Together',
    special_instructions: 'Bride is allergic to nuts. White fondant roses. Gold leaf accents.',
    reference_image_path: TEST_IMAGES[1],
    delivery_option: 'pickup',
    status: 'confirmed',
    payment_status: 'paid',
    total_amount: 285.00,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },

  // Order 5: Tomorrow afternoon
  {
    id: 100005,
    order_number: 'ORD-2005',
    customer_name: 'Carlos Rodriguez',
    customer_phone: '+16105559012',
    customer_email: 'carlos.r@test.com',
    customer_language: 'es',
    date_needed: getDate(1), // TOMORROW
    time_needed: '14:00',
    cake_size: '1/2 Sheet',
    filling: 'Chocolate, Mocha Cream, Oreo Crumble',
    theme: 'Paw Patrol - Chase & Marshall',
    dedication: '¡Felices 5 Años Diego!',
    special_instructions: 'Edible Paw Patrol figurines. Blue and red frosting colors. Paw prints around sides.',
    reference_image_path: TEST_IMAGES[2],
    delivery_option: 'pickup',
    status: 'pending',
    payment_status: 'paid',
    total_amount: 85.00,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },

  // ============ THIS WEEK'S ORDERS ============
  // Order 6: Day after tomorrow
  {
    id: 100006,
    order_number: 'ORD-2006',
    customer_name: 'Emily Watson',
    customer_phone: '+16105556789',
    customer_email: 'emily.w@test.com',
    customer_language: 'en',
    date_needed: getDate(2),
    time_needed: '11:00',
    cake_size: '10" Round',
    filling: 'Lemon, Raspberry, Vanilla',
    theme: 'Baby Shower - Its a Girl!',
    dedication: 'Welcome Baby Emma! 👶',
    special_instructions: 'Pink and white colors. Baby booties and rattle decorations.',
    reference_image_path: TEST_IMAGES[6],
    delivery_option: 'pickup',
    status: 'pending',
    payment_status: 'paid',
    total_amount: 75.00,
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },

  // Order 7: 3 days out
  {
    id: 100007,
    order_number: 'ORD-2007',
    customer_name: 'David Thompson',
    customer_phone: '+16105557890',
    customer_email: 'david.t@test.com',
    customer_language: 'en',
    date_needed: getDate(3),
    time_needed: '15:00',
    cake_size: '10" Round',
    filling: 'Chocolate Chip Cookie Dough, Nutella Swirl',
    theme: 'Race Car Birthday - Lightning McQueen',
    dedication: 'Happy 7th Birthday Tommy! 🏎️',
    special_instructions: 'Red and yellow racing stripes. Number 95 on top. Checkered flag border.',
    reference_image_path: TEST_IMAGES[4],
    delivery_option: 'pickup',
    status: 'pending',
    payment_status: 'paid',
    total_amount: 55.00,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },

  // Order 8: 4 days out
  {
    id: 100008,
    order_number: 'ORD-2008',
    customer_name: 'Rosa Hernandez',
    customer_phone: '+16105553456',
    customer_email: 'rosa.h@test.com',
    customer_language: 'es',
    date_needed: getDate(4),
    time_needed: '12:00',
    cake_size: 'Full Sheet',
    filling: 'Tres Leches, Fresa, Durazno',
    theme: 'Quinceañera Rosa y Dorado',
    dedication: '¡Mis 15 Años - Isabella!',
    special_instructions: 'Gold crown topper. Pink ombre frosting. 15 fondant roses. Tiara decoration.',
    reference_image_path: TEST_IMAGES[8],
    delivery_option: 'pickup',
    status: 'pending',
    payment_status: 'paid',
    total_amount: 185.00,
    created_at: new Date(Date.now() - 432000000).toISOString(),
  },

  // Order 9: 5 days out
  {
    id: 100009,
    order_number: 'ORD-2009',
    customer_name: 'Ana & Pedro Martinez',
    customer_phone: '+16105558901',
    customer_email: 'martinez.family@test.com',
    customer_language: 'es',
    date_needed: getDate(5),
    time_needed: '16:00',
    cake_size: '12" Round (2 Tier)',
    filling: 'Chocolate Ganache, Raspberry, Vanilla Bean',
    theme: '25th Silver Anniversary',
    dedication: '25 Años de Amor - Ana & Pedro 💕',
    special_instructions: 'Silver and white theme. Edible silver roses. "25" topper.',
    reference_image_path: TEST_IMAGES[7],
    delivery_option: 'pickup',
    status: 'pending',
    payment_status: 'paid',
    total_amount: 145.00,
    created_at: new Date(Date.now() - 518400000).toISOString(),
  },

  // Order 10: 6 days out
  {
    id: 100010,
    order_number: 'ORD-2010',
    customer_name: 'The Johnson Family',
    customer_phone: '+16105550123',
    customer_email: 'johnsons@test.com',
    customer_language: 'en',
    date_needed: getDate(6),
    time_needed: '14:00',
    cake_size: 'Full Sheet',
    filling: 'Eggnog, Cinnamon, Vanilla',
    theme: 'Holiday Family Gathering',
    dedication: 'Happy Holidays from the Johnsons! 🎄',
    special_instructions: 'Christmas tree design. Red and green colors. Snowflake decorations. Gold ribbon border.',
    reference_image_path: TEST_IMAGES[9],
    delivery_option: 'pickup',
    status: 'pending',
    payment_status: 'paid',
    total_amount: 125.00,
    created_at: new Date(Date.now() - 604800000).toISOString(),
  },
];

export const PAID_TEST_ORDERS = [
  {
    id: 200001,
    order_number: 'PAY-1001',
    customer_name: 'Stripe Test User 1',
    customer_phone: '555-0101',
    customer_email: 'paid1@test.com',
    date_needed: getDate(0),
    time_needed: '12:00',
    cake_size: '8" Round',
    filling: 'Vanilla',
    theme: 'Test Payment',
    delivery_option: 'pickup',
    status: 'pending',
    payment_status: 'paid',
    stripe_payment_id: 'pi_test_1234567890',
    total_amount: 50.00,
    created_at: new Date().toISOString()
  },
  {
    id: 200002,
    order_number: 'PAY-1002',
    customer_name: 'Stripe Test User 2',
    customer_phone: '555-0102',
    customer_email: 'paid2@test.com',
    date_needed: getDate(0),
    time_needed: '14:00',
    cake_size: '1/4 Sheet',
    filling: 'Chocolate',
    theme: 'Test Payment',
    delivery_option: 'delivery',
    status: 'confirmed',
    payment_status: 'paid',
    stripe_payment_id: 'pi_test_0987654321',
    total_amount: 85.00,
    created_at: new Date().toISOString()
  },
  {
    id: 200003,
    order_number: 'PAY-1003',
    customer_name: 'Stripe Test User 3',
    customer_phone: '555-0103',
    customer_email: 'paid3@test.com',
    date_needed: getDate(1),
    time_needed: '10:00',
    cake_size: '10" Round',
    filling: 'Tres Leches',
    theme: 'Test Payment',
    delivery_option: 'pickup',
    status: 'in_progress',
    payment_status: 'paid',
    stripe_payment_id: 'pi_test_1122334455',
    total_amount: 60.00,
    created_at: new Date().toISOString()
  },
  {
    id: 200004,
    order_number: 'PAY-1004',
    customer_name: 'Stripe Test User 4',
    customer_phone: '555-0104',
    customer_email: 'paid4@test.com',
    date_needed: getDate(1),
    time_needed: '16:00',
    cake_size: 'Full Sheet',
    filling: 'Strawberry',
    theme: 'Test Payment',
    delivery_option: 'delivery',
    status: 'ready',
    payment_status: 'paid',
    stripe_payment_id: 'pi_test_5566778899',
    total_amount: 200.00,
    created_at: new Date().toISOString()
  },
  {
    id: 200005,
    order_number: 'PAY-1005',
    customer_name: 'Stripe Test User 5',
    customer_phone: '555-0105',
    customer_email: 'paid5@test.com',
    date_needed: getDate(2),
    time_needed: '09:00',
    cake_size: 'Cupcakes (12)',
    filling: 'Assorted',
    theme: 'Test Payment',
    delivery_option: 'pickup',
    status: 'pending',
    payment_status: 'paid',
    stripe_payment_id: 'pi_test_9988776655',
    total_amount: 35.00,
    created_at: new Date().toISOString()
  }
];

export function seedPaidTestOrders() {
  const existingOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
  // Filter out previous PAID tests to avoid dupes
  const otherOrders = existingOrders.filter((o: any) => !o.order_number?.startsWith('PAY-'));

  const allOrders = [...otherOrders, ...PAID_TEST_ORDERS];
  localStorage.setItem('mock_orders', JSON.stringify(allOrders));
  window.dispatchEvent(new Event('mock-order-update'));
  toast.success('Seeded 5 Paid Orders!');
  return PAID_TEST_ORDERS;
}

/**
 * Seeds test orders into localStorage
 */
export function seedTestOrders() {
  // Clear existing test orders first
  const existingOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
  const nonTestOrders = existingOrders.filter((o: any) => !o.order_number?.startsWith('ORD-'));

  // Add test orders
  const allOrders = [...TEST_ORDERS, ...nonTestOrders];
  localStorage.setItem('mock_orders', JSON.stringify(allOrders));

  // Dispatch event to notify listeners
  window.dispatchEvent(new Event('mock-order-update'));

  console.log('✅ Seeded 10 test orders successfully!');
  console.log('📅 Orders spread across this week:');
  TEST_ORDERS.forEach(o => {
    console.log(`  ${o.order_number}: ${o.customer_name} - ${o.date_needed} @ ${o.time_needed} [${o.status}]`);
  });

  return TEST_ORDERS;
}

/**
 * Clears all test orders
 */
export function clearTestOrders() {
  const existingOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
  const nonTestOrders = existingOrders.filter((o: any) => !o.order_number?.startsWith('ORD-'));
  localStorage.setItem('mock_orders', JSON.stringify(nonTestOrders));
  window.dispatchEvent(new Event('mock-order-update'));
  console.log('🗑️ Cleared all test orders');
}

/**
 * Gets all orders from localStorage
 */
export function getAllOrders() {
  return JSON.parse(localStorage.getItem('mock_orders') || '[]');
}

/**
 * Gets urgent orders (due within specified hours)
 */
export function getUrgentOrders(withinHours: number = 4) {
  const orders = getAllOrders();
  const now = new Date();

  return orders.filter((order: any) => {
    if (!order.date_needed || !order.time_needed) return false;
    if (order.status === 'ready' || order.status === 'delivered' || order.status === 'completed') return false;

    try {
      const dueDate = new Date(`${order.date_needed}T${order.time_needed}`);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilDue > 0 && hoursUntilDue <= withinHours;
    } catch {
      return false;
    }
  });
}

// Auto-run if called directly in console
if (typeof window !== 'undefined') {
  (window as any).seedTestOrders = seedTestOrders;
  (window as any).clearTestOrders = clearTestOrders;
  (window as any).getAllOrders = getAllOrders;
  (window as any).getUrgentOrders = getUrgentOrders;
}

export default { seedTestOrders, seedPaidTestOrders, clearTestOrders, getAllOrders, getUrgentOrders, TEST_ORDERS, PAID_TEST_ORDERS };
