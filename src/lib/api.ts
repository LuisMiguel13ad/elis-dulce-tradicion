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

    // Add auth token for customer/analytics/search endpoints, API key for admin endpoints
    if (authToken && (
      endpoint.startsWith('/customers') || 
      endpoint.startsWith('/analytics') || 
      endpoint.startsWith('/reports') ||
      endpoint.startsWith('/orders/search')
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
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Orders API
  async createOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(orderId: string | number) {
    return this.request(`/orders/${orderId}`);
  }

  async getOrderByNumber(orderNumber: string) {
    return this.request(`/orders/number/${orderNumber}`);
  }

  async updateOrderStatus(orderId: string | number, status: string, notes?: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  async getAllOrders(status?: string) {
    const endpoint = status ? `/orders?status=${status}` : '/orders';
    return this.request(endpoint);
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
  async getAvailableDates(daysAhead: number = 90) {
    return this.request(`/capacity/available-dates?days=${daysAhead}`);
  }

  async getCapacityByDate(date: string) {
    return this.request(`/capacity/${date}`);
  }

  async setCapacity(date: string, maxOrders: number, notes?: string) {
    return this.request('/capacity/set', {
      method: 'POST',
      body: JSON.stringify({ date, max_orders: maxOrders, notes }),
    });
  }

  async getBusinessHours() {
    return this.request('/capacity/business-hours');
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

  async getOrderByNumber(orderNumber: string) {
    return this.request(`/orders/number/${orderNumber}`);
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
}

export const api = new ApiClient();
export default api;
