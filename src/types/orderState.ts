/**
 * TypeScript types for order state machine
 */

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type UserRole = 'customer' | 'baker' | 'owner' | 'admin';

export interface TransitionContext {
  orderId: number;
  userId?: string;
  userRole: UserRole;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface OrderData {
  id: number;
  status: OrderStatus;
  payment_status?: 'pending' | 'paid' | 'refunded' | 'failed';
  date_needed?: string;
  time_needed?: string;
  ready_at?: string;
  created_at: string;
  total_amount?: number;
}

export interface TransitionResult {
  success: boolean;
  newStatus: OrderStatus;
  previousStatus: OrderStatus;
  error?: string;
  metadata?: Record<string, any>;
}

export interface OrderStatusHistory {
  id: number;
  order_id: number;
  previous_status: OrderStatus | null;
  new_status: OrderStatus;
  user_id: string | null;
  notes: string | null;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface TimeMetrics {
  time_to_confirm?: number; // minutes
  time_to_ready?: number; // minutes
  time_to_complete?: number; // minutes
}
