/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, STORAGE_BUCKET, isSupabaseConfigured } from './supabase';
import { UserProfile } from '@/types/auth';

/**
 * API client for backend communication via Supabase
 */
class ApiClient {

  // Helper to ensure Supabase is configured
  private ensureSupabase() {
    if (!isSupabaseConfigured() || !supabase) {
      console.error('Supabase not configured. Check your environment variables.');
      throw new Error('Database connection not available.');
    }
    return supabase;
  }

  // --- ORDERS API ---

  async getAllOrders() {
    const sb = this.ensureSupabase();

    // Fetch all orders, ordered by creation date descending
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      // Return empty array instead of throwing to prevent UI crash on first load if table is empty/missing
      return [];
    }

    return data || [];
  }

  async getOrder(id: string | number) {
    const sb = this.ensureSupabase();

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

  async createOrder(orderData: any) {
    const sb = this.ensureSupabase();

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
    const { data, error } = await sb.from('products').select('*').eq('is_active', true);
    if (error) {
      console.warn('Error fetching products', error);
      return [];
    }
    return data || [];
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
    // For 'today', startDate is effectively generic start of day?
    // Let's simpler logic:
    const startStr = dateRange === 'today'
      ? new Date().toISOString().split('T')[0] // today YYYY-MM-DD
      : startDate.toISOString();

    // 1. Today's Orders
    const { count: todayOrders } = await sb
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startStr);

    // 2. Pending Orders
    const { count: pendingOrders } = await sb
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // 3. Revenue (Sum total_amount)
    const { data: revenueData } = await sb
      .from('orders')
      .select('total_amount')
      .gte('created_at', startStr);

    const revenue = revenueData?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;

    return {
      todayOrders: todayOrders || 0,
      todayRevenue: revenue,
      pendingOrders: pendingOrders || 0,
      capacityUtilization: 0.5, // TODO: Implement real capacity logic
      averageOrderValue: revenueData && revenueData.length > 0 ? revenue / revenueData.length : 0,
      totalCustomers: 0, // Placeholder
      lowStockItems: 0,
      todayDeliveries: 0
    };
  }

  // Fallback / Stubbed Methods to keep TypeScript happy until fully implemented

  async getRevenueByPeriod(startDate: string, endDate: string) {
    const sb = this.ensureSupabase();
    // Basic group by day implementation using JS client processing (inefficient for large data but works for small scale)
    const { data } = await sb.from('orders')
      .select('created_at, total_amount')
      .gte('created_at', startDate)
      .lte('created_at', `${endDate}T23:59:59`);

    // Group by date
    const grouped = (data || []).reduce((acc: any, order) => {
      const date = order.created_at.split('T')[0];
      if (!acc[date]) acc[date] = 0;
      acc[date] += Number(order.total_amount);
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
  }

  async getPopularItems() { return []; }
  async getOrdersByStatus() { return []; }
  async getPeakOrderingTimes() { return []; }
  async getCapacityUtilization() { return []; }
  async getAverageOrderValue() { return 0; }
  async getCustomerRetention() { return []; }

  async getTodayDeliveries() {
    const sb = this.ensureSupabase();
    const today = new Date().toISOString().split('T')[0];
    const { data } = await sb.from('orders')
      .select('*')
      .eq('delivery_option', 'delivery')
      .eq('date_needed', today);
    return data || [];
  }

  async getLowStockItems() { return []; }
  async generateDailySalesReport() { return new Blob([''], { type: 'text/csv' }); }
  async generateInventoryReport() { return new Blob([''], { type: 'text/csv' }); }
  async generateCustomerActivityReport() { return new Blob([''], { type: 'text/csv' }); }

  // Payment Stubs
  async createCheckout(amount: number, orderData: any, returnUrl?: string) {
    console.log('Using connection to Supabase... but payments need Stripe rewrite.', returnUrl);
    return { url: `${window.location.origin}/order-confirmation?mock=true` };
  }

  async createPayment(paymentData: any) {
    console.log('Mock Payment via Supabase API wrapper', paymentData);
    // In a real app, this would call a Supabase Edge Function to talk to Stripe
    return { success: true, paymentId: 'mock-stripe-id' };
  }

  async verifyPayment(paymentId: string) {
    console.log('Verifying payment', paymentId);
    return { verified: true, orderNumber: 'ORD-MOCK-' + Math.floor(Math.random() * 1000) };
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    console.log('Refund stub', paymentId, amount, reason);
    return { success: true };
  }

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
  async getBusinessHours() { return { success: true }; }
  async getHolidays() { return { success: true }; }
  async validatePromoCode() { return { success: true, valid: false }; }
  async updatePricing() { return { success: true }; }
  async createPricing() { return { success: true }; }
  async deletePricing() { return { success: true }; }
  async getPriceHistory() { return { success: true, data: [] }; }
  async getCapacityByDate() { return { success: true }; }
  async setCapacity() { return { success: true }; }
  async checkHoliday() { return { success: true, isHoliday: false }; }
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
