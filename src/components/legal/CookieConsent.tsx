/**
 * Cookie Consent Banner
 * Shows on first visit, allows accept/reject of non-essential cookies
 */

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_PREFERENCES_KEY = 'cookie_preferences';

interface CookiePreferences {
  essential: boolean; // Always true, cannot be disabled
  analytics: boolean;
  functional: boolean;
}

export const CookieConsent = () => {
  const { t, language } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    functional: false,
  });

  const isSpanish = language === 'es';

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setShowBanner(true);
    } else {
      // Load saved preferences
      const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (saved) {
        try {
          setPreferences(JSON.parse(saved));
        } catch (e) {
          console.error('Error parsing cookie preferences:', e);
        }
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      functional: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectNonEssential = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      functional: false,
    };
    savePreferences(onlyEssential);
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowDetails(true);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowDetails(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    
    // Apply preferences
    applyCookiePreferences(prefs);
    
    // Trigger custom event for analytics
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: prefs }));
  };

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Enable/disable analytics based on preference
    if (prefs.analytics) {
      // Enable Google Analytics if available
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      }
    } else {
      // Disable analytics
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <Card className={cn(
        "max-w-4xl mx-auto shadow-lg pointer-events-auto",
        "border-2 border-primary/20"
      )}>
        {!showDetails ? (
          <div className="p-6">
            <div className="flex items-start gap-4">
              <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  {isSpanish ? 'Uso de Cookies' : 'Cookie Usage'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isSpanish
                    ? 'Utilizamos cookies para mejorar su experiencia, analizar el tráfico del sitio y personalizar el contenido. Puede aceptar todas las cookies o rechazar las no esenciales.'
                    : 'We use cookies to enhance your experience, analyze site traffic, and personalize content. You can accept all cookies or reject non-essential ones.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleAcceptAll} size="sm" className="min-h-[44px]">
                    {isSpanish ? 'Aceptar Todas' : 'Accept All'}
                  </Button>
                  <Button
                    onClick={handleRejectNonEssential}
                    variant="outline"
                    size="sm"
                    className="min-h-[44px]"
                  >
                    {isSpanish ? 'Rechazar No Esenciales' : 'Reject Non-Essential'}
                  </Button>
                  <Button
                    onClick={handleCustomize}
                    variant="ghost"
                    size="sm"
                    className="min-h-[44px]"
                  >
                    {isSpanish ? 'Personalizar' : 'Customize'}
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/legal/cookie-policy'}
                    variant="link"
                    size="sm"
                    className="min-h-[44px]"
                  >
                    {isSpanish ? 'Más Información' : 'Learn More'}
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBanner(false)}
                className="h-6 w-6 flex-shrink-0"
                aria-label={isSpanish ? 'Cerrar' : 'Close'}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {isSpanish ? 'Preferencias de Cookies' : 'Cookie Preferences'}
            </h3>
            <div className="space-y-4 mb-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">
                    {isSpanish ? 'Cookies Esenciales' : 'Essential Cookies'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isSpanish
                      ? 'Necesarias para el funcionamiento del sitio'
                      : 'Required for website functionality'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.essential}
                  disabled
                  className="h-5 w-5"
                  aria-label={isSpanish ? 'Cookies esenciales' : 'Essential cookies'}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">
                    {isSpanish ? 'Cookies Analíticas' : 'Analytics Cookies'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isSpanish
                      ? 'Nos ayudan a entender cómo usa el sitio'
                      : 'Help us understand how you use the site'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences({ ...preferences, analytics: e.target.checked })
                  }
                  className="h-5 w-5"
                  aria-label={isSpanish ? 'Cookies analíticas' : 'Analytics cookies'}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">
                    {isSpanish ? 'Cookies de Funcionalidad' : 'Functionality Cookies'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isSpanish
                      ? 'Mejoran la funcionalidad y personalización'
                      : 'Enhance functionality and personalization'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) =>
                    setPreferences({ ...preferences, functional: e.target.checked })
                  }
                  className="h-5 w-5"
                  aria-label={isSpanish ? 'Cookies de funcionalidad' : 'Functionality cookies'}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSavePreferences} size="sm" className="min-h-[44px]">
                {isSpanish ? 'Guardar Preferencias' : 'Save Preferences'}
              </Button>
              <Button
                onClick={() => setShowDetails(false)}
                variant="outline"
                size="sm"
                className="min-h-[44px]"
              >
                {isSpanish ? 'Cancelar' : 'Cancel'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// Helper function to check if analytics is allowed
export function isAnalyticsAllowed(): boolean {
  const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (!saved) return false;
  
  try {
    const prefs: CookiePreferences = JSON.parse(saved);
    return prefs.analytics === true;
  } catch {
    return false;
  }
}

// Type declaration for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
