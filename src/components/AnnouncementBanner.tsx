/**
 * Announcement Banner Component
 * Displays site-wide announcements with dismiss functionality
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Info, CheckCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

// Safe import with error handling
let useAnnouncements: any;
try {
  // Dynamic import to avoid errors if CMS hooks don't exist
  const cmsHooks = require('@/lib/hooks/useCMS');
  useAnnouncements = cmsHooks.useAnnouncements || (() => ({ data: [], isLoading: false, error: null }));
} catch (error) {
  // CMS hooks not available - component will gracefully degrade
  useAnnouncements = () => ({ data: [], isLoading: false, error: null });
}

const ANNOUNCEMENT_STORAGE_KEY = 'dismissed_announcements';

export function AnnouncementBanner() {
  try {
    const { t, language } = useLanguage();
    const isSpanish = language === 'es';
    const { data: announcements = [], isLoading, error } = useAnnouncements();
    const [dismissedIds, setDismissedIds] = useState<number[]>([]);

    useEffect(() => {
      // Load dismissed announcements from localStorage
      const stored = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
      if (stored) {
        try {
          setDismissedIds(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing dismissed announcements:', e);
        }
      }
    }, []);

    // Don't render if there's an error or still loading (to prevent blank page)
    if (error || isLoading) {
      return null;
    }

    // Filter out dismissed announcements
    const activeAnnouncements = announcements.filter(
      (announcement) =>
        announcement.is_active &&
        !dismissedIds.includes(announcement.id) &&
        (!announcement.start_date ||
          new Date(announcement.start_date) <= new Date()) &&
        (!announcement.end_date || new Date(announcement.end_date) >= new Date())
    );

    if (activeAnnouncements.length === 0) {
      return null;
    }

    const handleDismiss = (id: number) => {
      const newDismissed = [...dismissedIds, id];
      setDismissedIds(newDismissed);
      localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(newDismissed));
    };

    const getIcon = (type: string) => {
      switch (type) {
        case 'warning':
          return <AlertCircle className="h-5 w-5" />;
        case 'success':
          return <CheckCircle className="h-5 w-5" />;
        case 'holiday':
          return <Calendar className="h-5 w-5" />;
        default:
          return <Info className="h-5 w-5" />;
      }
    };

    const getStyles = (type: string) => {
      switch (type) {
        case 'warning':
          return {
            bg: 'bg-yellow-50 dark:bg-yellow-950',
            border: 'border-yellow-200 dark:border-yellow-800',
            text: 'text-yellow-800 dark:text-yellow-200',
            icon: 'text-yellow-600 dark:text-yellow-400',
          };
        case 'success':
          return {
            bg: 'bg-green-50 dark:bg-green-950',
            border: 'border-green-200 dark:border-green-800',
            text: 'text-green-800 dark:text-green-200',
            icon: 'text-green-600 dark:text-green-400',
          };
        case 'holiday':
          return {
            bg: 'bg-purple-50 dark:bg-purple-950',
            border: 'border-purple-200 dark:border-purple-800',
            text: 'text-purple-800 dark:text-purple-200',
            icon: 'text-purple-600 dark:text-purple-400',
          };
        default:
          return {
            bg: 'bg-blue-50 dark:bg-blue-950',
            border: 'border-blue-200 dark:border-blue-800',
            text: 'text-blue-800 dark:text-blue-200',
            icon: 'text-blue-600 dark:text-blue-400',
          };
      }
    };

    return (
      <div className="fixed top-0 left-0 right-0 z-50 space-y-2 p-2">
        {activeAnnouncements.map((announcement) => {
          const styles = getStyles(announcement.type);
          return (
            <div
              key={announcement.id}
              className={cn(
                'mx-auto max-w-7xl rounded-lg border p-4 shadow-lg',
                styles.bg,
                styles.border
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('flex-shrink-0', styles.icon)}>
                  {getIcon(announcement.type)}
                </div>
                <div className="flex-1">
                  <h3 className={cn('font-semibold', styles.text)}>
                    {isSpanish
                      ? announcement.title_es
                      : announcement.title_en}
                  </h3>
                  <p className={cn('mt-1 text-sm', styles.text)}>
                    {isSpanish
                      ? announcement.message_es
                      : announcement.message_en}
                  </p>
                </div>
                {announcement.is_dismissible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(announcement.id)}
                    className={cn('h-6 w-6 flex-shrink-0 p-0', styles.text)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  } catch (error) {
    // Gracefully handle any errors - don't break the app
    console.warn('AnnouncementBanner error:', error);
    return null;
  }
}
