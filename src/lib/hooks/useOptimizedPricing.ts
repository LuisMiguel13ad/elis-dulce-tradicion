/**
 * Optimized pricing calculation hook with debouncing and memoization
 */
import { useMemo, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { useCalculatePrice } from '@/lib/queries/pricing';
import type { OrderDetails, PricingBreakdown } from '@/lib/pricing';

interface UseOptimizedPricingProps {
  size: string;
  filling: string;
  theme: string;
  deliveryOption: 'pickup' | 'delivery';
  deliveryAddress?: string;
  zipCode?: string;
  promoCode?: string;
}

/**
 * Optimized pricing hook with debouncing
 * Debounces price calculations to avoid excessive API calls
 */
export function useOptimizedPricing({
  size,
  filling,
  theme,
  deliveryOption,
  deliveryAddress,
  zipCode,
  promoCode,
}: UseOptimizedPricingProps) {
  // Debounce inputs to avoid excessive calculations
  const debouncedSize = useDebounce(size, 500);
  const debouncedFilling = useDebounce(filling, 500);
  const debouncedTheme = useDebounce(theme, 500);
  const debouncedZipCode = useDebounce(zipCode, 500);
  const debouncedPromoCode = useDebounce(promoCode, 500);

  // Memoize pricing data object
  const pricingData = useMemo(
    () => ({
      size: debouncedSize,
      filling: debouncedFilling,
      theme: debouncedTheme,
      deliveryOption,
      deliveryAddress,
      zipCode: debouncedZipCode,
      promoCode: debouncedPromoCode,
    }),
    [debouncedSize, debouncedFilling, debouncedTheme, deliveryOption, deliveryAddress, debouncedZipCode, debouncedPromoCode]
  );

  // Only calculate if all required fields are present
  const shouldCalculate = !!debouncedSize && !!debouncedFilling && !!debouncedTheme;

  // Use React Query for caching
  const { data, isLoading, error } = useCalculatePrice(pricingData, shouldCalculate);

  return {
    pricingBreakdown: data as PricingBreakdown | undefined,
    isLoading,
    error,
  };
}
