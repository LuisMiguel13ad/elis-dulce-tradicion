import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Play, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ReferenceImageViewer from '@/components/order/ReferenceImageViewer';
import { Order } from '@/types/order';
import { differenceInHours, differenceInMinutes, parseISO, isToday, isTomorrow } from 'date-fns';

interface BakerWorkCardProps {
  order: Order;
  onAccept: (orderId: number) => void;
  onStart: (orderId: number) => void;
  onReady: (orderId: number) => void;
  isSelected?: boolean;
  onClick?: () => void;
}

type UrgencyLevel = 'urgent' | 'soon' | 'normal';

const getUrgencyLevel = (dateNeeded: string, timeNeeded: string): UrgencyLevel => {
  try {
    const dueDateTime = parseISO(`${dateNeeded}T${timeNeeded}`);
    const now = new Date();
    const hoursUntilDue = differenceInHours(dueDateTime, now);
    const minutesUntilDue = differenceInMinutes(dueDateTime, now);

    if (minutesUntilDue <= 0) return 'urgent'; // Overdue
    if (hoursUntilDue <= 2) return 'urgent';   // Due within 2 hours
    if (hoursUntilDue <= 6) return 'soon';     // Due within 6 hours
    return 'normal';
  } catch {
    return 'normal';
  }
};

const getUrgencyStyles = (urgency: UrgencyLevel) => {
  switch (urgency) {
    case 'urgent':
      return {
        border: 'border-red-500 border-2',
        badge: 'bg-red-500 text-white',
        icon: AlertTriangle,
      };
    case 'soon':
      return {
        border: 'border-yellow-500 border-2',
        badge: 'bg-yellow-500 text-black',
        icon: Clock,
      };
    default:
      return {
        border: 'border-border',
        badge: 'bg-green-500 text-white',
        icon: Clock,
      };
  }
};

const formatDueTime = (dateNeeded: string, timeNeeded: string, t: (es: string, en: string) => string): string => {
  try {
    const dueDate = parseISO(dateNeeded);

    if (isToday(dueDate)) {
      return `${t('Hoy', 'Today')} @ ${timeNeeded}`;
    }
    if (isTomorrow(dueDate)) {
      return `${t('Mañana', 'Tomorrow')} @ ${timeNeeded}`;
    }
    return `${dateNeeded} @ ${timeNeeded}`;
  } catch {
    return `${dateNeeded} @ ${timeNeeded}`;
  }
};

const BakerWorkCard = ({
  order,
  onAccept,
  onStart,
  onReady,
  isSelected = false,
  onClick,
}: BakerWorkCardProps) => {
  const { t } = useLanguage();
  const urgency = getUrgencyLevel(order.date_needed, order.time_needed);
  const urgencyStyles = getUrgencyStyles(urgency);
  const UrgencyIcon = urgencyStyles.icon;

  const statusBadgeVariant = {
    pending: 'destructive',
    confirmed: 'secondary',
    in_progress: 'default',
    ready: 'outline',
  } as const;

  const statusLabels = {
    pending: t('Nuevo', 'New'),
    confirmed: t('Confirmado', 'Confirmed'),
    in_progress: t('En Progreso', 'In Progress'),
    ready: t('Listo', 'Ready'),
  };

  return (
    <Card
      className={`h-full transition-all hover:shadow-lg cursor-pointer ${urgencyStyles.border} ${
        isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
      } ${order.status === 'pending' ? 'animate-pulse-subtle' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">
              #{order.order_number}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusBadgeVariant[order.status as keyof typeof statusBadgeVariant] || 'outline'}>
                {statusLabels[order.status as keyof typeof statusLabels] || order.status}
              </Badge>
              {order.status === 'pending' && (
                <Badge className="animate-pulse bg-red-500">NEW</Badge>
              )}
            </div>
          </div>
          <Badge className={urgencyStyles.badge}>
            <UrgencyIcon className="h-3 w-3 mr-1" />
            {formatDueTime(order.date_needed, order.time_needed, t)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Cake Details - Large and prominent */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xl font-bold text-primary">{order.cake_size}</p>
          <p className="text-lg font-medium">{order.filling}</p>
        </div>

        {/* Theme/Design */}
        <div>
          <p className="text-sm text-muted-foreground">{t('Tema/Diseño', 'Theme/Design')}</p>
          <p className="font-medium">{order.theme || t('Sin tema específico', 'No specific theme')}</p>
        </div>

        {/* Dedication */}
        {order.dedication && (
          <div className="bg-primary/10 p-2 rounded border-l-4 border-primary">
            <p className="text-sm text-muted-foreground">{t('Dedicatoria', 'Dedication')}</p>
            <p className="font-medium italic">"{order.dedication}"</p>
          </div>
        )}

        {/* Reference Image - Prominent */}
        {order.reference_image_path && (
          <div className="pt-2">
            <ReferenceImageViewer
              imagePath={order.reference_image_path}
              orderNumber={order.order_number}
              theme={order.theme}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 space-y-2">
          {order.status === 'pending' && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
              onClick={(e) => {
                e.stopPropagation();
                onAccept(order.id);
              }}
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              {t('ACEPTAR ORDEN', 'ACCEPT ORDER')}
            </Button>
          )}

          {order.status === 'confirmed' && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
              onClick={(e) => {
                e.stopPropagation();
                onStart(order.id);
              }}
            >
              <Play className="mr-2 h-5 w-5" />
              {t('EMPEZAR', 'START PREPPING')}
            </Button>
          )}

          {order.status === 'in_progress' && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
              onClick={(e) => {
                e.stopPropagation();
                onReady(order.id);
              }}
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              {t('MARCAR LISTO', 'MARK READY')}
            </Button>
          )}

          {order.status === 'ready' && (
            <div className="text-center py-4 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-1" />
              <p className="font-bold text-green-700">{t('LISTO PARA ENTREGA', 'READY FOR PICKUP')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BakerWorkCard;
