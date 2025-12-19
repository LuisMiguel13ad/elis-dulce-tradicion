/**
 * React Query hooks for capacity
 * Short cache time since capacity changes frequently
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryClient';

// Get available dates
export const useAvailableDates = (days?: number) => {
  return useQuery({
    queryKey: queryKeys.capacity.availableDates(days),
    queryFn: () => api.getAvailableDates(days),
    staleTime: 1000 * 60 * 5, // 5 minutes - capacity changes frequently
    gcTime: 1000 * 60 * 15, // 15 minutes cache
    refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
  });
};

// Get capacity for specific date
export const useDateCapacity = (date: string | null) => {
  return useQuery({
    queryKey: queryKeys.capacity.date(date!),
    queryFn: () => api.getDateCapacity(date!),
    enabled: !!date,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get business hours
export const useBusinessHours = () => {
  return useQuery({
    queryKey: queryKeys.capacity.businessHours(),
    queryFn: () => api.getBusinessHours(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - business hours rarely change
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days cache
  });
};

// Get holidays
export const useHolidays = () => {
  return useQuery({
    queryKey: queryKeys.capacity.holidays(),
    queryFn: () => api.getHolidays(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 30, // 30 days cache
  });
};
