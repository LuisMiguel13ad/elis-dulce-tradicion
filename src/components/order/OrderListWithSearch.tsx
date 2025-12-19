/**
 * Order List with Search, Filter, and Sort
 * Complete order management interface
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { SearchBar } from '@/components/shared/SearchBar';
import { OrderFilters, OrderFilters as OrderFiltersType } from './OrderFilters';
import { FilterPanel } from './FilterPanel';
import { SortControls, SortConfig } from './SortControls';
import { ExportButton } from './ExportButton';
import { useOrderSearch } from '@/hooks/useOrderSearch';
import { Order } from '@/types/order';
import { formatPrice } from '@/lib/pricing';
import { formatDate, formatTime } from '@/lib/i18n-utils';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FixedSizeList } from 'react-window';

interface OrderListWithSearchProps {
  userRole?: 'customer' | 'baker' | 'owner' | 'admin';
  onOrderClick?: (order: Order) => void;
  showExport?: boolean;
  className?: string;
}

export const OrderListWithSearch = ({
  userRole = 'owner',
  onOrderClick,
  showExport = true,
  className,
}: OrderListWithSearchProps) => {
  const { t, language } = useLanguage();
  const {
    searchQuery,
    filters,
    sortConfig,
    page,
    pageSize,
    data: orders,
    pagination,
    isLoading,
    error,
    handleSearch,
    handleFiltersChange,
    handleSortChange,
    handlePageChange,
  } = useOrderSearch({
    defaultSort: { field: 'created_at', direction: 'desc' },
    pageSize: 20,
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">
            {t('Error al cargar órdenes', 'Error loading orders')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filter Bar */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <CardTitle>{t('Buscar y Filtrar Órdenes', 'Search and Filter Orders')}</CardTitle>
            <div className="flex gap-2">
              {showExport && <ExportButton orders={orders} filters={filters} sortConfig={sortConfig} />}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <SearchBar
            onSearch={handleSearch}
            placeholder={t('Buscar por número, cliente, teléfono...', 'Search by number, customer, phone...')}
            initialValue={searchQuery}
          />

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <OrderFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
            <div className="md:w-64">
              <FilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
                showQuickFilters={true}
                showSavePreset={userRole === 'owner' || userRole === 'admin'}
              />
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center justify-between">
            <SortControls
              sortConfig={sortConfig}
              onSortChange={handleSortChange}
            />
            {pagination && (
              <div className="text-sm text-muted-foreground">
                {t('Mostrando', 'Showing')} {(page - 1) * pageSize + 1} -{' '}
                {Math.min(page * pageSize, pagination.total)} {t('de', 'of')}{' '}
                {pagination.total}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('Órdenes', 'Orders')} ({pagination?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchQuery || Object.keys(filters).length > 0
                  ? t('No se encontraron órdenes', 'No orders found')
                  : t('No hay órdenes', 'No orders')}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {orders.map((order: Order) => (
                  <div
                    key={order.id}
                    onClick={() => onOrderClick?.(order)}
                    className={cn(
                      'p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer',
                      onOrderClick && 'cursor-pointer'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-display font-bold text-lg">
                            {order.order_number}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn(getStatusColor(order.status))}
                          >
                            {t(`status.${order.status}`, order.status)}
                          </Badge>
                        </div>
                        <div className="grid gap-1 text-sm text-muted-foreground">
                          <p>
                            <span className="font-semibold">
                              {t('Cliente', 'Customer')}:
                            </span>{' '}
                            {order.customer_name}
                          </p>
                          <p>
                            <span className="font-semibold">
                              {t('Fecha', 'Date')}:
                            </span>{' '}
                            {order.date_needed &&
                              formatDate(order.date_needed, undefined, language)}{' '}
                            {order.time_needed &&
                              formatTime(order.time_needed, language)}
                          </p>
                          <p>
                            <span className="font-semibold">
                              {t('Pastel', 'Cake')}:
                            </span>{' '}
                            {order.cake_size} • {order.filling}
                          </p>
                          {order.delivery_option && (
                            <p>
                              <span className="font-semibold">
                                {t('Entrega', 'Delivery')}:
                              </span>{' '}
                              {order.delivery_option === 'pickup'
                                ? t('Recoger', 'Pickup')
                                : t('Entrega a Domicilio', 'Delivery')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl font-bold text-primary mb-2">
                          {formatPrice(
                            typeof order.total_amount === 'number'
                              ? order.total_amount
                              : parseFloat(order.total_amount || '0')
                          )}
                        </p>
                        {order.payment_status && (
                          <Badge variant="outline" className="text-xs">
                            {order.payment_status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="min-h-[44px]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t('Anterior', 'Previous')}
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {t('Página', 'Page')} {page} {t('de', 'of')}{' '}
                    {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= pagination.totalPages}
                    className="min-h-[44px]"
                  >
                    {t('Siguiente', 'Next')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
