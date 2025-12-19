/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info, DollarSign } from 'lucide-react';
import { getCancellationInfo, cancelOrder, formatCancellationReason, type CancellationInfo } from '@/lib/cancellation';
import { formatPrice } from '@/lib/pricing';
import { toast } from 'sonner';

interface CancelOrderModalProps {
  order: any;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isAdmin?: boolean;
  overrideRefundAmount?: number;
}

const CANCELLATION_REASONS = [
  { value: 'customer_request', label: 'Customer Request' },
  { value: 'duplicate_order', label: 'Duplicate Order' },
  { value: 'wrong_item', label: 'Wrong Item Ordered' },
  { value: 'change_of_mind', label: 'Change of Mind' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'admin_error', label: 'Admin Error' },
  { value: 'other', label: 'Other' },
];

const CancelOrderModal = ({
  order,
  open,
  onClose,
  onSuccess,
  isAdmin = false,
  overrideRefundAmount,
}: CancelOrderModalProps) => {
  const { t } = useLanguage();
  const [cancellationInfo, setCancellationInfo] = useState<CancellationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [reason, setReason] = useState('');
  const [reasonDetails, setReasonDetails] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [customRefundAmount, setCustomRefundAmount] = useState<string>('');

  useEffect(() => {
    if (open && order) {
      loadCancellationInfo();
    }
  }, [open, order]);

  const loadCancellationInfo = async () => {
    setLoadingInfo(true);
    try {
      const info = await getCancellationInfo(order, isAdmin);
      setCancellationInfo(info);
    } catch (error) {
      console.error('Error loading cancellation info:', error);
      toast.error(t('Error al cargar información de cancelación', 'Error loading cancellation info'));
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleCancel = async () => {
    if (!reason) {
      toast.error(t('Por favor seleccione un motivo', 'Please select a reason'));
      return;
    }

    setLoading(true);
    try {
      if (isAdmin) {
        const { adminCancelOrder } = await import('@/lib/cancellation');
        await adminCancelOrder(order.id, {
          reason,
          reasonDetails: reasonDetails || undefined,
          overrideRefundAmount: customRefundAmount ? parseFloat(customRefundAmount) : undefined,
          adminNotes: adminNotes || undefined,
        });
      } else {
        await cancelOrder(order.id, {
          reason,
          reasonDetails: reasonDetails || undefined,
        });
      }

      toast.success(t('Orden cancelada exitosamente', 'Order cancelled successfully'));
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error(error.message || t('Error al cancelar orden', 'Error cancelling order'));
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            {t('Cancelar Orden', 'Cancel Order')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'Confirme la cancelación de esta orden. Se aplicará la política de reembolso correspondiente.',
              'Confirm cancellation of this order. The applicable refund policy will be applied.'
            )}
          </DialogDescription>
        </DialogHeader>

        {loadingInfo ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : cancellationInfo ? (
          <div className="space-y-4">
            {/* Cancellation Policy Info */}
            {cancellationInfo.applicablePolicy && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-1">
                    {t('Política de Cancelación', 'Cancellation Policy')}:
                  </p>
                  <p className="text-sm">
                    {cancellationInfo.applicablePolicy.description}
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Refund Information */}
            {cancellationInfo.refundAmount > 0 ? (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                <DollarSign className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <p className="font-semibold text-green-800 dark:text-green-200 mb-1">
                    {t('Reembolso Estimado', 'Estimated Refund')}:
                  </p>
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">
                    {formatPrice(cancellationInfo.refundAmount)} (
                    {cancellationInfo.refundPercentage.toFixed(0)}%)
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {t(
                    'No se aplicará reembolso según la política de cancelación.',
                    'No refund will be applied according to cancellation policy.'
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Time Information */}
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                {t('Tiempo hasta la fecha necesaria', 'Time until needed date')}:{' '}
                <span className="font-semibold">
                  {Math.floor(cancellationInfo.hoursUntilNeeded)}{' '}
                  {t('horas', 'hours')}
                </span>
              </p>
            </div>

            {/* Cannot Cancel Warning */}
            {!cancellationInfo.canCancel && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{cancellationInfo.reason}</AlertDescription>
              </Alert>
            )}

            {/* Cancellation Form */}
            {cancellationInfo.canCancel && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('Motivo de Cancelación', 'Cancellation Reason')} *</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Seleccionar motivo', 'Select reason')} />
                    </SelectTrigger>
                    <SelectContent>
                      {CANCELLATION_REASONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    {t('Detalles Adicionales', 'Additional Details')} ({t('Opcional', 'Optional')})
                  </Label>
                  <Textarea
                    value={reasonDetails}
                    onChange={(e) => setReasonDetails(e.target.value)}
                    placeholder={t(
                      'Proporcione más información sobre la cancelación...',
                      'Provide more information about the cancellation...'
                    )}
                    rows={3}
                  />
                </div>

                {/* Admin Override */}
                {isAdmin && (
                  <>
                    <div className="space-y-2">
                      <Label>
                        {t('Monto de Reembolso Personalizado', 'Custom Refund Amount')} (
                        {t('Opcional', 'Optional')})
                      </Label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={order.total_amount}
                        value={customRefundAmount}
                        onChange={(e) => setCustomRefundAmount(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder={formatPrice(cancellationInfo.refundAmount)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t(
                          'Deje vacío para usar la política estándar',
                          'Leave empty to use standard policy'
                        )}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {t('Notas Administrativas', 'Admin Notes')} ({t('Opcional', 'Optional')})
                      </Label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder={t('Notas internas...', 'Internal notes...')}
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertDescription>
              {t('Error al cargar información de cancelación', 'Error loading cancellation info')}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t('Cerrar', 'Close')}
          </Button>
          {cancellationInfo?.canCancel && (
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={loading || !reason}
            >
              {loading
                ? t('Cancelando...', 'Cancelling...')
                : t('Confirmar Cancelación', 'Confirm Cancellation')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelOrderModal;
