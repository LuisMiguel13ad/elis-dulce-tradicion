import { motion } from 'framer-motion';
import { SwipeableCard } from './SwipeableCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Package } from 'lucide-react';
import { Order } from '@/types/order';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate, formatTime } from '@/lib/i18n-utils';

interface MobileOrderCardProps {
  order: Order;
  onStatusUpdate?: (orderId: number, status: string) => void;
  onView?: (orderId: number) => void;
}

/**
 * Mobile-optimized order card with swipe gestures
 */
export const MobileOrderCard = ({
  order,
  onStatusUpdate,
  onView,
}: MobileOrderCardProps) => {
  const { t, language } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'confirmed':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'in_progress':
        return <Package className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <SwipeableCard
      onSwipeRight={() => onStatusUpdate?.(order.id!, 'confirmed')}
      onSwipeLeft={() => onStatusUpdate?.(order.id!, 'ready')}
      leftAction={<CheckCircle2 className="h-6 w-6 text-white" />}
      rightAction={<CheckCircle2 className="h-6 w-6 text-white" />}
      className="mb-4"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-bold text-lg text-foreground">
                {order.order_number}
              </h3>
              <Badge
                className={`${getStatusColor(order.status)} text-white text-xs`}
              >
                {t(`status.${order.status}`, order.status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {order.customer_name}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t('order.dateNeeded', 'Date')}:
            </span>
            <span className="font-medium">
              {order.date_needed && formatDate(order.date_needed, undefined, language)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t('order.timeNeeded', 'Time')}:
            </span>
            <span className="font-medium">
              {order.time_needed && formatTime(order.time_needed, language)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t('common.total', 'Total')}:
            </span>
            <span className="font-bold text-primary">
              ${typeof order.total_amount === 'number' 
                ? order.total_amount.toFixed(2) 
                : parseFloat(order.total_amount || '0').toFixed(2)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(order.id!)}
            className="flex-1 min-h-[44px]"
          >
            {t('common.view', 'View')}
          </Button>
          {order.status === 'confirmed' && (
            <Button
              size="sm"
              onClick={() => onStatusUpdate?.(order.id!, 'in_progress')}
              className="flex-1 min-h-[44px]"
            >
              {t('dashboard.markAsReady', 'Start')}
            </Button>
          )}
          {order.status === 'in_progress' && (
            <Button
              size="sm"
              onClick={() => onStatusUpdate?.(order.id!, 'ready')}
              className="flex-1 min-h-[44px]"
            >
              {t('dashboard.markAsReady', 'Ready')}
            </Button>
          )}
        </div>
      </div>
    </SwipeableCard>
  );
};
