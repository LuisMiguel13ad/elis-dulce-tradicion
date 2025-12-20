/**
 * Shared TypeScript types for Eli's Bakery
 * Export all types for use in both frontend and backend
 */

// Re-export order types
export * from './order';

// Re-export auth types
export * from './auth';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Note: OrderStatus, DeliveryStatus, RefundStatus, PaymentStatus are now exported from './order'
// Re-exporting for backward compatibility

export type DeliveryOption = 'pickup' | 'delivery';

export type UserRole = 'customer' | 'baker' | 'owner';

export type Language = 'en' | 'es';

// Product types
export interface Product {
  id: number;
  name_es: string;
  name_en: string;
  description_es?: string;
  description_en?: string;
  price: number;
  category: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Pricing types
export interface PricingBreakdown {
  basePrice: number;
  fillingCost: number;
  themeCost: number;
  deliveryFee: number;
  tax: number;
  subtotal: number;
  discount: number;
  total: number;
}

// Capacity types
export interface AvailableDate {
  date: string;
  available: boolean;
  current_orders: number;
  max_orders: number;
  reason: string;
}

// Delivery types
export interface DeliveryZone {
  id: number;
  name: string;
  zip_codes: string[];
  delivery_fee: number;
  estimated_time: number;
}

// Customer types
export interface CustomerAddress {
  id: number;
  user_id: string;
  label: string;
  address: string;
  apartment?: string;
  zip_code: string;
  city?: string;
  state?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
