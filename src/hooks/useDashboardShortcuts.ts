import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface ShortcutHandlers {
  onRefresh?: () => void;
  onPrint?: () => void;
  onSearch?: () => void;
  onFilterAll?: () => void;
  onFilterPending?: () => void;
  onFilterConfirmed?: () => void;
  onFilterInProgress?: () => void;
  onFilterReady?: () => void;
  onFilterDelivery?: () => void;
  onNextOrder?: () => void;
  onPrevOrder?: () => void;
  onEscape?: () => void;
}

interface UseDashboardShortcutsOptions {
  enabled?: boolean;
  showToasts?: boolean;
}

/**
 * Custom hook for dashboard keyboard shortcuts
 * 
 * Shortcuts:
 * - R: Refresh orders
 * - P: Print current/selected order
 * - F or /: Focus search input
 * - 1: Filter all orders
 * - 2: Filter pending
 * - 3: Filter confirmed
 * - 4: Filter in progress
 * - 5: Filter ready
 * - 6: Filter delivery
 * - J: Next order
 * - K: Previous order
 * - Escape: Clear selection/close modal
 * - ?: Show shortcuts help
 */
export const useDashboardShortcuts = (
  handlers: ShortcutHandlers,
  options: UseDashboardShortcutsOptions = {}
) => {
  const { enabled = true, showToasts = false } = options;

  const showShortcutsHelp = useCallback(() => {
    toast.info('Keyboard Shortcuts', {
      description: `
R - Refresh | P - Print | F - Search
1-6 - Filter by status | J/K - Navigate
? - Show this help
      `.trim(),
      duration: 5000,
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        // Allow Escape to work even in inputs
        if (event.key !== 'Escape') {
          return;
        }
      }

      // Don't trigger if modifier keys are pressed (except for ?)
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'r':
          event.preventDefault();
          handlers.onRefresh?.();
          if (showToasts) toast.info('Refreshing...');
          break;

        case 'p':
          event.preventDefault();
          handlers.onPrint?.();
          break;

        case 'f':
        case '/':
          event.preventDefault();
          handlers.onSearch?.();
          // Focus the search input
          const searchInput = document.querySelector('input[type="text"], input[type="search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
          break;

        case '1':
          event.preventDefault();
          handlers.onFilterAll?.();
          if (showToasts) toast.info('Filter: All');
          break;

        case '2':
          event.preventDefault();
          handlers.onFilterPending?.();
          if (showToasts) toast.info('Filter: Pending');
          break;

        case '3':
          event.preventDefault();
          handlers.onFilterConfirmed?.();
          if (showToasts) toast.info('Filter: Confirmed');
          break;

        case '4':
          event.preventDefault();
          handlers.onFilterInProgress?.();
          if (showToasts) toast.info('Filter: In Progress');
          break;

        case '5':
          event.preventDefault();
          handlers.onFilterReady?.();
          if (showToasts) toast.info('Filter: Ready');
          break;

        case '6':
          event.preventDefault();
          handlers.onFilterDelivery?.();
          if (showToasts) toast.info('Filter: Delivery');
          break;

        case 'j':
          event.preventDefault();
          handlers.onNextOrder?.();
          break;

        case 'k':
          event.preventDefault();
          handlers.onPrevOrder?.();
          break;

        case 'escape':
          handlers.onEscape?.();
          break;

        case '?':
          event.preventDefault();
          showShortcutsHelp();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handlers, showToasts, showShortcutsHelp]);

  return { showShortcutsHelp };
};

export default useDashboardShortcuts;

