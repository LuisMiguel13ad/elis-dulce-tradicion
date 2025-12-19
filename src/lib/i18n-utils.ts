import { format, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import type { Language } from '@/contexts/LanguageContext';

const dateLocales = {
  es,
  en: enUS,
};

/**
 * Format date based on locale
 * @param date - Date string or Date object
 * @param formatStr - Format string (default: 'MM/dd/yyyy' for en, 'dd/MM/yyyy' for es)
 * @param language - Language code
 */
export const formatDate = (
  date: string | Date,
  formatStr?: string,
  language: Language = 'es'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const locale = dateLocales[language];
  
  // Default formats based on locale
  const defaultFormat = language === 'es' ? 'dd/MM/yyyy' : 'MM/dd/yyyy';
  const formatPattern = formatStr || defaultFormat;
  
  return format(dateObj, formatPattern, { locale });
};

/**
 * Format time based on locale (12hr for en, 24hr for es)
 * @param time - Time string (HH:mm) or Date object
 * @param language - Language code
 */
export const formatTime = (
  time: string | Date,
  language: Language = 'es'
): string => {
  let dateObj: Date;
  
  if (typeof time === 'string') {
    const [hours, minutes] = time.split(':').map(Number);
    dateObj = new Date();
    dateObj.setHours(hours, minutes, 0);
  } else {
    dateObj = time;
  }
  
  const locale = dateLocales[language];
  
  if (language === 'en') {
    // 12-hour format for English
    return format(dateObj, 'h:mm a', { locale });
  } else {
    // 24-hour format for Spanish
    return format(dateObj, 'HH:mm', { locale });
  }
};

/**
 * Format currency based on locale
 * @param amount - Amount to format
 * @param language - Language code
 * @param currency - Currency code (default: 'USD')
 */
export const formatCurrency = (
  amount: number | string,
  language: Language = 'es',
  currency: string = 'USD'
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  const locale = language === 'es' ? 'es-US' : 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

/**
 * Format number based on locale
 * @param number - Number to format
 * @param language - Language code
 * @param options - Intl.NumberFormatOptions
 */
export const formatNumber = (
  number: number | string,
  language: Language = 'es',
  options?: Intl.NumberFormatOptions
): string => {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  const locale = language === 'es' ? 'es-US' : 'en-US';
  
  return new Intl.NumberFormat(locale, options).format(num);
};
