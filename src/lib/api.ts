/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, STORAGE_BUCKET, isSupabaseConfigured } from './supabase';
import { UserProfile } from '@/types/auth';
import { getAvailableTransitions as getStateMachineTransitions, validateTransition, type OrderStatus, type UserRole } from './orderStateMachine';
import type { OrderNote } from '@/types/order';

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


    // Return DB orders only - Single Source of Truth
    // Removed strict 'paid' filter so Owner/Admin can see pending payment orders too
    const allOrders = dbOrders
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

    // Use Secure RPC for public order lookup
    const { data, error } = await sb.rpc('get_public_order', { p_order_number: orderNumber });

    if (error) {
      console.error(`Error fetching order by number ${orderNumber}:`, error);
      throw error;
    }

    // RPC returns the object directly or null
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

    // Use Secure RPC for public order creation
    const { data, error } = await sb.rpc('create_new_order', { payload: orderPayload });

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }

    // RPC returns the created order object
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

  async getAllProducts() {
    const sb = this.ensureSupabase();
    if (sb) {
      const { data, error } = await sb.from('products').select('*').order('category').order('name_en');
      if (error) throw error;
      return data || [];
    }
    return MOCK_PRODUCTS;
  }

  async createProduct(productData: any) {
    const sb = this.ensureSupabase();
    const { data, error } = await sb.from('products').insert(productData).select().single();
    if (error) throw error;
    return data;
  }

  async updateProduct(id: number, productData: any) {
    const sb = this.ensureSupabase();
    const { data, error } = await sb.from('products').update(productData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteProduct(id: number) {
    const sb = this.ensureSupabase();
    const { error } = await sb.from('products').update({ is_active: false }).eq('id', id);
    if (error) throw error;
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


    // --- Return DB Metrics Only ---
    return {
      todayOrders: dbMetrics.todayOrders,
      todayRevenue: dbMetrics.todayRevenue,
      pendingOrders: dbMetrics.pendingOrders,
      capacityUtilization: 0.5, // TODO: Implement real capacity logic
      averageOrderValue: (dbMetrics.todayRevenue) / (dbMetrics.todayOrders || 1),
      totalCustomers: 0, // Placeholder
      lowStockItems: 0,
      todayDeliveries: 0
    };

  }

  // Fallback / Stubbed Methods to keep TypeScript happy until fully implemented


  async getRevenueByPeriod(startDate: string, endDate: string) {
    const sb = this.ensureSupabase();
    let dbOrders: any[] = [];
    if (sb) {
      const { data } = await sb.from('orders')
        .select('created_at, total_amount')
        .gte('created_at', startDate)
        .lte('created_at', `${endDate}T23:59:59`);
      dbOrders = data || [];
    }

    // Group by date
    const grouped = dbOrders.reduce((acc: any, order) => {
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

  async getPopularItems() {
    const sb = this.ensureSupabase();
    if (!sb) return [];

    // Attempt to query order_items or similar if it exists
    // Since we don't have the exact schema for items, we'll try a common pattern
    // or return a safe default if the table query fails.
    try {
      // Assuming 'order_items' table exists with product_name or similar
      const { data, error } = await sb
        .from('order_items')
        .select('name, quantity, price')
        .limit(100);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const itemStats: Record<string, { count: number, revenue: number }> = {};

      data.forEach((item: any) => {
        const name = item.name || 'Unknown Item';
        if (!itemStats[name]) itemStats[name] = { count: 0, revenue: 0 };
        itemStats[name].count += (item.quantity || 1);
        itemStats[name].revenue += ((item.price || 0) * (item.quantity || 1));
      });

      return Object.entries(itemStats)
        .map(([name, stats]) => ({
          name,
          count: stats.count,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5

    } catch (err) {
      console.warn('Could not fetch popular items (table might not exist yet):', err);
      return [];
    }
  }
  async getOrdersByStatus() {
    const sb = this.ensureSupabase();
    let dbOrders: any[] = [];

    // 1. Fetch from DB
    if (sb) {
      const { data } = await sb.from('orders').select('status, total_amount');
      dbOrders = data || [];
    }

    const totalCount = dbOrders.length;
    if (totalCount === 0) return [];

    // 3. Aggregate
    const stats: Record<string, { count: number, revenue: number }> = {};

    dbOrders.forEach((o: any) => {
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
  async getCapacityUtilization() {
    const sb = this.ensureSupabase();
    if (!sb) return [];

    const today = new Date().toISOString().split('T')[0];

    // Simple utilization: Count pending/confirmed orders for today vs arbitrary capacity
    // In a real app, maxCapacity might come from a settings table
    const MAX_CAPACITY = 20;

    const { count } = await sb
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    const currentOrders = count || 0;
    const utilization = Math.min((currentOrders / MAX_CAPACITY) * 100, 100);

    return [{
      date: today,
      utilization: Math.round(utilization),
      available: Math.max(0, MAX_CAPACITY - currentOrders)
    }];
  }
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

    return dbDeliveries;
  }


  async getLowStockItems() {
    const sb = this.ensureSupabase();
    if (!sb) return [];

    try {
      // Supabase JS doesn't support column-to-column comparison,
      // so fetch all ingredients and filter client-side
      const { data, error } = await sb
        .from('ingredients')
        .select('*')
        .order('name');

      if (error) throw error;

      return (data || []).filter(
        (item: any) => item.quantity <= item.low_stock_threshold
      );
    } catch (e) {
      console.warn('Error fetching low stock items:', e);
      return [];
    }
  }
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

  // --- NOTIFICATIONS ---
  async sendReadyNotification(order: any) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, error: 'Supabase not available' };

    try {
      const { data, error } = await sb.functions.invoke('send-ready-notification', {
        body: { order }
      });

      if (error) {
        console.error('Error sending ready notification:', error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Exception sending notification:', err);
      return { success: false, error: err };
    }
  }

  async sendOrderConfirmation(order: any) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, error: 'Supabase not available' };

    try {
      const { data, error } = await sb.functions.invoke('send-order-confirmation', {
        body: { order }
      });

      if (error) {
        console.error('Error sending confirmation email:', error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Exception sending confirmation email:', err);
      return { success: false, error: err };
    }
  }

  async sendStatusUpdate(order: any, oldStatus: string, newStatus: string) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, error: 'Supabase not available' };

    try {
      // Construct payload expected by Edge Function
      const payload = {
        order: {
          ...order,
          new_status: newStatus,
          // ensure required fields are present if order object is partial
        },
        oldStatus
      };

      const { data, error } = await sb.functions.invoke('send-status-update', {
        body: payload
      });

      if (error) {
        console.error(`Error sending ${newStatus} notification:`, error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err) {
      console.error(`Exception sending ${newStatus} notification:`, err);
      return { success: false, error: err };
    }
  }

  async sendOrderIssueNotification(issue: any) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, error: 'Supabase not available' };

    try {
      const { data, error } = await sb.functions.invoke('send-order-issue-notification', {
        body: { issue }
      });

      if (error) {
        console.error('Error sending issue notification:', error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Exception sending issue notification:', err);
      return { success: false, error: err };
    }
  }

  async sendDailyReport(datePreset?: string) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, error: 'Supabase not available' };

    try {
      const { data, error } = await sb.functions.invoke('send-daily-report', {
        body: { datePreset: datePreset || 'today' }
      });

      if (error) {
        console.error('Error sending daily report:', error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err) {
      console.error('Exception sending daily report:', err);
      return { success: false, error: err };
    }
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
  async getInventory() {
    const sb = this.ensureSupabase();
    if (!sb) return [];

    const { data, error } = await sb
      .from('ingredients')
      .select('*')
      .order('category')
      .order('name');

    if (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
    return data || [];
  }
  async updateIngredient(id: number, quantity: number, notes?: string) {
    const sb = this.ensureSupabase();
    if (!sb) throw new Error('Database not available');

    const { data, error } = await sb
      .from('ingredients')
      .update({
        quantity,
        last_updated: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
  async logIngredientUsage(ingredientId: number, quantityUsed: number, orderId?: number, notes?: string) {
    const sb = this.ensureSupabase();
    if (!sb) throw new Error('Database not available');

    // 1. Log the usage
    const { error: usageError } = await sb
      .from('ingredient_usage')
      .insert({
        ingredient_id: ingredientId,
        quantity_used: quantityUsed,
        order_id: orderId || null,
        notes: notes || null,
      });

    if (usageError) throw usageError;

    // 2. Decrement ingredient quantity
    const { data: current } = await sb
      .from('ingredients')
      .select('quantity')
      .eq('id', ingredientId)
      .single();

    if (current) {
      const newQty = Math.max(0, current.quantity - quantityUsed);
      await sb
        .from('ingredients')
        .update({ quantity: newQty, last_updated: new Date().toISOString() })
        .eq('id', ingredientId);
    }

    return { success: true };
  }
  // --- DELIVERY API ---

  async validateDeliveryAddress(address: string, zipCode: string) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, valid: false, error: 'Database not available' };

    try {
      const { data: zones, error } = await sb
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const matchingZone = (zones || []).find((zone: any) =>
        (zone.zip_codes || []).includes(zipCode)
      );

      return { success: true, valid: !!matchingZone, zone: matchingZone || undefined };
    } catch (err: any) {
      console.error('Error validating delivery address:', err);
      return { success: false, valid: false, error: err.message };
    }
  }

  async calculateDeliveryFee(address: string, zipCode: string) {
    const sb = this.ensureSupabase();
    if (!sb) return { serviceable: false };

    try {
      const { data: zones, error } = await sb
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      const zone = (zones || []).find((z: any) =>
        (z.zip_codes || []).includes(zipCode)
      );

      if (!zone) return { serviceable: false };

      const estimatedDistance = (zone.max_distance_miles || 5) * 0.7;
      const fee = (zone.base_fee || 0) + (estimatedDistance * (zone.per_mile_rate || 0));

      return {
        serviceable: true,
        zone: {
          name: zone.name,
          estimated_delivery_minutes: zone.estimated_delivery_minutes,
        },
        fee: Math.round(fee * 100) / 100,
        distance: Math.round(estimatedDistance * 10) / 10,
      };
    } catch (err: any) {
      console.error('Error calculating delivery fee:', err);
      return { serviceable: false };
    }
  }

  async getDeliveryZones() {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, data: [], error: 'Database not available' };

    try {
      const { data, error } = await sb
        .from('delivery_zones')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error('Error fetching delivery zones:', err);
      return { success: false, data: [], error: err.message };
    }
  }

  async updateDeliveryStatus(orderId: number, status: string, notes?: string) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, error: 'Database not available' };

    try {
      const updates: any = { delivery_status: status, updated_at: new Date().toISOString() };
      if (status === 'delivered') updates.completed_at = new Date().toISOString();
      if (notes) updates.delivery_notes = notes;

      const { error } = await sb.from('orders').update(updates).eq('id', orderId);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error updating delivery status:', err);
      return { success: false, error: err.message };
    }
  }

  async getStaffMembers(): Promise<{ id: string; full_name: string; role: string }[]> {
    const sb = this.ensureSupabase();
    if (!sb) return [];

    try {
      const { data, error } = await sb
        .from('user_profiles')
        .select('user_id, full_name, role')
        .in('role', ['baker', 'owner'])
        .order('full_name');

      if (error) throw error;

      return (data || []).map((p: any) => ({
        id: p.user_id,
        full_name: p.full_name || 'Staff Member',
        role: p.role,
      }));
    } catch (err: any) {
      console.error('Error fetching staff members:', err);
      return [];
    }
  }

  async assignDelivery(orderId: number, driverId: string) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, error: 'Database not available' };

    try {
      const { error: assignError } = await sb
        .from('delivery_assignments')
        .upsert({
          order_id: orderId,
          driver_id: driverId,
          assigned_at: new Date().toISOString(),
        }, { onConflict: 'order_id' });

      if (assignError) throw assignError;

      const { error: orderError } = await sb
        .from('orders')
        .update({ delivery_status: 'assigned', updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (orderError) throw orderError;
      return { success: true };
    } catch (err: any) {
      console.error('Error assigning delivery:', err);
      return { success: false, error: err.message };
    }
  }

  // --- CUSTOMER STUBS (not actively used yet) ---
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

  // --- CANCELLATION API ---

  async getCancellationPolicy(orderId: number, hoursUntilNeeded: number) {
    const sb = this.ensureSupabase();
    if (!sb) return null;

    try {
      const { data, error } = await sb
        .from('cancellation_policies')
        .select('*')
        .lte('hours_before_needed', hoursUntilNeeded)
        .order('hours_before_needed', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching cancellation policy:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error fetching cancellation policy:', err);
      return null;
    }
  }

  async cancelOrder(orderId: number, request: { reason: string; reasonDetails?: string }) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, error: 'Database not available' };

    try {
      const { data: order, error: fetchError } = await sb
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError || !order) return { success: false, error: 'Order not found' };

      if (['cancelled', 'completed'].includes(order.status)) {
        return { success: false, error: `Cannot cancel order with status '${order.status}'` };
      }

      const previousStatus = order.status;

      // Calculate hours until needed for refund policy
      let hoursUntilNeeded = Infinity;
      if (order.date_needed && order.time_needed) {
        const neededDateTime = new Date(`${order.date_needed}T${order.time_needed}`);
        hoursUntilNeeded = Math.max(0, (neededDateTime.getTime() - Date.now()) / (1000 * 60 * 60));
      }

      let refundAmount = 0;
      let refundPercentage = 0;
      const policy = await this.getCancellationPolicy(orderId, hoursUntilNeeded);
      if (policy && order.total_amount) {
        refundPercentage = policy.refund_percentage || 0;
        refundAmount = Math.round((parseFloat(order.total_amount) * refundPercentage / 100) * 100) / 100;
      }

      const { error: updateError } = await sb
        .from('orders')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: request.reason,
          refund_amount: refundAmount || null,
          refund_status: refundAmount > 0 ? 'pending' : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Record status history (non-blocking)
      sb.from('order_status_history').insert({
        order_id: orderId,
        previous_status: previousStatus,
        new_status: 'cancelled',
        reason: request.reason,
        metadata: { reason_details: request.reasonDetails },
      }).then(({ error: histError }) => {
        if (histError) console.error('Error inserting status history:', histError);
      });

      return {
        success: true,
        refund: refundAmount > 0 ? {
          refundAmount,
          refundPercentage,
          refundStatus: 'pending' as const,
        } : undefined,
      };
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      return { success: false, error: err.message };
    }
  }

  async adminCancelOrder(
    orderId: number,
    request: { reason: string; reasonDetails?: string; overrideRefundAmount?: number; adminNotes?: string }
  ) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, error: 'Database not available' };

    try {
      const { data: order, error: fetchError } = await sb
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError || !order) return { success: false, error: 'Order not found' };

      if (order.status === 'cancelled') {
        return { success: false, error: 'Order is already cancelled' };
      }

      const previousStatus = order.status;

      // Calculate refund — admin can override
      let refundAmount = 0;
      let refundPercentage = 0;

      if (request.overrideRefundAmount !== undefined) {
        refundAmount = request.overrideRefundAmount;
        if (order.total_amount) {
          refundPercentage = Math.round((refundAmount / parseFloat(order.total_amount)) * 100);
        }
      } else {
        let hoursUntilNeeded = Infinity;
        if (order.date_needed && order.time_needed) {
          const neededDateTime = new Date(`${order.date_needed}T${order.time_needed}`);
          hoursUntilNeeded = Math.max(0, (neededDateTime.getTime() - Date.now()) / (1000 * 60 * 60));
        }
        const policy = await this.getCancellationPolicy(orderId, hoursUntilNeeded);
        if (policy && order.total_amount) {
          refundPercentage = policy.refund_percentage || 0;
          refundAmount = Math.round((parseFloat(order.total_amount) * refundPercentage / 100) * 100) / 100;
        }
      }

      const { error: updateError } = await sb
        .from('orders')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: request.reason,
          admin_notes: request.adminNotes || null,
          refund_amount: refundAmount || null,
          refund_status: refundAmount > 0 ? 'pending' : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Record status history (non-blocking)
      sb.from('order_status_history').insert({
        order_id: orderId,
        previous_status: previousStatus,
        new_status: 'cancelled',
        reason: request.reason,
        metadata: {
          reason_details: request.reasonDetails,
          admin_notes: request.adminNotes,
          override_refund_amount: request.overrideRefundAmount,
          is_admin_cancellation: true,
        },
      }).then(({ error: histError }) => {
        if (histError) console.error('Error inserting status history:', histError);
      });

      return {
        success: true,
        refund: refundAmount > 0 ? {
          refundAmount,
          refundPercentage,
          refundStatus: 'pending' as const,
        } : undefined,
      };
    } catch (err: any) {
      console.error('Error admin-cancelling order:', err);
      return { success: false, error: err.message };
    }
  }

  // --- ORDER TRANSITIONS API ---

  async getAvailableTransitions(orderId: number) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, transitions: [] as OrderStatus[], error: 'Database not available' };

    try {
      const { data: order, error } = await sb
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error || !order) return { success: false, transitions: [] as OrderStatus[], error: 'Order not found' };

      // Get current user role
      const { data: { user } } = await sb.auth.getUser();
      let userRole: UserRole = 'customer';
      if (user) {
        const { data: profile } = await sb
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        if (profile?.role) userRole = profile.role as UserRole;
      }

      const transitions = getStateMachineTransitions(order.status as OrderStatus, order, userRole);
      return { success: true, transitions };
    } catch (err: any) {
      console.error('Error getting available transitions:', err);
      return { success: false, transitions: [] as OrderStatus[], error: err.message };
    }
  }

  async transitionOrderStatus(orderId: number, newStatus: string, reason?: string) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, error: 'Database not available' };

    try {
      const { data: order, error: fetchError } = await sb
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError || !order) return { success: false, error: 'Order not found' };

      // Get current user
      const { data: { user } } = await sb.auth.getUser();
      let userRole: UserRole = 'customer';
      if (user) {
        const { data: profile } = await sb
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        if (profile?.role) userRole = profile.role as UserRole;
      }

      // Validate transition
      const validation = validateTransition(
        order.status as OrderStatus,
        newStatus as OrderStatus,
        order,
        { orderId, userRole, reason }
      );

      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const previousStatus = order.status;
      const updates: any = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === 'ready') updates.ready_at = new Date().toISOString();
      if (newStatus === 'completed') updates.completed_at = new Date().toISOString();
      if (newStatus === 'cancelled') {
        updates.cancelled_at = new Date().toISOString();
        if (reason) updates.cancellation_reason = reason;
      }

      const { error: updateError } = await sb
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Record status history (non-blocking)
      sb.from('order_status_history').insert({
        order_id: orderId,
        previous_status: previousStatus,
        new_status: newStatus,
        changed_by: user?.id || null,
        reason: reason || null,
      }).then(({ error: histError }) => {
        if (histError) console.error('Error inserting status history:', histError);
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error transitioning order status:', err);
      return { success: false, error: err.message };
    }
  }

  async getTransitionHistory(orderId: number) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, history: [], error: 'Database not available' };

    try {
      const { data, error } = await sb
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { success: true, history: data || [] };
    } catch (err: any) {
      console.error('Error fetching transition history:', err);
      return { success: false, history: [], error: err.message };
    }
  }

  // --- ORDER NOTES API ---

  async getOrderNotes(orderId: number): Promise<{ success: boolean; data: OrderNote[]; error?: string }> {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, data: [], error: 'Database not available' };

    try {
      const { data, error } = await sb
        .from('order_notes')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err: any) {
      console.error('Error fetching order notes:', err);
      return { success: false, data: [], error: err.message };
    }
  }

  async addOrderNote(orderId: number, content: string): Promise<{ success: boolean; data?: OrderNote; error?: string }> {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, error: 'Database not available' };

    try {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const { data: profile } = await sb
        .from('user_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      const authorName = profile?.full_name || user.email || 'Staff';

      const { data, error } = await sb
        .from('order_notes')
        .insert({
          order_id: orderId,
          created_by: user.id,
          author_name: authorName,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      console.error('Error adding order note:', err);
      return { success: false, error: err.message };
    }
  }

  async deleteOrderNote(noteId: number): Promise<{ success: boolean; error?: string }> {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, error: 'Database not available' };

    try {
      const { error } = await sb
        .from('order_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting order note:', err);
      return { success: false, error: err.message };
    }
  }

  async searchOrders(query: string) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, error: 'Database connection not available.' };

    try {
      const { data, error } = await sb
        .from('orders')
        .select('*')
        .or(`id.eq.${query},customer_name.ilike.%${query}%,email.ilike.%${query}%,order_number.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      // If query is not a number, id.eq.${query} might fail in Postgres if id is numeric.
      // We can retry or just log. For now, we assume mixed search might need robust handler or
      // separate text search column.
      console.error('Search order error:', err);
      return { success: false, error: err.message };
    }
  }
  async processRefund(orderId: string, amount?: number) {
    const sb = this.ensureSupabase();
    if (!sb) return { success: false, error: 'Database not available' };

    try {
      const { data: order, error: fetchError } = await sb
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError || !order) return { success: false, error: 'Order not found' };

      const refundAmount = amount || parseFloat(order.total_amount) || 0;

      // Record refund in refunds table (actual Square processing requires server-side)
      const { error: refundError } = await sb
        .from('refunds')
        .insert({
          order_id: orderId,
          amount: refundAmount,
          status: 'pending',
          reason: 'Refund requested',
        });

      if (refundError) {
        // Table may not exist yet — log but continue to update order
        console.warn('Could not insert refund record:', refundError);
      }

      const { error: updateError } = await sb
        .from('orders')
        .update({
          refund_status: 'pending',
          refund_amount: refundAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      return { success: true, message: 'Refund recorded and pending processing' };
    } catch (err: any) {
      console.error('Error processing refund:', err);
      return { success: false, error: err.message };
    }
  }
}

export const api = new ApiClient();
export default api;
