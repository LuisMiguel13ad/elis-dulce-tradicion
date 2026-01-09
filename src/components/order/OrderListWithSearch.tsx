
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { SearchBar } from '@/components/shared/SearchBar';
import { OrderFilters } from './OrderFilters';
import { SortControls } from './SortControls';
import { ExportButton } from './ExportButton';
import { useOrderSearch } from '@/hooks/useOrderSearch';
import { Order } from '@/types/order';
import { formatPrice } from '@/lib/pricing';
import { formatDate, formatTime } from '@/lib/i18n-utils';
import { Loader2, ChevronLeft, ChevronRight, PackageOpen, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    handleSearch,
    handleFiltersChange,
    handleSortChange,
    handlePageChange,
  } = useOrderSearch({
    defaultSort: { field: 'created_at', direction: 'desc' },
    pageSize: 10,
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-700 border-none',
      confirmed: 'bg-blue-100 text-blue-700 border-none',
      in_progress: 'bg-indigo-100 text-indigo-700 border-none',
      ready: 'bg-green-100 text-green-700 border-none',
      completed: 'bg-gray-100 text-gray-700 border-none',
      cancelled: 'bg-red-100 text-red-700 border-none',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-none';
  };

  // Safe check for empty state (includes loading finish + no data)
  const isEmpty = !isLoading && (!orders || orders.length === 0);

  return (
    <div className={cn('space-y-6', className)}>

      {/* 1. Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <SearchBar
            onSearch={handleSearch}
            placeholder={t('Buscar por # orden, cliente...', 'Search by order #, customer...')}
            initialValue={searchQuery}
            className="w-full bg-white border-0 shadow-sm h-12 rounded-2xl px-5 text-base focus-visible:ring-1 focus-visible:ring-[#C6A649]"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 gap-2 rounded-2xl border-0 bg-white shadow-sm hover:bg-gray-50 px-4 text-gray-600">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">{t('Filtros', 'Filters')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px] p-4 rounded-2xl border-0 shadow-xl bg-white/95 backdrop-blur-md">
              <OrderFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </DropdownMenuContent>
          </DropdownMenu>

          <SortControls
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
          />

          {showExport && <ExportButton orders={orders} filters={filters} sortConfig={sortConfig} />}
        </div>
      </div>

      {/* 2. Order List Content */}
      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl min-h-[600px] flex flex-col">
        {/* Table Header (Visual only for large screens) */}
        {!isEmpty && (
          <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_auto] gap-4 px-8 py-4 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <div>{t('Orden / Estado', 'Order / Status')}</div>
            <div>{t('Cliente / Detalles', 'Customer / Details')}</div>
            <div className="text-right">{t('Total', 'Total')}</div>
            <div className="w-8"></div>
          </div>
        )}

        <CardContent className="p-0 flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-gray-300">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-[#C6A649]" />
              <p className="font-medium text-gray-400 animate-pulse">{t('Cargando pedidos...', 'Loading orders...')}</p>
            </div>
          ) : isEmpty ? (
            // --- PLACEHOLDER STATE (NO ORDERS) ---
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center px-4">
              <div className="h-32 w-32 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                <PackageOpen className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('No hay pedidos encontrados', 'No orders found')}</h3>
              <p className="text-gray-500 max-w-sm">
                {searchQuery
                  ? t('No encontramos resultados para tu búsqueda. Intenta con otros términos.', 'We couldn\'t find any results for your search. Try different keywords.')
                  : t('Aún no hay pedidos registrados en el sistema.', 'There are no orders registered in the system yet.')}
              </p>
              {Object.keys(filters).length > 0 && (
                <Button variant="link" onClick={() => handleFiltersChange({})} className="mt-4 text-[#C6A649]">
                  {t('Limpiar filtros', 'Clear filters')}
                </Button>
              )}
            </div>
          ) : (
            // --- ORDER LIST ---
            <div className="flex flex-col">
              {orders.map((order: Order) => (
                <div
                  key={order.id}
                  onClick={() => onOrderClick?.(order)}
                  className="group relative grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_auto] gap-4 p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-all cursor-pointer items-center"
                >
                  {/* Left Accent */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-[3px] transition-colors",
                    order.status === 'pending' ? 'bg-orange-400' :
                      order.status === 'ready' ? 'bg-green-400' :
                        'bg-transparent group-hover:bg-[#C6A649]'
                  )} />

                  {/* Col 1: ID & Status */}
                  <div className="flex items-center justify-between md:block">
                    <span className="text-lg font-bold text-gray-800">#{order.order_number}</span>
                    <div className="md:mt-2">
                      <Badge className={cn("px-2.5 py-0.5 text-xs font-semibold rounded-lg", getStatusColor(order.status))}>
                        {t(`status.${order.status}`, order.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Col 2: Customer & Info */}
                  <div>
                    <h4 className="font-bold text-gray-700 text-base mb-1">{order.customer_name}</h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      {order.date_needed && (
                        <span className="flex items-center gap-1.5 bg-gray-100/50 px-2 py-0.5 rounded-md">
                          {formatDate(order.date_needed, undefined, language)}
                          {order.time_needed && ` • ${formatTime(order.time_needed, language)}`}
                        </span>
                      )}
                      <span className="text-gray-300 hidden md:inline">|</span>
                      <span className="font-medium text-gray-500">
                        {order.cake_size} • {order.filling}
                      </span>
                    </div>
                  </div>

                  {/* Col 3: Price */}
                  <div className="flex items-center justify-between md:block md:text-right">
                    <p className="text-lg font-bold text-gray-900 group-hover:text-[#C6A649] transition-colors">
                      {formatPrice(typeof order.total_amount === 'number' ? order.total_amount : parseFloat(order.total_amount || '0'))}
                    </p>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      {order.payment_status || 'Pending'}
                    </span>
                  </div>

                  {/* Col 4: Arrow */}
                  <div className="hidden md:flex justify-end">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Footer / Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="border-t border-gray-100 bg-gray-50/30 p-4 flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="rounded-full hover:bg-white hover:shadow-sm"
            >
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            </Button>
            <div className="mx-4 text-sm font-medium text-gray-500">
              {t('Página', 'Page')} {page} {t('de', 'of')} {pagination.totalPages}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pagination.totalPages}
              className="rounded-full hover:bg-white hover:shadow-sm"
            >
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
