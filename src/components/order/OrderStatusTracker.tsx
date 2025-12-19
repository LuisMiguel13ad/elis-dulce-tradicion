import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle2, Clock, Loader2, Package, Truck, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderStatusTrackerProps {
  status: string;
  deliveryOption: 'pickup' | 'delivery';
  estimatedTime?: string;
  deliveryAddress?: string;
}

const OrderStatusTracker = ({ status, deliveryOption, estimatedTime, deliveryAddress }: OrderStatusTrackerProps) => {
  const { t } = useLanguage();

  const statuses = deliveryOption === 'delivery'
    ? [
        { key: 'confirmed', labelES: 'Confirmada', labelEN: 'Confirmed', icon: CheckCircle2 },
        { key: 'in_progress', labelES: 'En Preparación', labelEN: 'In Progress', icon: Package },
        { key: 'ready', labelES: 'Lista', labelEN: 'Ready', icon: Clock },
        { key: 'out_for_delivery', labelES: 'En Camino', labelEN: 'Out for Delivery', icon: Truck },
        { key: 'delivered', labelES: 'Entregada', labelEN: 'Delivered', icon: Home },
      ]
    : [
        { key: 'confirmed', labelES: 'Confirmada', labelEN: 'Confirmed', icon: CheckCircle2 },
        { key: 'in_progress', labelES: 'En Preparación', labelEN: 'In Progress', icon: Package },
        { key: 'ready', labelES: 'Lista para Recoger', labelEN: 'Ready for Pickup', icon: Clock },
        { key: 'delivered', labelES: 'Recogida', labelEN: 'Picked Up', icon: CheckCircle2 },
      ];

  const currentIndex = statuses.findIndex(s => s.key === status);

  const getStatusColor = (index: number) => {
    if (index < currentIndex) return 'text-green-600 bg-green-100 border-green-600';
    if (index === currentIndex) return 'text-primary bg-primary/10 border-primary animate-pulse';
    return 'text-muted-foreground bg-muted border-muted-foreground/30';
  };

  const getLineColor = (index: number) => {
    if (index < currentIndex) return 'bg-green-600';
    return 'bg-muted-foreground/30';
  };

  return (
    <div className="space-y-6">
      {/* Delivery Info Banner */}
      {deliveryOption === 'delivery' && deliveryAddress && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-accent/10 border border-accent/30 p-4"
        >
          <p className="text-sm font-bold text-accent mb-1">
            🚗 {t('Entrega a Domicilio', 'Home Delivery')}
          </p>
          <p className="text-sm font-medium">{deliveryAddress}</p>
          {estimatedTime && (status === 'ready' || status === 'out_for_delivery') && (
            <p className="text-xs text-muted-foreground mt-2">
              ⏰ {t('Tiempo estimado de llegada', 'Estimated arrival')}: {new Date(estimatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </motion.div>
      )}

      {/* Status Timeline */}
      <div className="relative">
        {statuses.map((statusItem, index) => {
          const Icon = statusItem.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div key={statusItem.key} className="relative">
              {/* Connecting Line */}
              {index < statuses.length - 1 && (
                <div
                  className={`absolute left-6 top-12 h-16 w-0.5 ${getLineColor(index)}`}
                />
              )}

              {/* Status Item */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 pb-8"
              >
                {/* Icon */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${getStatusColor(index)}`}
                >
                  {isActive ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <h3 className={`font-display text-lg font-bold ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {t(statusItem.labelES, statusItem.labelEN)}
                  </h3>

                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-sans text-sm text-primary font-semibold"
                    >
                      {statusItem.key === 'confirmed' && t('¡Tu orden ha sido confirmada!', 'Your order has been confirmed!')}
                      {statusItem.key === 'in_progress' && t('Estamos preparando tu orden...', 'We are preparing your order...')}
                      {statusItem.key === 'ready' && deliveryOption === 'delivery' && t('¡Tu orden está lista! Pronto saldrá para entrega.', 'Your order is ready! It will be sent out for delivery soon.')}
                      {statusItem.key === 'ready' && deliveryOption === 'pickup' && t('¡Tu orden está lista para recoger!', 'Your order is ready for pickup!')}
                      {statusItem.key === 'out_for_delivery' && t('¡Tu orden va en camino!', 'Your order is on its way!')}
                      {statusItem.key === 'delivered' && deliveryOption === 'delivery' && t('¡Tu orden ha sido entregada!', 'Your order has been delivered!')}
                      {statusItem.key === 'delivered' && deliveryOption === 'pickup' && t('¡Gracias por recoger tu orden!', 'Thank you for picking up your order!')}
                    </motion.p>
                  )}

                  {isCompleted && (
                    <p className="font-sans text-sm text-green-600">
                      ✓ {t('Completado', 'Completed')}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Helpful Info */}
      <div className="rounded-lg bg-muted/50 p-4">
        <p className="font-sans text-sm text-muted-foreground">
          {deliveryOption === 'delivery'
            ? t(
                '💬 Recibirás notificaciones por WhatsApp en cada paso del proceso.',
                '💬 You will receive WhatsApp notifications at each step of the process.'
              )
            : t(
                '💬 Te notificaremos cuando tu orden esté lista para recoger.',
                '💬 We will notify you when your order is ready for pickup.'
              )}
        </p>
      </div>
    </div>
  );
};

export default OrderStatusTracker;

