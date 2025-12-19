/**
 * Customer Support API
 * Functions for contact form submissions, order issues, and support management
 */

import { supabase } from './supabase';

// Contact Submission Interfaces
export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: 'General' | 'Order Issue' | 'Custom Request' | 'Feedback';
  message: string;
  attachment_url?: string;
  order_number?: string;
  status: 'new' | 'read' | 'responded' | 'resolved';
  ip_address?: string;
  user_agent?: string;
  is_spam: boolean;
  admin_notes?: string;
  responded_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderIssue {
  id: number;
  order_id: number;
  order_number: string;
  customer_id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  issue_category: 'Wrong order' | 'Quality issue' | 'Late delivery' | 'Other';
  issue_description: string;
  photo_urls?: string[];
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  admin_response?: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ResponseTemplate {
  id: number;
  name: string;
  category: 'contact' | 'order_issue' | 'general';
  subject_en: string;
  subject_es?: string;
  body_en: string;
  body_es?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FAQFeedback {
  id: number;
  faq_id: number;
  is_helpful: boolean;
  feedback_text?: string;
  ip_address?: string;
  created_at: string;
}

// Contact Form Submission
export async function submitContactForm(data: {
  name: string;
  email: string;
  phone?: string;
  subject: ContactSubmission['subject'];
  message: string;
  attachment_url?: string;
  order_number?: string;
  honeypot?: string; // Spam protection
}): Promise<ContactSubmission | null> {
  try {
    if (!supabase) {
      console.warn('Supabase client not configured');
      return null;
    }

    // Honeypot check
    if (data.honeypot && data.honeypot.trim() !== '') {
      console.warn('Honeypot field filled - potential spam');
      return null;
    }

    // Rate limiting check
    const ipAddress = await getClientIP();
    const canSubmit = await checkRateLimit(ipAddress);
    if (!canSubmit) {
      throw new Error('Too many submissions. Please try again later.');
    }

    // Get user agent
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';

    const { data: submission, error } = await supabase
      .from('contact_submissions')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        attachment_url: data.attachment_url,
        order_number: data.order_number,
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting contact form:', error);
      throw error;
    }

    return submission;
  } catch (error) {
    console.error('Error in submitContactForm:', error);
    throw error;
  }
}

// Get Client IP (simplified - in production, use proper IP detection)
async function getClientIP(): Promise<string> {
  // In a real app, you'd get this from the server or use a service
  // For now, we'll use a placeholder that will be handled server-side
  return 'unknown';
}

// Rate Limiting Check
async function checkRateLimit(ipAddress: string): Promise<boolean> {
  try {
    if (!supabase) return true;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Check existing rate limit record
    const { data: existing } = await supabase
      .from('contact_rate_limits')
      .select('*')
      .eq('ip_address', ipAddress)
      .single();

    if (existing) {
      // Check if first submission was within the last hour
      const firstSubmission = new Date(existing.first_submission_at);
      const now = new Date();
      const hoursSinceFirst = (now.getTime() - firstSubmission.getTime()) / (1000 * 60 * 60);

      if (hoursSinceFirst < 1) {
        // Within the hour - check count
        if (existing.submission_count >= 3) {
          return false; // Rate limit exceeded
        }
        // Increment count
        await supabase
          .from('contact_rate_limits')
          .update({
            submission_count: existing.submission_count + 1,
            last_submission_at: new Date().toISOString(),
          })
          .eq('ip_address', ipAddress);
      } else {
        // Reset - more than an hour has passed
        await supabase
          .from('contact_rate_limits')
          .update({
            submission_count: 1,
            first_submission_at: new Date().toISOString(),
            last_submission_at: new Date().toISOString(),
          })
          .eq('ip_address', ipAddress);
      }
    } else {
      // First submission from this IP
      await supabase
        .from('contact_rate_limits')
        .insert({
          ip_address: ipAddress,
          submission_count: 1,
        });
    }

    return true;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return true; // Allow on error to avoid blocking legitimate users
  }
}

// Submit Order Issue
export async function submitOrderIssue(data: {
  order_id: number;
  order_number: string;
  customer_id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  issue_category: OrderIssue['issue_category'];
  issue_description: string;
  photo_urls?: string[];
}): Promise<OrderIssue | null> {
  try {
    if (!supabase) {
      console.warn('Supabase client not configured');
      return null;
    }

    const { data: issue, error } = await supabase
      .from('order_issues')
      .insert({
        ...data,
        status: 'open',
        priority: 'medium',
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting order issue:', error);
      throw error;
    }

    return issue;
  } catch (error) {
    console.error('Error in submitOrderIssue:', error);
    throw error;
  }
}

// Admin Functions - Get Contact Submissions
export async function getContactSubmissions(filters?: {
  status?: ContactSubmission['status'];
  limit?: number;
}): Promise<ContactSubmission[]> {
  try {
    if (!supabase) {
      console.warn('Supabase client not configured');
      return [];
    }

    let query = supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contact submissions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getContactSubmissions:', error);
    return [];
  }
}

// Admin Functions - Get Order Issues
export async function getOrderIssues(filters?: {
  status?: OrderIssue['status'];
  limit?: number;
}): Promise<OrderIssue[]> {
  try {
    if (!supabase) {
      console.warn('Supabase client not configured');
      return [];
    }

    let query = supabase
      .from('order_issues')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching order issues:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getOrderIssues:', error);
    return [];
  }
}

// Admin Functions - Update Contact Submission Status
export async function updateContactSubmissionStatus(
  id: number,
  status: ContactSubmission['status'],
  admin_notes?: string
): Promise<boolean> {
  try {
    if (!supabase) return false;

    const updateData: any = { status };
    if (status === 'responded') {
      updateData.responded_at = new Date().toISOString();
    }
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }
    if (admin_notes) {
      updateData.admin_notes = admin_notes;
    }

    const { error } = await supabase
      .from('contact_submissions')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating contact submission:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateContactSubmissionStatus:', error);
    return false;
  }
}

// Admin Functions - Update Order Issue Status
export async function updateOrderIssueStatus(
  id: number,
  status: OrderIssue['status'],
  admin_response?: string,
  resolution_notes?: string
): Promise<boolean> {
  try {
    if (!supabase) return false;

    const updateData: any = { status };
    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_at = new Date().toISOString();
    }
    if (admin_response) {
      updateData.admin_response = admin_response;
    }
    if (resolution_notes) {
      updateData.resolution_notes = resolution_notes;
    }

    const { error } = await supabase
      .from('order_issues')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating order issue:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateOrderIssueStatus:', error);
    return false;
  }
}

// Response Templates
export async function getResponseTemplates(category?: string): Promise<ResponseTemplate[]> {
  try {
    if (!supabase) {
      console.warn('Supabase client not configured');
      return [];
    }

    let query = supabase
      .from('response_templates')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching response templates:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getResponseTemplates:', error);
    return [];
  }
}

// FAQ Feedback
export async function submitFAQFeedback(
  faq_id: number,
  is_helpful: boolean,
  feedback_text?: string
): Promise<boolean> {
  try {
    if (!supabase) return false;

    const ipAddress = await getClientIP();

    const { error } = await supabase
      .from('faq_feedback')
      .insert({
        faq_id,
        is_helpful,
        feedback_text,
        ip_address: ipAddress,
      });

    if (error) {
      console.error('Error submitting FAQ feedback:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in submitFAQFeedback:', error);
    return false;
  }
}

