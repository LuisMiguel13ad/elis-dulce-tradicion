import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Mobile-optimized bottom sheet component
 * Slides up from bottom on mobile devices
 */
export const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) => {
  const { t } = useLanguage();

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl',
              'max-h-[90vh] overflow-hidden flex flex-col',
              className
            )}
          >
            {/* Handle bar */}
            <div className="flex items-center justify-center pt-2 pb-1">
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-display text-lg font-bold text-foreground">
                  {title}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                  aria-label={t('Cerrar', 'Close')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
