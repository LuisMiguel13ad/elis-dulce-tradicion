import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  AlertTriangle, 
  Truck, 
  ShoppingBag,
  CheckCircle2,
  Timer
} from 'lucide-react';
import { Order } from '@/types/order';
import { differenceInMinutes, format, parseISO, isToday } from 'date-fns';

interface TodayScheduleSummaryProps {
  orders: Order[];
  maxDailyCapacity?: number;
}

const TodayScheduleSummary = ({ orders, maxDailyCapacity = 20 }: TodayScheduleSummaryProps) => {
  const { t } = useLanguage();
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');

  // Filter today's orders
  const todayOrders = useMemo(() => {
    return orders.filter(order => order.date_needed === todayStr);
  }, [orders, todayStr]);

  // Categorize orders
  const { urgentOrders, upcomingOrders, deliveryOrders, pickupOrders, completedToday } = useMemo(() => {
    const urgent: Order[] = [];
    const upcoming: Order[] = [];
    const delivery: Order[] = [];
    const pickup: Order[] = [];
    const completed: Order[] = [];

    todayOrders.forEach(order => {
      // Check if completed
      if (order.status === 'completed' || order.status === 'delivered') {
        completed.push(order);
        return;
      }

      // Skip cancelled
      if (order.status === 'cancelled') return;

      // Categorize by delivery option
      if (order.delivery_option === 'delivery') {
        delivery.push(order);
      } else {
        pickup.push(order);
      }

      // Check urgency (due within 1 hour)
      if (order.time_needed) {
        const dueTime = parseISO(`${order.date_needed}T${order.time_needed}`);
        const minutesUntilDue = differenceInMinutes(dueTime, now);
        
        if (minutesUntilDue <= 60 && minutesUntilDue > -30 && order.status !== 'ready') {
          urgent.push(order);
        } else if (minutesUntilDue > 60 && minutesUntilDue <= 180) {
          upcoming.push(order);
        }
      }
    });

    // Sort urgent by time
    urgent.sort((a, b) => {
      const timeA = a.time_needed || '23:59';
      const timeB = b.time_needed || '23:59';
      return timeA.localeCompare(timeB);
    });

    return {
      urgentOrders: urgent,
      upcomingOrders: upcoming,
      deliveryOrders: delivery,
      pickupOrders: pickup,
      completedToday: completed
    };
  }, [todayOrders, now]);

  // Group orders by hour
  const ordersByHour = useMemo(() => {
    const byHour: Record<string, Order[]> = {};
    
    todayOrders.forEach(order => {
      if (order.status === 'cancelled') return;
      if (order.time_needed) {
        const hour = order.time_needed.split(':')[0];
        if (!byHour[hour]) byHour[hour] = [];
        byHour[hour].push(order);
      }
    });

    return Object.entries(byHour)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([hour, orders]) => ({
        hour: `${hour}:00`,
        orders,
        count: orders.length
      }));
  }, [todayOrders]);

  // Calculate capacity
  const activeOrders = todayOrders.filter(o => 
    !['cancelled', 'completed', 'delivered'].includes(o.status)
  ).length;
  const capacityPercent = Math.min(100, (activeOrders / maxDailyCapacity) * 100);

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-primary" />
          {t("Resumen de Hoy", "Today's Schedule")}
          <Badge variant="outline" className="ml-auto">
            {format(now, 'EEEE, MMM d')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Urgent Orders Alert */}
        {urgentOrders.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-semibold mb-2">
              <AlertTriangle className="h-4 w-4 animate-pulse" />
              {t('Urgente - Próxima Hora', 'Urgent - Next Hour')} ({urgentOrders.length})
            </div>
            <div className="space-y-1">
              {urgentOrders.slice(0, 3).map(order => (
                <div key={order.id} className="flex justify-between items-center text-sm">
                  <span className="font-mono">#{order.order_number}</span>
                  <span className="text-muted-foreground">{order.cake_size}</span>
                  <Badge variant="destructive" className="text-xs">
                    <Timer className="h-3 w-3 mr-1" />
                    {order.time_needed}
                  </Badge>
                </div>
              ))}
              {urgentOrders.length > 3 && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  +{urgentOrders.length - 3} {t('más', 'more')}...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-2xl font-bold text-primary">{todayOrders.length}</p>
            <p className="text-xs text-muted-foreground">{t('Total', 'Total')}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-2xl font-bold text-orange-500">{deliveryOrders.length}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Truck className="h-3 w-3" />
              {t('Envíos', 'Delivery')}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-2xl font-bold text-blue-500">{pickupOrders.length}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <ShoppingBag className="h-3 w-3" />
              {t('Recoger', 'Pickup')}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-2xl font-bold text-green-500">{completedToday.length}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {t('Listos', 'Done')}
            </p>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('Capacidad', 'Capacity')}</span>
            <span className="font-medium">{activeOrders}/{maxDailyCapacity}</span>
          </div>
          <Progress 
            value={capacityPercent} 
            className={`h-2 ${capacityPercent > 80 ? '[&>div]:bg-red-500' : capacityPercent > 50 ? '[&>div]:bg-yellow-500' : ''}`}
          />
        </div>

        {/* Timeline */}
        {ordersByHour.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {t('Línea de Tiempo', 'Timeline')}
            </p>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {ordersByHour.map(({ hour, count }) => {
                const currentHour = format(now, 'HH:00');
                const isPast = hour < currentHour;
                const isCurrent = hour === currentHour;
                
                return (
                  <div 
                    key={hour}
                    className={`flex-shrink-0 text-center p-2 rounded-lg min-w-[50px] ${
                      isCurrent 
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' 
                        : isPast 
                          ? 'bg-muted/30 text-muted-foreground'
                          : 'bg-muted/50'
                    }`}
                  >
                    <p className="text-xs font-medium">{hour}</p>
                    <p className="text-lg font-bold">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming orders hint */}
        {upcomingOrders.length > 0 && (
          <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-2">
            <span className="font-medium">{t('Próximas 3 horas', 'Next 3 hours')}:</span>{' '}
            {upcomingOrders.length} {t('órdenes pendientes', 'orders pending')}
          </div>
        )}

        {/* Empty State */}
        {todayOrders.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>{t('No hay órdenes para hoy', 'No orders for today')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayScheduleSummary;

