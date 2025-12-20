import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Clock, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  XCircle,
  Calendar,
  Phone,
  Mail,
  DollarSign,
  FileText,
  ExternalLink
} from 'lucide-react';
import { formatPrice } from '@/lib/pricing';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Order } from '@/types/order';

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

const OrderDetailsModal = ({ order, open, onClose }: OrderDetailsModalProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!order) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
      pending: { label: t('Pendiente', 'Pending'), variant: 'outline' },
      confirmed: { label: t('Confirmada', 'Confirmed'), variant: 'default', className: 'bg-blue-500' },
      in_progress: { label: t('En Progreso', 'In Progress'), variant: 'default', className: 'bg-purple-500' },
      ready: { label: t('Lista', 'Ready'), variant: 'default', className: 'bg-green-500' },
      out_for_delivery: { label: t('En Entrega', 'Out for Delivery'), variant: 'default', className: 'bg-orange-500' },
      delivered: { label: t('Entregada', 'Delivered'), variant: 'default', className: 'bg-green-600' },
      completed: { label: t('Completada', 'Completed'), variant: 'default', className: 'bg-green-600' },
      cancelled: { label: t('Cancelada', 'Cancelled'), variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' as const };
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleTrackOrder = () => {
    onClose();
    navigate(`/order-tracking?order=${order.order_number}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="font-mono text-xl">{t('Orden', 'Order')} #{order.order_number}</span>
            {getStatusBadge(order.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Date & Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('Fecha del Pedido', 'Order Date')}
                </p>
                <p className="font-medium">
                  {order.created_at ? format(new Date(order.created_at), 'PPP') : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t('Fecha Necesaria', 'Date Needed')}
                </p>
                <p className="font-medium">
                  {order.date_needed} {order.time_needed && `@ ${order.time_needed}`}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cake Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('Detalles del Pastel', 'Cake Details')}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 bg-muted/30 p-4 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{t('Tamaño', 'Size')}</p>
                <p className="font-medium">{order.cake_size || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('Relleno', 'Filling')}</p>
                <p className="font-medium">{order.filling || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">{t('Tema / Diseño', 'Theme / Design')}</p>
                <p className="font-medium">{order.theme || '-'}</p>
              </div>
              {order.dedication && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">{t('Dedicatoria', 'Dedication')}</p>
                  <p className="font-medium italic">"{order.dedication}"</p>
                </div>
              )}
              {order.special_instructions && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">{t('Instrucciones Especiales', 'Special Instructions')}</p>
                  <p className="font-medium">{order.special_instructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          {order.delivery_option === 'delivery' && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  {t('Información de Entrega', 'Delivery Information')}
                </h3>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-blue-600" />
                    <div>
                      <p className="font-medium">{order.delivery_address}</p>
                      {order.delivery_apartment && (
                        <p className="text-sm text-muted-foreground">
                          {t('Apto/Unidad', 'Apt/Unit')}: {order.delivery_apartment}
                        </p>
                      )}
                    </div>
                  </div>
                  {order.delivery_zone && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{t('Zona', 'Zone')}:</span>
                      <Badge variant="outline">{order.delivery_zone}</Badge>
                    </div>
                  )}
                  {order.delivery_status && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{t('Estado de Entrega', 'Delivery Status')}:</span>
                      <Badge variant="secondary">{order.delivery_status}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {order.delivery_option === 'pickup' && (
            <>
              <Separator />
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">{t('Recoger en tienda', 'Pickup in store')}</span>
                </div>
              </div>
            </>
          )}

          {/* Payment Info */}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t('Información de Pago', 'Payment Information')}
            </h3>
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              {order.subtotal && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('Subtotal', 'Subtotal')}</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
              )}
              {order.delivery_fee && order.delivery_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('Envío', 'Delivery')}</span>
                  <span>{formatPrice(order.delivery_fee)}</span>
                </div>
              )}
              {order.tax_amount && order.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('Impuestos', 'Tax')}</span>
                  <span>{formatPrice(order.tax_amount)}</span>
                </div>
              )}
              {order.discount_amount && order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('Descuento', 'Discount')}</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>{t('Total', 'Total')}</span>
                <span className="text-primary">
                  {formatPrice(parseFloat(String(order.total_amount || 0)))}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-sm text-muted-foreground">{t('Estado de Pago', 'Payment Status')}:</span>
                <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'}>
                  {order.payment_status === 'paid' ? t('Pagado', 'Paid') : t('Pendiente', 'Pending')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Cancellation Info */}
          {order.status === 'cancelled' && (
            <>
              <Separator />
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-800 dark:text-red-200">
                    {t('Orden Cancelada', 'Order Cancelled')}
                  </span>
                </div>
                {order.cancelled_at && (
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {t('Cancelada el', 'Cancelled on')}: {format(new Date(order.cancelled_at), 'PPP')}
                  </p>
                )}
                {order.cancellation_reason && (
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {t('Motivo', 'Reason')}: {order.cancellation_reason}
                  </p>
                )}
                {order.refund_amount && order.refund_amount > 0 && (
                  <p className="text-sm mt-2">
                    <span className="text-red-700 dark:text-red-300">{t('Reembolso', 'Refund')}: </span>
                    <span className="font-bold text-green-600">{formatPrice(order.refund_amount)}</span>
                    {order.refund_status && (
                      <Badge className="ml-2" variant={order.refund_status === 'processed' ? 'default' : 'secondary'}>
                        {order.refund_status === 'processed' ? t('Procesado', 'Processed') : t('Pendiente', 'Pending')}
                      </Badge>
                    )}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {order.status !== 'cancelled' && order.status !== 'completed' && order.status !== 'delivered' && (
              <Button onClick={handleTrackOrder} className="flex-1">
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('Rastrear Orden', 'Track Order')}
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className={order.status === 'cancelled' || order.status === 'completed' || order.status === 'delivered' ? 'flex-1' : ''}>
              {t('Cerrar', 'Close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;

