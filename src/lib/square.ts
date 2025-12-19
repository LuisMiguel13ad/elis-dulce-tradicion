/**
 * Square Web Payments SDK utilities
 */

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => {
        card: () => Promise<any>;
        googlePay: (options: any) => Promise<any>;
        applePay: (options: any) => Promise<any>;
      };
    };
  }
}

const SQUARE_APPLICATION_ID = import.meta.env.VITE_SQUARE_APPLICATION_ID;
const SQUARE_LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID;
const SQUARE_ENVIRONMENT = import.meta.env.VITE_SQUARE_ENVIRONMENT || 'sandbox';

/**
 * Initialize Square Payments
 */
export function initializeSquarePayments() {
  if (!window.Square) {
    throw new Error('Square Web Payments SDK not loaded. Check that the script tag is in index.html');
  }

  if (!SQUARE_APPLICATION_ID || !SQUARE_LOCATION_ID) {
    throw new Error('Square credentials not configured. Please set VITE_SQUARE_APPLICATION_ID and VITE_SQUARE_LOCATION_ID');
  }

  try {
    return window.Square.payments(SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID);
  } catch (error) {
    console.error('Error initializing Square Payments:', error);
    throw new Error('Failed to initialize Square Payments. Check your credentials.');
  }
}

/**
 * Create Square card payment method
 */
export async function createCardPayment(payments: any) {
  return payments.card();
}

/**
 * Create Google Pay payment method
 */
export async function createGooglePay(payments: any) {
  return payments.googlePay({
    currencyCode: 'USD',
    countryCode: 'US',
  });
}

/**
 * Create Apple Pay payment method
 */
export async function createApplePay(payments: any) {
  return payments.applePay({
    countryCode: 'US',
    currencyCode: 'USD',
  });
}

/**
 * Check if Google Pay is available
 */
export function isGooglePayAvailable(): boolean {
  return typeof window !== 'undefined' && 'PaymentRequest' in window;
}

/**
 * Check if Apple Pay is available
 */
export function isApplePayAvailable(): boolean {
  return typeof window !== 'undefined' && 'ApplePaySession' in window;
}
