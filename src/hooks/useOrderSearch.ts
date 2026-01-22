/**
 * Hook for order search with URL state management
 * Refactored to use Client-Side Filtering since /orders/search endpoint is unreliable
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  // ... state ...
  const [filters, setFilters] = useState<OrderFilters>(
    options.defaultFilters || {}
  );
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    options.defaultSort || { field: 'created_at', direction: 'desc' }
  );
  const [page, setPage] = useState(1);
  const pageSize = options.pageSize || 20;

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Listen for mock updates (DevTools)
  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'all'] });
    };
    window.addEventListener('mock-order-update', handleUpdate);
    return () => window.removeEventListener('mock-order-update', handleUpdate);
  }, [queryClient]);

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
    (newFilters: OrderFilters, newSort: SortConfig, currentSearchQuery?: string) => {
      const params = new URLSearchParams();

      if (currentSearchQuery) params.set('q', currentSearchQuery);
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

      setSearchParams(params, { replace: true });
    },
    [page, setSearchParams]
  );

  // FETCH ALL ORDERS (Client-side filtering fallback)
  const {
    data: allOrders,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['orders', 'all'], // General key since we filter client side
    queryFn: async () => {
      try {
        // Use getAllOrders which is known to work
        const res = await api.getAllOrders();
        // If it returns an object with data property, use that, otherwise assume array
        const list = Array.isArray(res) ? res : ((res as any).data || []);
        return list;
      } catch (err) {
        console.error("Failed to fetch orders, defaulting to empty:", err);
        return []; // Return empty array on error to prevent UI crash
      }
    },
    staleTime: 30000,
    initialData: [],
  });

  // FILTERING LOGIC
  const filteredOrders = useMemo(() => {
    if (!allOrders || !Array.isArray(allOrders)) return [];

    return allOrders.filter((order: any) => {
      // 1. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          order.order_number?.toLowerCase().includes(q) ||
          order.customer_name?.toLowerCase().includes(q) ||
          order.phone?.includes(q) ||
          order.email?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 2. Status Filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(order.status)) return false;
      }

      // 3. Payment Status
      if (filters.paymentStatus && filters.paymentStatus.length > 0) {
        if (!filters.paymentStatus.includes(order.payment_status)) return false;
      }

      // 4. Delivery Option
      if (filters.deliveryOption && filters.deliveryOption !== 'all') {
        if (order.delivery_option !== filters.deliveryOption) return false;
      }

      // 5. Date Range (Date Needed)
      if (filters.dateRange?.from) {
        const orderDate = new Date(order.date_needed);
        const fromDate = new Date(filters.dateRange.from);
        if (orderDate < fromDate) return false;

        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          // Set to end of day for inclusive comparison
          toDate.setHours(23, 59, 59, 999);
          if (orderDate > toDate) return false;
        }
      }

      return true;
    });
  }, [allOrders, searchQuery, filters]);

  // SORTING LOGIC
  const sortedOrders = useMemo(() => {
    if (!filteredOrders) return [];
    return [...filteredOrders].sort((a: any, b: any) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [filteredOrders, sortConfig]);

  // PAGINATION LOGIC
  const paginatedOrders = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedOrders.slice(startIndex, startIndex + pageSize);
  }, [sortedOrders, page, pageSize]);

  const total = filteredOrders.length;
  const totalPages = Math.ceil(total / pageSize);

  // Handlers
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
    data: paginatedOrders,
    pagination: {
      total,
      page,
      pageSize,
      totalPages
    },
    isLoading,
    error,
    handleSearch,
    handleFiltersChange,
    handleSortChange,
    handlePageChange,
    refetch,
  };
}
