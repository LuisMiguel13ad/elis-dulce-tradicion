/**
 * PWA utilities for service worker and push notifications
 */
import { Workbox } from 'workbox-window';

let wb: Workbox | null = null;

/**
 * Initialize service worker
 */
export function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    wb = new Workbox('/sw.js');

    wb.addEventListener('controlling', () => {
      window.location.reload();
    });

    wb.register().then((registration) => {
      console.log('Service Worker registered:', registration);
    }).catch((error) => {
      console.error('Service Worker registration failed:', error);
    });

    // Listen for updates
    wb.addEventListener('waiting', () => {
      // Show update prompt
      if (confirm('A new version is available. Reload to update?')) {
        wb?.messageSkipWaiting();
      }
    });
  }
}

/**
 * Request push notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Show notification
 */
export function showNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/pwa-icon-192.png',
      badge: '/pwa-icon-192.png',
      ...options,
    });
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
      ),
    });

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

/**
 * Convert VAPID key from URL base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if app is installed
 */
export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}
