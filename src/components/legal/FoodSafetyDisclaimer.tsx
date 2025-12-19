/**
 * Food Safety Disclaimer Component
 * Reusable component for allergen warnings and storage instructions
 */

import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface FoodSafetyDisclaimerProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export const FoodSafetyDisclaimer = ({
  className,
  variant = 'default',
}: FoodSafetyDisclaimerProps) => {
  const { t, language } = useLanguage();
  const isSpanish = language === 'es';

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3',
          className
        )}
        role="alert"
        aria-label={isSpanish ? 'Advertencia de seguridad alimentaria' : 'Food safety warning'}
      >
        <p className="text-xs text-yellow-700 dark:text-yellow-300">
          {isSpanish
            ? '⚠️ Contiene alérgenos. Consumir dentro de 3 días. Refrigerar si no se consume inmediatamente.'
            : '⚠️ Contains allergens. Consume within 3 days. Refrigerate if not consumed immediately.'}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-4',
        className
      )}
      role="alert"
      aria-label={isSpanish ? 'Advertencia de seguridad alimentaria' : 'Food safety warning'}
    >
      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        {isSpanish ? 'Advertencia de Seguridad Alimentaria' : 'Food Safety Warning'}
      </h4>
      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
        <li>
          {isSpanish
            ? 'Nuestros productos pueden contener alérgenos comunes, incluyendo: trigo, huevos, leche, soja, nueces, maní y otros ingredientes que pueden causar reacciones alérgicas.'
            : 'Our products may contain common allergens, including: wheat, eggs, milk, soy, tree nuts, peanuts, and other ingredients that may cause allergic reactions.'}
        </li>
        <li>
          {isSpanish
            ? 'Aunque hacemos nuestro mejor esfuerzo para evitar la contaminación cruzada, no podemos garantizar que nuestros productos estén completamente libres de alérgenos.'
            : 'While we make our best effort to avoid cross-contamination, we cannot guarantee that our products are completely allergen-free.'}
        </li>
        <li>
          {isSpanish
            ? 'Consumir dentro de 3 días de la recogida/entrega para mejor calidad y frescura.'
            : 'Consume within 3 days of pickup/delivery for best quality and freshness.'}
        </li>
        <li>
          {isSpanish
            ? 'Almacenar en refrigerador si no se consume inmediatamente. Mantener a temperatura ambiente solo si se consumirá el mismo día.'
            : 'Store in refrigerator if not consumed immediately. Keep at room temperature only if consuming the same day.'}
        </li>
        <li>
          {isSpanish
            ? 'Por favor, informe a nuestro personal sobre cualquier alergia alimentaria antes de realizar su pedido.'
            : 'Please inform our staff of any food allergies before placing your order.'}
        </li>
      </ul>
    </div>
  );
};
