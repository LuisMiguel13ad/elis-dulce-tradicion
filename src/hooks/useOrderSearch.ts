/**
 * Hook for order search with URL state management
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { OrderFilters } from '@/components/order/OrderFilters';
import { SortConfig } from '@/components/order/SortControls';

interface UseOrderSearchOptions {
  defaultFilters?: OrderFilters;
  defaultSort?: SortConfig;
  pageSize?: number;
}

export function useOrderSearch(options: UseOrderSearchOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<OrderFilters>(
    options.defaultFilters || {}
  );
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    options.defaultSort || { field: 'created_at', direction: 'desc' }
  );
  const [page, setPage] = useState(1);
  const pageSize = options.pageSize || 20;

  // Parse URL params on mount
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const status = searchParams.get('status')?.split(',').filter(Boolean) || [];
    const paymentStatus = searchParams.get('paymentStatus')?.split(',').filter(Boolean) || [];
    const deliveryOption = searchParams.get('deliveryOption') || 'all';
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const sortField = searchParams.get('sortField') || 'created_at';
    const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc';
    const urlPage = parseInt(searchParams.get('page') || '1');

    setSearchQuery(query);
    setFilters({
      status: status.length > 0 ? status as any : undefined,
      paymentStatus: paymentStatus.length > 0 ? paymentStatus as any : undefined,
      deliveryOption: deliveryOption as any,
      dateRange: dateFrom || dateTo ? { from: dateFrom, to: dateTo } : undefined,
    });
    setSortConfig({
      field: sortField as any,
      direction: sortDirection,
    });
    setPage(urlPage);
  }, []);

  // Update URL when filters/sort change
  const updateURL = useCallback(
    (newFilters: OrderFilters, newSort: SortConfig, searchQuery?: string) => {
      const params = new URLSearchParams();

      if (searchQuery) params.set('q', searchQuery);
      if (newFilters.status && newFilters.status.length > 0) {
        params.set('status', newFilters.status.join(','));
      }
      if (newFilters.paymentStatus && newFilters.paymentStatus.length > 0) {
        params.set('paymentStatus', newFilters.paymentStatus.join(','));
      }
      if (newFilters.deliveryOption && newFilters.deliveryOption !== 'all') {
        params.set('deliveryOption', newFilters.deliveryOption);
      }
      if (newFilters.dateRange?.from) {
        params.set('dateFrom', newFilters.dateRange.from);
      }
      if (newFilters.dateRange?.to) {
        params.set('dateTo', newFilters.dateRange.to);
      }
      params.set('sortField', newSort.field);
      params.set('sortDirection', newSort.direction);
      params.set('page', page.toString());
      params.set('limit', pageSize.toString());

      setSearchParams(params, { replace: true });
    },
    [page, pageSize, setSearchParams]
  );

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  const searchQueryKey = [
    'orders',
    'search',
    searchQuery,
    filters,
    sortConfig,
    page,
    pageSize,
  ];

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: searchQueryKey,
    queryFn: async () => {
      const result = await api.searchOrders({
        q: searchQuery || undefined,
        status: filters.status,
        paymentStatus: filters.paymentStatus,
        deliveryOption: filters.deliveryOption,
        cakeSize: filters.cakeSize,
        dateFrom: filters.dateRange?.from,
        dateTo: filters.dateRange?.to,
        dateNeededFilter: filters.dateNeededFilter,
        sortField: sortConfig.field,
        sortDirection: sortConfig.direction,
        page,
        limit: pageSize,
      });
      return result;
    },
    enabled: true,
    staleTime: 30000, // 30 seconds
  });

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setPage(1);
      updateURL(filters, sortConfig, query);
    },
    [filters, sortConfig, updateURL]
  );

  const handleFiltersChange = useCallback(
    (newFilters: OrderFilters) => {
      setFilters(newFilters);
      setPage(1);
      updateURL(newFilters, sortConfig, searchQuery);
    },
    [sortConfig, searchQuery, updateURL]
  );

  const handleSortChange = useCallback(
    (newSort: SortConfig) => {
      setSortConfig(newSort);
      setPage(1);
      updateURL(filters, newSort, searchQuery);
    },
    [filters, searchQuery, updateURL]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      updateURL(filters, sortConfig, searchQuery);
    },
    [filters, sortConfig, searchQuery, updateURL]
  );

  return {
    searchQuery,
    filters,
    sortConfig,
    page,
    pageSize,
    data: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    handleSearch,
    handleFiltersChange,
    handleSortChange,
    handlePageChange,
    refetch,
  };
}
