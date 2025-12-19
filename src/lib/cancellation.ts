/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from './api';

export interface CancellationPolicy {
  id: number;
  hours_before_needed: number;
  refund_percentage: number;
  description: string;
}

export interface CancellationInfo {
  canCancel: boolean;
  reason?: string;
  hoursUntilNeeded: number;
  applicablePolicy?: CancellationPolicy;
  refundAmount: number;
  refundPercentage: number;
}

export interface CancellationRequest {
  reason: string;
  reasonDetails?: string;
}

export interface RefundDetails {
  refundAmount: number;
  refundPercentage: number;
  squareRefundId?: string;
  refundStatus: 'pending' | 'processed' | 'failed';
}

/**
 * Calculate hours between now and order needed date/time
 */
export function calculateHoursUntilNeeded(order: any): number {
  if (!order.date_needed || !order.time_needed) {
    return Infinity; // If no date/time, assume far future
  }

  const neededDateTime = new Date(`${order.date_needed}T${order.time_needed}`);
  const now = new Date();
  const diffMs = neededDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return Math.max(0, diffHours);
}

/**
 * Validate if an order can be cancelled
 */
export function validateCancellation(order: any, isAdmin: boolean = false): { canCancel: boolean; reason?: string } {
  // Check if already cancelled
  if (order.status === 'cancelled') {
    return { canCancel: false, reason: 'Order is already cancelled' };
  }

  // Check if order is completed
  if (order.status === 'completed') {
    return { canCancel: false, reason: 'Cannot cancel completed orders' };
  }

  // Check if order is in progress (requires admin approval)
  const inProgressStatuses = ['in_oven', 'decorating', 'ready'];
  if (inProgressStatuses.includes(order.status) && !isAdmin) {
    return { 
      canCancel: false, 
      reason: 'Order is in progress. Please contact support to cancel.' 
    };
  }

  // Check minimum cancellation time (24 hours default)
  const hoursUntilNeeded = calculateHoursUntilNeeded(order);
  const minCancellationHours = 24; // Configurable

  if (hoursUntilNeeded < minCancellationHours && !isAdmin) {
    return { 
      canCancel: false, 
      reason: `Orders cannot be cancelled within ${minCancellationHours} hours of pickup/delivery time. Please contact support.` 
    };
  }

  return { canCancel: true };
}

/**
 * Get cancellation policy for an order
 */
export async function getCancellationPolicy(order: any): Promise<CancellationPolicy | null> {
  const hoursUntilNeeded = calculateHoursUntilNeeded(order);
  return api.getCancellationPolicy(order.id, hoursUntilNeeded);
}

/**
 * Calculate refund amount based on cancellation policy
 */
export async function calculateRefundAmount(order: any): Promise<{
  refundAmount: number;
  refundPercentage: number;
  policy?: CancellationPolicy;
}> {
  const hoursUntilNeeded = calculateHoursUntilNeeded(order);
  const policy = await getCancellationPolicy(order);

  if (!policy) {
    return { refundAmount: 0, refundPercentage: 0 };
  }

  const refundAmount = (parseFloat(order.total_amount || 0) * policy.refund_percentage) / 100;

  return {
    refundAmount: Math.round(refundAmount * 100) / 100,
    refundPercentage: policy.refund_percentage,
    policy,
  };
}

/**
 * Get complete cancellation information for an order
 */
export async function getCancellationInfo(
  order: any,
  isAdmin: boolean = false
): Promise<CancellationInfo> {
  const validation = validateCancellation(order, isAdmin);
  const hoursUntilNeeded = calculateHoursUntilNeeded(order);
  const refundCalc = await calculateRefundAmount(order);

  return {
    canCancel: validation.canCancel,
    reason: validation.reason,
    hoursUntilNeeded,
    applicablePolicy: refundCalc.policy || undefined,
    refundAmount: refundCalc.refundAmount,
    refundPercentage: refundCalc.refundPercentage,
  };
}

/**
 * Cancel an order (customer)
 */
export async function cancelOrder(
  orderId: number,
  request: CancellationRequest
): Promise<{ success: boolean; refund?: RefundDetails; error?: string }> {
  return api.cancelOrder(orderId, request);
}

/**
 * Cancel an order (admin override)
 */
export async function adminCancelOrder(
  orderId: number,
  request: CancellationRequest & { overrideRefundAmount?: number; adminNotes?: string }
): Promise<{ success: boolean; refund?: RefundDetails; error?: string }> {
  return api.adminCancelOrder(orderId, request);
}

/**
 * Format cancellation reason for display
 */
export function formatCancellationReason(reason: string): string {
  const reasons: Record<string, string> = {
    'customer_request': 'Customer Request',
    'duplicate_order': 'Duplicate Order',
    'wrong_item': 'Wrong Item Ordered',
    'change_of_mind': 'Change of Mind',
    'emergency': 'Emergency',
    'payment_issue': 'Payment Issue',
    'admin_error': 'Admin Error',
    'other': 'Other',
  };

  return reasons[reason] || reason;
}
