import { useCallback } from 'react';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

/**
 * Hook for Web Share API
 */
export function useShare() {
  const isSupported = 'share' in navigator;

  const share = useCallback(async (data: ShareData) => {
    if (!isSupported) {
      // Fallback: Copy to clipboard
      if (data.url) {
        try {
          await navigator.clipboard.writeText(data.url);
          return { success: true, method: 'clipboard' };
        } catch (error) {
          return { success: false, error };
        }
      }
      return { success: false, error: 'Share API not supported' };
    }

    try {
      await navigator.share(data);
      return { success: true, method: 'share' };
    } catch (error: any) {
      // User cancelled or error
      if (error.name === 'AbortError') {
        return { success: false, cancelled: true };
      }
      return { success: false, error };
    }
  }, [isSupported]);

  const shareOrder = useCallback(async (orderNumber: string, trackingUrl: string) => {
    return share({
      title: `Order ${orderNumber}`,
      text: `Track my order: ${orderNumber}`,
      url: trackingUrl,
    });
  }, [share]);

  return {
    isSupported,
    share,
    shareOrder,
  };
}
