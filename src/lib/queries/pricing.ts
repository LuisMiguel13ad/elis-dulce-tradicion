/**
 * React Query hooks for pricing
 * Aggressive caching since pricing rarely changes
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryClient';

// Calculate price
export const useCalculatePrice = (pricingData: any, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.pricing.calculate(pricingData),
    queryFn: () => api.calculatePrice(pricingData),
    enabled: enabled && !!pricingData?.size && !!pricingData?.filling && !!pricingData?.theme,
    staleTime: 1000 * 60 * 60, // 1 hour - pricing doesn't change often
    gcTime: 1000 * 60 * 60 * 2, // 2 hours cache
  });
};

// Get current pricing
export const useCurrentPricing = () => {
  return useQuery({
    queryKey: queryKeys.pricing.current(),
    queryFn: () => api.getCurrentPricing(),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours cache
  });
};
