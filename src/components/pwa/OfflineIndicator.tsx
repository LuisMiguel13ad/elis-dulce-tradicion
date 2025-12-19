import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export const OfflineIndicator = () => {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    if (!navigator.onLine) {
      setShowOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm font-medium"
        >
          <div className="container mx-auto flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span>
              {t(
                'Sin conexión. Algunas funciones pueden no estar disponibles.',
                'No connection. Some features may not be available.'
              )}
            </span>
          </div>
        </motion.div>
      )}
      {!isOnline && showOffline && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-40 bg-background border border-border rounded-lg shadow-lg p-3 md:left-auto md:right-4 md:w-80"
        >
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {t('Modo Sin Conexión', 'Offline Mode')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(
                  'Los cambios se guardarán cuando vuelvas a tener conexión.',
                  'Changes will be saved when you reconnect.'
                )}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
