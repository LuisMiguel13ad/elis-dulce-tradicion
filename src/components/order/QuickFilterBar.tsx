/**
 * Quick Filter Bar for Kitchen Display
 * Simplified filter controls for today's orders
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { OrderStatus } from '@/types/orderState';
import { cn } from '@/lib/utils';

interface QuickFilterBarProps {
  activeStatus?: OrderStatus | 'all';
  onStatusChange: (status: OrderStatus | 'all') => void;
  orderCounts?: Record<OrderStatus | 'all', number>;
  className?: string;
}

const STATUS_OPTIONS: (OrderStatus | 'all')[] = [
  'all',
  'pending',
  'confirmed',
  'in_progress',
  'ready',
];

export const QuickFilterBar = ({
  activeStatus = 'all',
  onStatusChange,
  orderCounts,
  className,
}: QuickFilterBarProps) => {
  const { t } = useLanguage();

  const statusLabels: Record<string, { es: string; en: string }> = {
    all: { es: 'Todas', en: 'All' },
    pending: { es: 'Pendientes', en: 'Pending' },
    confirmed: { es: 'Confirmadas', en: 'Confirmed' },
    in_progress: { es: 'En Proceso', en: 'In Progress' },
    ready: { es: 'Listas', en: 'Ready' },
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {STATUS_OPTIONS.map((status) => (
        <Button
          key={status}
          variant={activeStatus === status ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange(status)}
          className="min-h-[44px]"
        >
          {t(statusLabels[status].es, statusLabels[status].en)}
          {orderCounts && orderCounts[status] !== undefined && (
            <Badge
              variant="secondary"
              className="ml-2"
            >
              {orderCounts[status]}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};
