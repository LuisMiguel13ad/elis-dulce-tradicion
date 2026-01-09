/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY || 'bakery-secret-key-123';

/**
 * API client for backend communication
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get auth token if available (for customer/analytics endpoints)
    let authToken = null;
    try {
      const { supabase } = await import('./supabase');
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        authToken = session?.access_token;
      }
    } catch (error) {
      // Supabase not available, continue without token
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token for specific endpoints or if available for general API calls
    // PRIORITIZE Bearer token for /orders to ensure user context is passed
    if (authToken && (
      endpoint.startsWith('/customers') ||
      endpoint.startsWith('/analytics') ||
      endpoint.startsWith('/reports') ||
      endpoint.startsWith('/orders') || // Include all orders endpoints
      endpoint.startsWith('/products') ||
      endpoint.startsWith('/inventory')
    )) {
      headers['Authorization'] = `Bearer ${authToken}`;
    } else {
      headers['x-api-key'] = ADMIN_API_KEY;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      } catch (e) {
        throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
      }
    }

    return response.json();
  }


  // File Upload API
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
      // Note: we don't set Content-Type here, the browser sets it with the boundary
      // But we DO need to add the auth header manually since we're bypassing this.request()
      headers: {
        'x-api-key': ADMIN_API_KEY,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return response.json();
  }

  // Products API
  async getProducts() {
    return this.request('/products');
  }

  async createProduct(product: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: number, updates: any) {
    return this.request(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(id: number) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // --- ORDERS API ---
  async getAllOrders() {
    try {
      // First try fetching from API
      // const response = await this.request('/orders');
      // return response;

      // Fallback to LocalStorage for testing/demo
      const localOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
      // Sort by date desc
      return localOrders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (e) {
      console.warn('Backend unavailable, using local mock data');
      return JSON.parse(localStorage.getItem('mock_orders') || '[]');
    }
  }

  async getOrder(id: string | number) {
    const orders = await this.getAllOrders();
    return orders.find((o: any) => o.id === Number(id));
  }

  async createOrder(orderData: any) {
    try {
      // LocalStorage Implementation
      const orders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
      const newOrder = {
        ...orderData,
        id: Math.floor(Math.random() * 100000),
        order_number: `ORD-${Math.floor(Math.random() * 9000) + 1000}`,
        status: 'pending', // Default status
        created_at: new Date().toISOString(),
        payment_status: 'paid' // Bypass payment for test
      };

      orders.unshift(newOrder); // Add to beginning
      localStorage.setItem('mock_orders', JSON.stringify(orders));

      // Notify listeners (mocking realtime)
      window.dispatchEvent(new Event('mock-order-update'));

      return { success: true, order: newOrder };
    } catch (e) {
      console.error('Create order error', e);
      throw e;
    }
  }

  async updateOrderStatus(id: number, status: string) {
    const orders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
    const index = orders.findIndex((o: any) => o.id === Number(id));
    if (index !== -1) {
      orders[index].status = status;
      orders[index].updated_at = new Date().toISOString();
      localStorage.setItem('mock_orders', JSON.stringify(orders));
      window.dispatchEvent(new Event('mock-order-update'));
      // Also notify cross-tab
      return { success: true };
    }
    return { success: false };
  }

  // --- TEST SEEDER ---
  async seedTestOrders(imageUrl: string) {
    const orders = [];
    const names = ['Sofia Rodriguez', 'James Smith', 'Maria Garcia', 'David Chen', 'Emma Wilson'];
    const cakes = ['Tres Leches', 'Chocolate Fudge', 'Vanilla Bean', 'Red Velvet', 'Carrot Cake'];
    const statuses = ['pending', 'confirmed', 'in_progress', 'ready', 'delivered'];

    for (let i = 0; i < 5; i++) {
      orders.push({
        id: Math.floor(Math.random() * 100000) + i,
        order_number: `TEST-${Math.floor(Math.random() * 9000) + 1000}`,
        customer_name: names[i],
        customer_phone: '(555) 123-4567',
        customer_email: `test${i}@example.com`,
        date_needed: new Date(Date.now() + 86400000 * (i + 1)).toISOString().split('T')[0],
        time_needed: '14:00',
        cake_size: '10" Round',
        filling: cakes[i],
        special_instructions: 'Happy Birthday!',
        status: statuses[i] || 'pending',
        payment_status: 'paid',
        total_amount: 45.00 + (i * 10),
        delivery_option: i % 2 === 0 ? 'pickup' : 'delivery',
        delivery_address: i % 2 === 0 ? '' : '123 Test St, City',
        img_url: imageUrl, // User provided image
        created_at: new Date(Date.now() - 10000 * i).toISOString() // Staggered creation times
      });
    }

    const current = JSON.parse(localStorage.getItem('mock_orders') || '[]');
    localStorage.setItem('mock_orders', JSON.stringify([...orders, ...current]));
    window.dispatchEvent(new Event('mock-order-update'));
    return { success: true, count: 5 };
  }

  // Payments API
  async createCheckout(amount: number, orderData: any, returnUrl?: string) {
    return this.request('/payments/create-checkout', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        orderData,
        returnUrl: returnUrl || `${window.location.origin}/order-confirmation`,
        cancelUrl: `${window.location.origin}/order`,
      }),
    });
  }

  async createPayment(paymentData: {
    sourceId: string;
    amount: number;
    orderData: any;
    idempotencyKey: string;
  }) {
    return this.request('/payments/create-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async verifyPayment(paymentId: string) {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    });
  }

  async getPayment(paymentId: string) {
    return this.request(`/payments/square/${paymentId}`);
  }

  async getPaymentByOrder(orderId: string | number) {
    return this.request(`/payments/order/${orderId}`);
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    return this.request(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  }

  // Pricing API
  async getCurrentPricing() {
    return this.request('/pricing/current');
  }

  async calculatePricing(orderDetails: {
    size: string;
    filling: string;
    theme: string;
    deliveryOption: 'delivery' | 'pickup';
    deliveryAddress?: string;
    zipCode?: string;
    promoCode?: string;
  }) {
    return this.request('/pricing/calculate', {
      method: 'POST',
      body: JSON.stringify(orderDetails),
    });
  }

  // Capacity API
  async getAvailableDates(days?: number) {
    const endpoint = days ? `/capacity/available-dates?days=${days}` : '/capacity/available-dates';
    return this.request(endpoint);
  }

  async getDateCapacity(date: string) {
    return this.request(`/capacity/${date}`);
  }

  async getBusinessHours() {
    return this.request('/capacity/business-hours');
  }

  async getHolidays() {
    return this.request('/capacity/holidays');
  }

  async validatePromoCode(code: string, subtotal: number) {
    return this.request('/pricing/promo-code/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  }

  // Admin Pricing API
  async updatePricing(type: string, id: number, data: any) {
    return this.request(`/pricing/${type}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createPricing(type: string, data: any) {
    return this.request(`/pricing/${type}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deletePricing(type: string, id: number) {
    return this.request(`/pricing/${type}/${id}`, {
      method: 'DELETE',
    });
  }

  async getPriceHistory(type: string, id: number) {
    return this.request(`/pricing/${type}/${id}/history`);
  }

  // Capacity API


  async getCapacityByDate(date: string) {
    return this.request(`/capacity/${date}`);
  }

  async setCapacity(date: string, maxOrders: number, notes?: string) {
    return this.request('/capacity/set', {
      method: 'POST',
      body: JSON.stringify({ date, max_orders: maxOrders, notes }),
    });
  }



  async checkHoliday(date: string) {
    return this.request(`/capacity/holiday/${date}`);
  }

  // Inventory API
  async getLowStockItems() {
    return this.request('/inventory/low-stock');
  }

  async getInventory() {
    return this.request('/inventory');
  }

  async updateIngredient(id: number, quantity: number, notes?: string) {
    return this.request(`/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity, notes }),
    });
  }

  async logIngredientUsage(ingredientId: number, quantityUsed: number, orderId?: number, notes?: string) {
    return this.request('/inventory/usage', {
      method: 'POST',
      body: JSON.stringify({ ingredient_id: ingredientId, quantity_used: quantityUsed, order_id: orderId, notes }),
    });
  }

  // Delivery API
  async validateDeliveryAddress(address: string) {
    return this.request('/delivery/validate-address', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  }

  async calculateDeliveryFee(address: string, zipCode?: string) {
    const params = new URLSearchParams({ address });
    if (zipCode) params.append('zipCode', zipCode);
    return this.request(`/delivery/calculate-fee?${params.toString()}`);
  }

  async getDeliveryZones() {
    return this.request('/delivery/zones');
  }

  async updateDeliveryStatus(orderId: number, status: string, driverNotes?: string, estimatedDeliveryTime?: string) {
    return this.request(`/delivery/orders/${orderId}/delivery-status`, {
      method: 'PATCH',
      body: JSON.stringify({ delivery_status: status, driver_notes: driverNotes, estimated_delivery_time: estimatedDeliveryTime }),
    });
  }

  async assignDelivery(orderId: number, assignedTo: string) {
    return this.request('/delivery/assign', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, assigned_to: assignedTo }),
    });
  }

  async getTodayDeliveries() {
    return this.request('/delivery/today');
  }

  // Customer Management API
  async getCustomerProfile() {
    return this.request('/customers/me');
  }

  async getCustomerOrders(status?: string, dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    return this.request(`/customers/me/orders?${params.toString()}`);
  }

  async getCustomerAddresses() {
    return this.request('/customers/me/addresses');
  }

  async createCustomerAddress(addressData: {
    label: string;
    address: string;
    apartment?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    is_default?: boolean;
  }) {
    return this.request('/customers/me/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateCustomerAddress(id: number, addressData: any) {
    return this.request(`/customers/me/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(addressData),
    });
  }

  async deleteCustomerAddress(id: number) {
    return this.request(`/customers/me/addresses/${id}`, {
      method: 'DELETE',
    });
  }

  async updateCustomerPreferences(preferences: {
    favorite_cake_size?: string;
    favorite_filling?: string;
    favorite_theme?: string;
    email_notifications_enabled?: boolean;
    sms_notifications_enabled?: boolean;
  }) {
    return this.request('/customers/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }

  async reorderOrder(orderId: number) {
    return this.request(`/orders/${orderId}/reorder`, {
      method: 'POST',
    });
  }



  // Newsletter API
  async subscribeNewsletter(email: string) {
    return this.request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
  // Configurator API
  async getAttributes() {
    return this.request('/configurator/attributes');
  }

  async checkCapacity(date: string) {
    return this.request(`/configurator/capacity?date=${date}`);
  }

  async getBakerTicket(orderId: string | number) {
    return this.request(`/configurator/ticket/${orderId}`);
  }

  // Cancellation API
  async getCancellationPolicy(orderId: number, hoursUntilNeeded: number) {
    return this.request(`/orders/${orderId}/cancellation-policy?hours=${hoursUntilNeeded}`);
  }

  async cancelOrder(orderId: number, request: { reason: string; reasonDetails?: string }) {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async adminCancelOrder(
    orderId: number,
    request: { reason: string; reasonDetails?: string; overrideRefundAmount?: number; adminNotes?: string }
  ) {
    return this.request(`/orders/${orderId}/admin-cancel`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async processRefund(paymentId: number, amount: number, reason: string) {
    return this.request(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  }

  // Order State Transition API
  async getAvailableTransitions(orderId: number) {
    return this.request(`/orders/${orderId}/available-transitions`);
  }

  async transitionOrderStatus(
    orderId: number,
    targetStatus: string,
    reason?: string,
    metadata?: Record<string, any>
  ) {
    return this.request(`/orders/${orderId}/transition`, {
      method: 'POST',
      body: JSON.stringify({ targetStatus, reason, metadata }),
    });
  }

  async getTransitionHistory(orderId: number) {
    return this.request(`/orders/${orderId}/transition-history`);
  }

  // Order Search API
  async searchOrders(params: {
    q?: string;
    status?: string[];
    paymentStatus?: string[];
    deliveryOption?: 'pickup' | 'delivery' | 'all';
    cakeSize?: string[];
    dateFrom?: string;
    dateTo?: string;
    dateNeededFilter?: 'today' | 'this_week' | 'this_month' | 'custom' | 'all';
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.append('q', params.q);
    if (params.status && params.status.length > 0) queryParams.append('status', params.status.join(','));
    if (params.paymentStatus && params.paymentStatus.length > 0) queryParams.append('paymentStatus', params.paymentStatus.join(','));
    if (params.deliveryOption && params.deliveryOption !== 'all') queryParams.append('deliveryOption', params.deliveryOption);
    if (params.cakeSize && params.cakeSize.length > 0) queryParams.append('cakeSize', params.cakeSize.join(','));
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params.dateNeededFilter && params.dateNeededFilter !== 'all') queryParams.append('dateNeededFilter', params.dateNeededFilter);
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return this.request(`/orders/search?${queryParams.toString()}`);
  }
  // Analytics API (with Mock Fallbacks)
  async getDashboardMetrics(dateRange: 'today' | 'week' | 'month') {
    try {
      return await this.request(`/analytics/dashboard?range=${dateRange}`);
    } catch (e) {
      console.warn('Using mock data for getDashboardMetrics');
      return {
        todayOrders: 12,
        todayRevenue: 450.00,
        pendingOrders: 3,
        capacityUtilization: 0.65,
        averageOrderValue: 37.50,
        totalCustomers: 1240,
        lowStockItems: 2,
        todayDeliveries: 5
      };
    }
  }

  async getRevenueByPeriod(startDate: string, endDate: string, groupBy: 'day' | 'week' | 'month') {
    try {
      return await this.request(`/analytics/revenue?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`);
    } catch (e) {
      // Generate mock trend data
      const data = [];
      const days = 7;
      const now = new Date();
      for (let i = days; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        data.push({
          date: d.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 500) + 200
        });
      }
      return data;
    }
  }

  async getPopularItems(period: 'week' | 'month' | 'year') {
    try {
      return await this.request(`/analytics/popular-items?period=${period}`);
    } catch (e) {
      return [
        { itemName: 'Tres Leches', orderCount: 45, revenue: 1200, itemType: 'filling' },
        { itemName: 'Chocolate Fudge', orderCount: 32, revenue: 950, itemType: 'filling' },
        { itemName: 'Vanilla Bean', orderCount: 28, revenue: 800, itemType: 'filling' },
        { itemName: 'Red Velvet', orderCount: 15, revenue: 450, itemType: 'filling' },
      ];
    }
  }

  async getOrdersByStatus() {
    try {
      return await this.request('/analytics/orders-by-status');
    } catch (e) {
      return [
        { status: 'completed', count: 145, percentage: 60, totalRevenue: 5000 },
        { status: 'pending', count: 35, percentage: 15, totalRevenue: 1200 },
        { status: 'processing', count: 40, percentage: 17, totalRevenue: 1500 },
        { status: 'cancelled', count: 12, percentage: 8, totalRevenue: 0 },
      ];
    }
  }

  async getPeakOrderingTimes(days: number) {
    try {
      return await this.request(`/analytics/peak-times?days=${days}`);
    } catch (e) {
      // Mock random peak times
      return Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        orderCount: Math.floor(Math.random() * 20),
        revenue: Math.floor(Math.random() * 500)
      }));
    }
  }

  async getCapacityUtilization(days: number) {
    try {
      return await this.request(`/analytics/capacity-utilization?days=${days}`);
    } catch (e) {
      return [];
    }
  }

  async getAverageOrderValue(period: 'today' | 'week' | 'month') {
    try {
      return await this.request(`/analytics/average-order-value?period=${period}`);
    } catch (e) {
      return 42.50;
    }
  }

  async getCustomerRetention(period: 'week' | 'month' | 'year') {
    try {
      return await this.request(`/analytics/customer-retention?period=${period}`);
    } catch (e) {
      return [];
    }
  }

  async trackEvent(eventName: string, metadata?: any) {
    try {
      return await this.request('/analytics/track', {
        method: 'POST',
        body: JSON.stringify({ event: eventName, ...metadata, timestamp: new Date().toISOString() }),
      });
    } catch (e) {
      // Silent fail for tracking
      console.log('Track event (mock):', eventName, metadata);
      return { success: true };
    }
  }

  // Report Generation
  async generateDailySalesReport(date: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/reports/daily-sales?date=${date}`, {
      headers: {
        'x-api-key': ADMIN_API_KEY,
        'Authorization': (await this.getAuthHeader()) || ''
      }
    });
    return response.blob();
  }

  async generateInventoryReport(): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/reports/inventory`, {
      headers: {
        'x-api-key': ADMIN_API_KEY,
        'Authorization': (await this.getAuthHeader()) || ''
      }
    });
    return response.blob();
  }

  async generateCustomerActivityReport(startDate: string, endDate: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/reports/customer-activity?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        'x-api-key': ADMIN_API_KEY,
        'Authorization': (await this.getAuthHeader()) || ''
      }
    });
    return response.blob();
  }

  // Helper for auth header since we need it for blobs
  private async getAuthHeader(): Promise<string | null> {
    try {
      const { supabase } = await import('./supabase');
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token ? `Bearer ${session.access_token}` : null;
      }
    } catch {
      return null;
    }
    return null;
  }
}

export const api = new ApiClient();
export default api;
