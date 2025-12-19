/**
 * Sort Controls Component
 * Sort orders by various fields with visual indicators
 */

import { useState, useEffect } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export type SortField =
  | 'date_needed'
  | 'created_at'
  | 'order_number'
  | 'total_amount'
  | 'customer_name';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

interface SortControlsProps {
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  className?: string;
}

const SORT_OPTIONS: {
  field: SortField;
  label: { es: string; en: string };
}[] = [
  {
    field: 'date_needed',
    label: { es: 'Fecha Necesaria', en: 'Date Needed' },
  },
  {
    field: 'created_at',
    label: { es: 'Fecha de Creación', en: 'Created Date' },
  },
  {
    field: 'order_number',
    label: { es: 'Número de Orden', en: 'Order Number' },
  },
  {
    field: 'total_amount',
    label: { es: 'Monto Total', en: 'Total Amount' },
  },
  {
    field: 'customer_name',
    label: { es: 'Nombre del Cliente', en: 'Customer Name' },
  },
];

const SORT_STORAGE_KEY = 'order_sort_preference';

export const SortControls = ({
  sortConfig,
  onSortChange,
  className,
}: SortControlsProps) => {
  const { t, language } = useLanguage();
  const [localSort, setLocalSort] = useState<SortConfig>(sortConfig);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SORT_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLocalSort(parsed);
        onSortChange(parsed);
      } catch (e) {
        console.error('Error parsing sort preference:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(localSort));
  }, [localSort]);

  const handleSort = (field: SortField) => {
    const newSort: SortConfig = {
      field,
      direction:
        localSort.field === field && localSort.direction === 'asc'
          ? 'desc'
          : 'asc',
    };
    setLocalSort(newSort);
    onSortChange(newSort);
  };

  const currentOption = SORT_OPTIONS.find((o) => o.field === localSort.field);
  const SortIcon =
    localSort.direction === 'asc' ? ArrowUp : ArrowDown;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowUpDown className="h-4 w-4" />
            {t('Ordenar por', 'Sort by')}
            {currentOption && (
              <>
                :{' '}
                <span className="font-semibold">
                  {t(currentOption.label.es, currentOption.label.en)}
                </span>
                <SortIcon className="h-4 w-4" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {SORT_OPTIONS.map((option) => {
            const isActive = localSort.field === option.field;
            return (
              <DropdownMenuItem
                key={option.field}
                onClick={() => handleSort(option.field)}
                className={cn(
                  'flex items-center justify-between cursor-pointer',
                  isActive && 'bg-accent'
                )}
              >
                <span>{t(option.label.es, option.label.en)}</span>
                {isActive && (
                  <SortIcon className="h-4 w-4 ml-2" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
