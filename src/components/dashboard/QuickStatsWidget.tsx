import { useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ShoppingCart, DollarSign } from 'lucide-react';
import { Order } from '@/types/order';
import {
  format,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';

interface QuickStatsWidgetProps {
  orders: Order[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

function computeBucket(orders: Order[]) {
  const revenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const count = orders.length;
  const avg = count > 0 ? revenue / count : 0;
  return { revenue, count, avg };
}

export function QuickStatsWidget({ orders }: QuickStatsWidgetProps) {
  const { t } = useLanguage();
  const now = new Date();

  const { today, week, month } = useMemo(() => {
    const validOrders = orders.filter(
      (o) => o.status !== 'cancelled' && o.created_at
    );

    const todayInterval = { start: startOfDay(now), end: endOfDay(now) };
    const weekInterval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    const monthInterval = { start: startOfMonth(now), end: endOfMonth(now) };

    const todayOrders = validOrders.filter((o) => {
      try {
        return isWithinInterval(parseISO(o.created_at!), todayInterval);
      } catch { return false; }
    });

    const weekOrders = validOrders.filter((o) => {
      try {
        return isWithinInterval(parseISO(o.created_at!), weekInterval);
      } catch { return false; }
    });

    const monthOrders = validOrders.filter((o) => {
      try {
        return isWithinInterval(parseISO(o.created_at!), monthInterval);
      } catch { return false; }
    });

    return {
      today: computeBucket(todayOrders),
      week: computeBucket(weekOrders),
      month: computeBucket(monthOrders),
    };
  }, [orders]);

  const columns = [
    { label: t('Hoy', 'Today'), data: today },
    { label: t('Esta Semana', 'This Week'), data: week },
    { label: t('Este Mes', 'This Month'), data: month },
  ];

  return (
    <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          {t('Resumen Rápido', 'Quick Stats')}
          <Badge variant="outline" className="ml-auto">
            {format(now, 'MMMM yyyy')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0">
          {columns.map((col, i) => (
            <div
              key={col.label}
              className={
                i < 2
                  ? 'sm:border-r sm:border-gray-200 sm:dark:border-slate-700 sm:pr-4 sm:mr-4'
                  : ''
              }
            >
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                {col.label}
              </p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(col.data.revenue)}
              </p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <ShoppingCart className="h-3.5 w-3.5" />
                {col.data.count} {t('órdenes', 'orders')}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <DollarSign className="h-3.5 w-3.5" />
                AOV {formatCurrency(col.data.avg)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
