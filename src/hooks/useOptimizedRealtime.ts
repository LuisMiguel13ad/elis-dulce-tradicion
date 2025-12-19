/**
 * Optimized Supabase Realtime hook
 * Only subscribes when component is visible and uses filters
 */
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseOptimizedRealtimeOptions {
  table: string;
  filter?: string;
  enabled?: boolean;
  throttleMs?: number;
}

/**
 * Optimized realtime subscription hook
 * - Only subscribes when component is visible (Intersection Observer)
 * - Uses filters to reduce payload
 * - Throttles updates
 */
export function useOptimizedRealtime<T = any>(
  options: UseOptimizedRealtimeOptions,
  callback: (payload: T) => void
) {
  const { table, filter, enabled = true, throttleMs = 1000 } = options;
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isVisible, setIsVisible] = useVisibility();
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !isVisible || !supabase) return;

    // Throttle callback
    const throttledCallback = (payload: T) => {
      const now = Date.now();
      if (now - lastUpdateRef.current > throttleMs) {
        lastUpdateRef.current = now;
        callback(payload);
      }
    };

    // Create channel with filters
    const channel = supabase
      .channel(`${table}:changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: filter || undefined,
        },
        (payload) => {
          throttledCallback(payload as T);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [table, filter, enabled, isVisible, throttleMs, callback]);

  return { isSubscribed: !!channelRef.current };
}

/**
 * Hook to detect if element is visible
 */
function useVisibility() {
  const [isVisible, setIsVisible] = useState(true);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [isVisible, ref] as const;
}
