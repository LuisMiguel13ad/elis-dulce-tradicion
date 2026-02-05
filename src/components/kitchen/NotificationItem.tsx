import { Order } from '@/types/order';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, User, Cake } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';

export type NotificationCategory = 'overdue' | 'due-today' | 'upcoming';

interface NotificationItemProps {
  order: Order;
  category: NotificationCategory;
  isUnread: boolean;
  onClick: () => void;
  darkMode: boolean;
}

const statusLabels: Record<string, { es: string; en: string }> = {
  pending: { es: 'Pendiente', en: 'Pending' },
  confirmed: { es: 'Confirmada', en: 'Confirmed' },
  in_progress: { es: 'Preparando', en: 'Preparing' },
  ready: { es: 'Lista', en: 'Ready' },
};

const statusColors: Record<string, string> = {
  pending: 'bg-gray-800 text-white',
  confirmed: 'bg-yellow-500 text-white',
  in_progress: 'bg-yellow-600 text-white',
  ready: 'bg-green-500 text-white',
};

const categoryStyles = {
  overdue: {
    dark: 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20',
    light: 'bg-red-50 border-red-200 hover:bg-red-100',
  },
  'due-today': {
    dark: 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20',
    light: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
  },
  upcoming: {
    dark: 'bg-slate-800/50 border-slate-700 hover:bg-slate-700/50',
    light: 'bg-white border-gray-100 hover:bg-gray-50',
  },
};

function formatDueTime(order: Order): string {
  try {
    if (!order.date_needed || !order.time_needed) return '—';
    const dt = parseISO(`${order.date_needed}T${order.time_needed}`);
    return format(dt, 'MMM d, h:mm a');
  } catch {
    return '—';
  }
}

export function NotificationItem({ order, category, isUnread, onClick, darkMode }: NotificationItemProps) {
  const { t } = useLanguage();
  const mode = darkMode ? 'dark' : 'light';
  const statusLabel = statusLabels[order.status]
    ? t(statusLabels[order.status].es, statusLabels[order.status].en)
    : order.status;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-3 rounded-lg border transition-colors cursor-pointer flex items-start gap-3',
        categoryStyles[category][mode]
      )}
    >
      {/* Unread indicator */}
      <div className="flex-shrink-0 pt-1.5">
        <div
          className={cn(
            'h-2.5 w-2.5 rounded-full transition-opacity',
            isUnread ? 'bg-blue-500' : 'opacity-0'
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Order number + customer name */}
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            'font-bold text-sm truncate',
            darkMode ? 'text-white' : 'text-gray-900'
          )}>
            #{order.order_number}
          </span>
          <span className={cn(
            'text-sm truncate',
            darkMode ? 'text-slate-300' : 'text-gray-600'
          )}>
            <User className="inline h-3 w-3 mr-1" />
            {order.customer_name || t('Sin nombre', 'No name')}
          </span>
        </div>

        {/* Row 2: Cake size + due time */}
        <div className="flex items-center gap-3 text-xs">
          {order.cake_size && (
            <span className={cn(
              'flex items-center gap-1',
              darkMode ? 'text-slate-400' : 'text-gray-500'
            )}>
              <Cake className="h-3 w-3" />
              {order.cake_size}
            </span>
          )}
          <span className={cn(
            'flex items-center gap-1',
            category === 'overdue'
              ? 'text-red-400 font-semibold'
              : category === 'due-today'
                ? (darkMode ? 'text-amber-400' : 'text-amber-600')
                : (darkMode ? 'text-slate-400' : 'text-gray-500')
          )}>
            <Clock className="h-3 w-3" />
            {formatDueTime(order)}
          </span>
        </div>
      </div>

      {/* Status badge */}
      <Badge className={cn(
        'flex-shrink-0 text-[10px] px-2 py-0.5 border-none rounded-full',
        statusColors[order.status] || 'bg-gray-500 text-white'
      )}>
        {statusLabel}
      </Badge>
    </button>
  );
}
