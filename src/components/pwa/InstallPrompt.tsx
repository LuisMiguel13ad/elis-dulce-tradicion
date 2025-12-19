import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt = () => {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return; // Already installed
      }
      
      // Check if user has dismissed before (localStorage)
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    // Reset after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-start gap-4">
        <div className="flex-1">
          <h3 className="font-display font-bold text-foreground mb-1">
            {t('Instalar App', 'Install App')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(
              'Instala nuestra app para una experiencia más rápida y acceso offline.',
              'Install our app for a faster experience and offline access.'
            )}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-muted transition-smooth"
          aria-label={t('Cerrar', 'Close')}
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="whitespace-nowrap"
          >
            {t('Instalar', 'Install')}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            {t('Ahora no', 'Not now')}
          </Button>
        </div>
      </div>
    </div>
  );
};
