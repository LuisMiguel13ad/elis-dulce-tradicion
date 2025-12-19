/**
 * Shared email template utilities for Edge Functions
 * These can be imported by multiple edge functions
 */

export interface OrderData {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_language?: string;
  date_needed: string;
  time_needed: string;
  cake_size: string;
  filling: string;
  theme: string;
  dedication?: string;
  delivery_option: string;
  delivery_address?: string;
  delivery_apartment?: string;
  total_amount: number;
  reference_image_path?: string;
}

export function formatDate(dateString: string, locale: 'en' | 'es' = 'en'): string {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', options);
  } catch {
    return dateString;
  }
}

export function formatStatus(status: string, locale: 'en' | 'es' = 'en'): string {
  const statusMap: Record<string, { en: string; es: string }> = {
    pending: { en: 'Pending', es: 'Pendiente' },
    confirmed: { en: 'Confirmed', es: 'Confirmada' },
    in_progress: { en: 'In Progress', es: 'En Progreso' },
    ready: { en: 'Ready', es: 'Lista' },
    out_for_delivery: { en: 'Out for Delivery', es: 'En Camino' },
    delivered: { en: 'Delivered', es: 'Entregada' },
    completed: { en: 'Completed', es: 'Completada' },
    cancelled: { en: 'Cancelled', es: 'Cancelada' },
  };

  return statusMap[status]?.[locale] || status;
}

export function getLanguage(order: OrderData): 'en' | 'es' {
  const lang = order.customer_language?.toLowerCase();
  return lang === 'es' || lang === 'spanish' ? 'es' : 'en';
}

export function getBusinessInfo(locale: 'en' | 'es' = 'en') {
  return {
    phone: '(610) 910-9067',
    email: 'orders@elisbakery.com',
    website: process.env.FRONTEND_URL || 'https://elisbakery.com',
    contactLabel: locale === 'es' ? 'Contáctanos' : 'Contact Us',
  };
}
