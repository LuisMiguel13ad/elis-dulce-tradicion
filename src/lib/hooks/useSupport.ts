/**
 * React Query hooks for customer support features
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitContactForm,
  submitOrderIssue,
  getContactSubmissions,
  getOrderIssues,
  updateContactSubmissionStatus,
  updateOrderIssueStatus,
  getResponseTemplates,
  submitFAQFeedback,
  type ContactSubmission,
  type OrderIssue,
  type ResponseTemplate,
} from '../support';

// Query Keys
export const supportKeys = {
  all: ['support'] as const,
  contactSubmissions: (filters?: { status?: ContactSubmission['status'] }) =>
    [...supportKeys.all, 'contact-submissions', filters] as const,
  orderIssues: (filters?: { status?: OrderIssue['status'] }) =>
    [...supportKeys.all, 'order-issues', filters] as const,
  responseTemplates: (category?: string) =>
    [...supportKeys.all, 'response-templates', category] as const,
};

// Contact Form Submission Hook
export function useSubmitContactForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitContactForm,
    onSuccess: () => {
      // Invalidate contact submissions list
      queryClient.invalidateQueries({ queryKey: supportKeys.contactSubmissions() });
    },
  });
}

// Order Issue Submission Hook
export function useSubmitOrderIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitOrderIssue,
    onSuccess: () => {
      // Invalidate order issues list
      queryClient.invalidateQueries({ queryKey: supportKeys.orderIssues() });
    },
  });
}

// Get Contact Submissions Hook
export function useContactSubmissions(filters?: { status?: ContactSubmission['status']; limit?: number }) {
  return useQuery({
    queryKey: supportKeys.contactSubmissions(filters),
    queryFn: () => getContactSubmissions(filters),
    staleTime: 30000, // 30 seconds
  });
}

// Get Order Issues Hook
export function useOrderIssues(filters?: { status?: OrderIssue['status']; limit?: number }) {
  return useQuery({
    queryKey: supportKeys.orderIssues(filters),
    queryFn: () => getOrderIssues(filters),
    staleTime: 30000, // 30 seconds
  });
}

// Update Contact Submission Status Hook
export function useUpdateContactSubmissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, admin_notes }: { id: number; status: ContactSubmission['status']; admin_notes?: string }) =>
      updateContactSubmissionStatus(id, status, admin_notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.contactSubmissions() });
    },
  });
}

// Update Order Issue Status Hook
export function useUpdateOrderIssueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      admin_response,
      resolution_notes,
    }: {
      id: number;
      status: OrderIssue['status'];
      admin_response?: string;
      resolution_notes?: string;
    }) => updateOrderIssueStatus(id, status, admin_response, resolution_notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.orderIssues() });
    },
  });
}

// Get Response Templates Hook
export function useResponseTemplates(category?: string) {
  return useQuery({
    queryKey: supportKeys.responseTemplates(category),
    queryFn: () => getResponseTemplates(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Submit FAQ Feedback Hook
export function useSubmitFAQFeedback() {
  return useMutation({
    mutationFn: ({ faq_id, is_helpful, feedback_text }: { faq_id: number; is_helpful: boolean; feedback_text?: string }) =>
      submitFAQFeedback(faq_id, is_helpful, feedback_text),
  });
}

