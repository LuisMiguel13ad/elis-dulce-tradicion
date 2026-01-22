/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, STORAGE_BUCKET, isSupabaseConfigured } from './supabase';
import { UserProfile } from '@/types/auth';

/**
 * API client for backend communication via Supabase
 */
const MOCK_PRODUCTS = [
  {
    id: 1,
    name_es: 'Pastel de Tres Leches Tradicional',
    name_en: 'Traditional Tres Leches Cake',
    description_es: 'Nuestro famoso pastel de tres leches, esponjoso y perfectamente humedecido con nuestra mezcla secreta.',
    description_en: 'Our famous tres leches cake, moist and perfectly balanced with our secret milk blend.',
    price: 35.00,
    category: 'cakes',
    image_url: '/images/menu/wedding_cake_display_1768064340098.png',
    is_active: true
  },
  {
    id: 2,
    name_es: 'Conchas de Vainilla y Chocolate',
    name_en: 'Vanilla & Chocolate Conchas',
    description_es: 'Pan dulce tradicional con una costra crujiente de azúcar en forma de concha.',
    description_en: 'Traditional sweet bread with a crunchy shell-patterned sugar topping.',
    price: 2.50,
    category: 'bread',
    image_url: '/images/menu/pan_dulce_basket_1768064358293.png',
    is_active: true
  },
  {
    id: 3,
    name_es: 'Pastel de Bodas "Elegancia"',
    name_en: 'Elegance Wedding Cake',
    description_es: 'Diseño multinivel con flores frescas y detalles en oro comestible.',
    description_en: 'Multi-tiered design with fresh flowers and edible gold accents.',
    price: 250.00,
    category: 'cakes',
    image_url: '/images/menu/wedding_cake_display_1768064340098.png',
    is_active: true
  },
  {
    id: 4,
    name_es: 'Surtido de Pan Dulce de Temporada',
    name_en: 'Seasonal Sweet Bread Assortment',
    description_es: 'Una selección de nuestros mejores panes dulces del día, incluyendo orejas y cuernitos.',
    description_en: 'A selection of our best daily sweet breads, including orejas and cuernitos.',
    price: 15.00,
    category: 'bread',
    image_url: '/images/menu/pan_dulce_basket_1768064358293.png',
    is_active: true
  },
  {
    id: 5,
    name_es: 'Tamales de Pollo con Salsa Verde',
    name_en: 'Chicken Tamales with Green Sauce',
    description_es: 'Tamales hechos a mano con masa de maíz fresca y pollo deshebrado en salsa verde.',
    description_en: 'Handmade tamales with fresh corn masa and shredded chicken in green sauce.',
    price: 3.50,
    category: 'other',
    image_url: '/images/menu/dessert_table_spread_1768064377177.png',
    is_active: true
  },
  {
    id: 6,
    name_es: 'Mesa de Postres "Fiesta"',
    name_en: 'Fiesta Dessert Table',
    description_es: 'Servicio completo de mesa de postres para eventos, incluye variedad de mini postres.',
    description_en: 'Full dessert table service for events, includes a variety of mini desserts.',
    price: 450.00,
    category: 'other',
    image_url: '/images/menu/dessert_table_spread_1768064377177.png',
    is_active: true
  }
];

class ApiClient {

  // Helper to ensure Supabase is configured
  private ensureSupabase() {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase not configured or available. Some features will use fallback data.');
      return null;
    }
    return supabase;
  }

  // --- ORDERS API ---

  async getAllOrders() {
    const sb = this.ensureSupabase();
    let dbOrders: any[] = [];

    if (sb) {
      // Fetch all orders
      const { data, error } = await sb
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        dbOrders = data || [];
      }
    }

    // Merge with local storage mock orders (for DevTools support)
    const localOrders = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('mock_orders') || '[]')
      : [];

    // Sort combined list
    const allOrders = [...localOrders, ...dbOrders]
      // Ensure we treat null/undefined payment_status carefully, default to showing if we want to be safe,
      // BUT for this specific requirement: filtering FOR 'paid'.
      // If we remove the server-side filter, we MUST filter here OR let the UI handle it.
      // Given the "No orders found" issue, let's relax this temporarily or verify case sensitivity.
      // Let's filter for "paid" (case insensitive) just to be safe.
      .filter((o: any) => o.payment_status?.toLowerCase() === 'paid')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return allOrders;
  }

  async getOrder(id: string | number) {
    const sb = this.ensureSupabase();
    if (!sb) throw new Error('Database connection not available.');

    const { data, error } = await sb
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }

    return data;
  }

  async getOrderByNumber(orderNumber: string) {
    const sb = this.ensureSupabase();
    if (!sb) throw new Error('Database connection not available.');

    const { data, error } = await sb
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching order by number ${orderNumber}:`, error);
      throw error;
    }

    return data;
  }

  async createOrder(orderData: any) {
    const sb = this.ensureSupabase();
    if (!sb) throw new Error('Database connection not available.');

    // Ensure order_number is generated if not present
    // Ideally this should be a DB trigger or function, but doing client-side for now if not set
    const orderPayload = {
      ...orderData,
      status: orderData.status || 'pending',
      payment_status: orderData.payment_status || 'pending',
      // If user is logged in, supabase rls might handle user_id, but sending it explicit is safe if RLS allows
    };

    const { data, error } = await sb
      .from('orders')
      .insert([orderPayload])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }

    return { success: true, order: data };
  }

  async updateOrderStatus(id: number, status: string, metadata?: any) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, error: 'Database connection not available.' };

    const updates: any = { status, updated_at: new Date().toISOString() };
    if (metadata) {
      // Merge metadata if you have a jsonb column, or handled otherwise
      // For now assuming we just update status
    }

    const { error } = await sb
      .from('orders')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error(`Error updating order ${id} status:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  // Method to check existence of order for idempotency or validation
  async checkOrderExists(orderId: number): Promise<boolean> {
    const sb = this.ensureSupabase();
    if (!sb) return false;
    const { count, error } = await sb
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('id', orderId);

    if (error || count === null) return false;
    return count > 0;
  }


  // --- PRODUCTS / MENU API ---
  // Assuming a 'products' table exists

  async getProducts() {
    const sb = this.ensureSupabase();

    if (sb) {
      const { data, error } = await sb.from('products').select('*').eq('is_active', true);
      if (!error && data && data.length > 0) {
        return data;
      }
      if (error) {
        console.warn('Error fetching products, using mock fallback', error);
      }
    }

    // Return mock products if DB fail or empty
    return MOCK_PRODUCTS;
  }

  // --- FILE UPLOAD ---
  async uploadFile(file: File) {
    const sb = this.ensureSupabase();

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await sb.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    return { url: data.publicUrl };
  }

  // --- ANALYTICS (Real Implementation) ---

  async getDashboardMetrics(dateRange: 'today' | 'week' | 'month') {
    const sb = this.ensureSupabase();
    const now = new Date();
    let startDate = new Date();

    if (dateRange === 'week') startDate.setDate(now.getDate() - 7);
    if (dateRange === 'month') startDate.setMonth(now.getMonth() - 1);

    // Normalize logic for "today"
    const startStr = dateRange === 'today'
      ? new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local
      : startDate.toISOString();

    // --- DB Data ---
    let dbMetrics = {
      todayOrders: 0,
      pendingOrders: 0,
      todayRevenue: 0
    };

    if (sb) {
      // 1. Today's Orders (or range)
      const { count: todayOrders } = await sb
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startStr);

      // 2. Pending Orders
      const { count: pendingOrders } = await sb
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // 3. Revenue
      const { data: revenueData } = await sb
        .from('orders')
        .select('total_amount')
        .gte('created_at', startStr);

      const revenue = revenueData?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;

      dbMetrics = {
        todayOrders: todayOrders || 0,
        pendingOrders: pendingOrders || 0,
        todayRevenue: revenue
      };
    }

    // --- Local Mock Data ---
    const localOrders = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('mock_orders') || '[]')
      : [];

    // Filter local orders matching the criteria
    const relevantLocalOrders = localOrders.filter((o: any) => {
      const orderDate = new Date(o.created_at); // Comparison date
      const filterDate = new Date(startStr); // Start date
      // Simple comparison: is order created after start date?
      // For 'today', check YYYY-MM-DD equality or close enough
      if (dateRange === 'today') {
        return o.created_at && o.created_at.startsWith(startStr);
      }
      return orderDate >= filterDate;
    });

    const localRevenue = relevantLocalOrders.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0);
    const localPending = localOrders.filter((o: any) => o.status === 'pending').length;

    // --- Merge Results ---
    return {
      todayOrders: dbMetrics.todayOrders + relevantLocalOrders.length,
      todayRevenue: dbMetrics.todayRevenue + localRevenue,
      pendingOrders: dbMetrics.pendingOrders + localPending,
      capacityUtilization: 0.5, // TODO: Implement real capacity logic
      averageOrderValue: (dbMetrics.todayRevenue + localRevenue) / ((dbMetrics.todayOrders + relevantLocalOrders.length) || 1),
      totalCustomers: 0, // Placeholder
      lowStockItems: 0,
      todayDeliveries: 0
    };
  }

  // Fallback / Stubbed Methods to keep TypeScript happy until fully implemented

  async getRevenueByPeriod(startDate: string, endDate: string) {
    const sb = this.ensureSupabase();

    // 1. Fetch DB Data
    let dbOrders: any[] = [];
    if (sb) {
      const { data } = await sb.from('orders')
        .select('created_at, total_amount')
        .gte('created_at', startDate)
        .lte('created_at', `${endDate}T23:59:59`);
      dbOrders = data || [];
    }

    // 2. Fetch Local Data
    const localOrders = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('mock_orders') || '[]')
      : [];

    const relevantLocal = localOrders.filter((o: any) => {
      const d = o.created_at?.split('T')[0];
      return d >= startDate && d <= endDate;
    });

    // 3. Merge
    const allOrders = [...dbOrders, ...relevantLocal];

    // Group by date
    const grouped = allOrders.reduce((acc: any, order) => {
      const date = order.created_at.split('T')[0];
      if (!acc[date]) {
        acc[date] = { revenue: 0, count: 0 };
      }
      acc[date].revenue += Number(order.total_amount) || 0;
      acc[date].count += 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, stats]: [string, any]) => ({
      date,
      revenue: stats.revenue,
      orderCount: stats.count,
      avgOrderValue: stats.count > 0 ? stats.revenue / stats.count : 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getPopularItems() { return []; }
  async getOrdersByStatus() {
    const sb = this.ensureSupabase();
    let dbOrders: any[] = [];

    // 1. Fetch from DB
    if (sb) {
      const { data } = await sb.from('orders').select('status, total_amount');
      dbOrders = data || [];
    }

    // 2. Fetch from Local
    const localOrders = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('mock_orders') || '[]')
      : [];

    const allOrders = [...dbOrders, ...localOrders];
    const totalCount = allOrders.length;
    if (totalCount === 0) return [];

    // 3. Aggregate
    const stats: Record<string, { count: number, revenue: number }> = {};

    allOrders.forEach((o: any) => {
      const s = o.status || 'unknown';
      if (!stats[s]) stats[s] = { count: 0, revenue: 0 };
      stats[s].count++;
      stats[s].revenue += Number(o.total_amount) || 0;
    });

    // 4. Format
    return Object.entries(stats).map(([status, data]) => ({
      status,
      count: data.count,
      totalRevenue: data.revenue,
      percentage: (data.count / totalCount) * 100
    })).sort((a, b) => b.count - a.count);
  }
  async getPeakOrderingTimes() { return []; }
  async getCapacityUtilization() { return []; }
  async getAverageOrderValue() { return 0; }
  async getCustomerRetention() { return []; }

  async getTodayDeliveries() {
    const sb = this.ensureSupabase();
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

    // 1. DB
    let dbDeliveries: any[] = [];
    if (sb) {
      const { data } = await sb.from('orders')
        .select('*')
        .eq('delivery_option', 'delivery')
        .eq('date_needed', today);
      dbDeliveries = data || [];
    }

    // 2. Local
    const localOrders = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('mock_orders') || '[]')
      : [];

    const localDeliveries = localOrders.filter((o: any) =>
      o.delivery_option === 'delivery' && o.date_needed === today
    );

    return [...dbDeliveries, ...localDeliveries];
  }

  async getLowStockItems() { return []; }
  async generateDailySalesReport() { return new Blob([''], { type: 'text/csv' }); }
  async generateInventoryReport() { return new Blob([''], { type: 'text/csv' }); }
  async generateCustomerActivityReport() { return new Blob([''], { type: 'text/csv' }); }

  // Payment Stubs
  // --- STRIPE PAYMENTS ---

  async createPaymentIntent(amount: number, metadata?: any) {
    const sb = this.ensureSupabase();
    if (!sb) throw new Error('Supabase not available');

    const { data, error } = await sb.functions.invoke('create-payment-intent', {
      body: {
        amount,
        currency: 'usd',
        metadata
      }
    });

    if (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }

    return data; // { clientSecret, id }
  }

  // Deprecated mocks
  async createCheckout(amount: number) { return { url: '#' }; }
  async createPayment() { return { success: true }; }
  async verifyPayment() { return { verified: true }; }
  async refundPayment() { return { success: true }; }

  async subscribeNewsletter(email: string) {
    const sb = this.ensureSupabase();
    // Assuming a 'newsletter_subscribers' table
    const { error } = await sb.from('newsletter_subscribers').insert([{ email }]);
    if (error) {
      // Ignore duplicate key errors 
      if (error.code !== '23505') throw error;
    }
    return { success: true };
  }

  // Placeholders for other methods to match interface
  async getCurrentPricing() { return { success: true, data: {} }; }
  async calculatePricing() { return { success: true, price: 0 }; }
  async getAvailableDates() { return { success: true, dates: [] }; }
  async getDateCapacity() { return { success: true }; }
  async getBusinessHours() {
    // Return default business hours (8am-8pm every day)
    return [
      { day_of_week: 0, is_closed: false, open_time: '08:00', close_time: '20:00' },
      { day_of_week: 1, is_closed: false, open_time: '08:00', close_time: '20:00' },
      { day_of_week: 2, is_closed: false, open_time: '08:00', close_time: '20:00' },
      { day_of_week: 3, is_closed: false, open_time: '08:00', close_time: '20:00' },
      { day_of_week: 4, is_closed: false, open_time: '08:00', close_time: '20:00' },
      { day_of_week: 5, is_closed: false, open_time: '08:00', close_time: '20:00' },
      { day_of_week: 6, is_closed: false, open_time: '08:00', close_time: '20:00' },
    ];
  }
  async getHolidays() { return { success: true }; }
  async validatePromoCode() { return { success: true, valid: false }; }
  async updatePricing() { return { success: true }; }
  async createPricing() { return { success: true }; }
  async deletePricing() { return { success: true }; }
  async getPriceHistory() { return { success: true, data: [] }; }
  async getCapacityByDate() {
    // Return available capacity by default
    return { available: true, current_orders: 0, max_orders: 10 };
  }
  async setCapacity() { return { success: true }; }
  async checkHoliday() {
    // Return no holiday by default
    return { is_holiday: false, is_closed: false, name: '' };
  }
  async getInventory() { return { success: true, data: [] }; }
  async updateIngredient() { return { success: true }; }
  async logIngredientUsage() { return { success: true }; }
  async validateDeliveryAddress() { return { success: true, valid: true }; }
  async calculateDeliveryFee() { return { success: true, fee: 0 }; }
  async getDeliveryZones() { return { success: true, data: [] }; }
  async updateDeliveryStatus() { return { success: true }; }
  async assignDelivery() { return { success: true }; }
  async getCustomerProfile() { return { success: true, data: {} }; }
  async getCustomerOrders() { return { success: true, data: [] }; }
  async getCustomerAddresses() { return { success: true, data: [] }; }
  async createCustomerAddress() { return { success: true }; }
  async updateCustomerAddress() { return { success: true }; }
  async deleteCustomerAddress() { return { success: true }; }
  async updateCustomerPreferences() { return { success: true }; }
  async reorderOrder() { return { success: true }; }
  async getAttributes() { return { success: true, data: {} }; }
  async checkCapacity() { return { success: true, available: true }; }
  async getBakerTicket() { return { success: true, data: {} }; }
  async getCancellationPolicy() { return { success: true, policy: {} }; }
  async cancelOrder() { return { success: true }; }
  async adminCancelOrder() { return { success: true }; }
  async getAvailableTransitions() { return { success: true, transitions: [] }; }
  async transitionOrderStatus() { return { success: true }; }
  async getTransitionHistory() { return { success: true, history: [] }; }
  async searchOrders() { return { success: true, data: [] }; }
  async processRefund() { return { success: true }; }
}

export const api = new ApiClient();
export default api;
