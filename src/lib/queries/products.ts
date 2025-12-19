/**
 * React Query hooks for products
 * Long cache time since products don't change frequently
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryClient';

// Get all products
export const useProducts = (filters?: { category?: string; search?: string }) => {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => api.getProducts(),
    staleTime: 1000 * 60 * 60, // 1 hour - products rarely change
    gcTime: 1000 * 60 * 60 * 24, // 24 hours cache
  });
};

// Get single product
export const useProduct = (id: number | null) => {
  return useQuery({
    queryKey: queryKeys.products.detail(id!),
    queryFn: () => api.getProduct(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

// Create product mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: any) => api.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });
};
