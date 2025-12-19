/**
 * Filter Panel Component
 * Collapsible filter panel with quick filters and preset saving
 */

import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { OrderFilters } from './OrderFilters';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
  onClearAll?: () => void;
  className?: string;
  showQuickFilters?: boolean;
  showSavePreset?: boolean;
}

const QUICK_FILTERS = [
  {
    id: 'today',
    label: { es: "Órdenes de Hoy", en: "Today's Orders" },
    filters: {
      dateNeededFilter: 'today' as const,
    },
  },
  {
    id: 'pending_payment',
    label: { es: 'Pago Pendiente', en: 'Pending Payment' },
    filters: {
      paymentStatus: ['pending' as const],
    },
  },
  {
    id: 'ready_pickup',
    label: { es: 'Listos para Recoger', en: 'Ready for Pickup' },
    filters: {
      status: ['ready' as const],
      deliveryOption: 'pickup' as const,
    },
  },
  {
    id: 'this_week',
    label: { es: 'Esta Semana', en: 'This Week' },
    filters: {
      dateNeededFilter: 'this_week' as const,
    },
  },
];

export const FilterPanel = ({
  filters,
  onFiltersChange,
  onClearAll,
  className,
  showQuickFilters = true,
  showSavePreset = false,
}: FilterPanelProps) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleQuickFilter = (quickFilter: typeof QUICK_FILTERS[0]) => {
    onFiltersChange({
      ...filters,
      ...quickFilter.filters,
    });
  };

  const handleSavePreset = () => {
    // Save filter preset to localStorage or backend
    const preset = {
      name: prompt(t('Nombre del filtro', 'Filter name')) || 'Untitled',
      filters,
      createdAt: new Date().toISOString(),
    };
    
    const presets = JSON.parse(
      localStorage.getItem('order_filter_presets') || '[]'
    );
    presets.push(preset);
    localStorage.setItem('order_filter_presets', JSON.stringify(presets));
    
    alert(t('Filtro guardado', 'Filter saved'));
  };

  const content = (
    <div className="space-y-6">
      {/* Quick Filters */}
      {showQuickFilters && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">
            {t('Filtros Rápidos', 'Quick Filters')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {QUICK_FILTERS.map((quickFilter) => (
              <Button
                key={quickFilter.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickFilter(quickFilter)}
                className="text-xs"
              >
                {t(quickFilter.label.es, quickFilter.label.en)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {t('Filtros', 'Filters')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        {isExpanded && (
          <OrderFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            onClearAll={onClearAll}
          />
        )}
      </div>

      {/* Save Preset */}
      {showSavePreset && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleSavePreset}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          {t('Guardar Filtro', 'Save Filter')}
        </Button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className={className}>
            <Filter className="mr-2 h-4 w-4" />
            {t('Filtros', 'Filters')}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>{t('Filtros de Órdenes', 'Order Filters')}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className={cn('border rounded-lg p-4 bg-card', className)}>
      {content}
    </div>
  );
};
