import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order, DeliveryStatus } from '@/types/order';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Clock,
  Calendar,
  Truck,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  Eye,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from 'lucide-react';

interface StaffMember {
  id: string;
  full_name: string;
  role: string;
}

interface DeliveryCardProps {
  order: Order;
  staffMembers: StaffMember[];
  onAssignDriver: (orderId: number, driverId: string) => void;
  onStatusUpdate: (orderId: number, newStatus: DeliveryStatus, notes?: string) => void;
  onShowDetails: (order: Order) => void;
  isLoading: boolean;
  darkMode: boolean;
}

const getDeliveryStatusColor = (status?: string) => {
  switch (status) {
    case 'assigned':
      return 'bg-blue-500 text-white';
    case 'in_transit':
      return 'bg-purple-600 text-white';
    case 'delivered':
      return 'bg-green-600 text-white';
    case 'failed':
      return 'bg-red-600 text-white';
    case 'pending':
    default:
      return 'bg-amber-500 text-white';
  }
};

export function DeliveryCard({
  order,
  staffMembers,
  onAssignDriver,
  onStatusUpdate,
  onShowDetails,
  isLoading,
  darkMode,
}: DeliveryCardProps) {
  const { t } = useLanguage();
  const [showNotes, setShowNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(order.driver_notes || '');

  const deliveryStatus = (order.delivery_status as DeliveryStatus) || 'pending';

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t('Pendiente', 'Pending');
      case 'assigned':
        return t('Asignado', 'Assigned');
      case 'in_transit':
        return t('En camino', 'In Transit');
      case 'delivered':
        return t('Entregado', 'Delivered');
      case 'failed':
        return t('Fallido', 'Failed');
      default:
        return status;
    }
  };

  const renderActionButton = () => {
    if (isLoading) {
      return (
        <Button disabled className="flex-1 rounded-xl h-10">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {t('Procesando...', 'Processing...')}
        </Button>
      );
    }

    switch (deliveryStatus) {
      case 'pending':
        return null; // Driver assignment dropdown handles this
      case 'assigned':
        return (
          <Button
            onClick={() => onStatusUpdate(order.id, 'in_transit')}
            className="flex-1 bg-purple-600 text-white hover:bg-purple-700 rounded-xl h-10"
          >
            <Truck className="h-4 w-4 mr-2" />
            {t('Iniciar Entrega', 'Start Delivery')}
          </Button>
        );
      case 'in_transit':
        return (
          <div className="flex gap-2 flex-1">
            <Button
              onClick={() => onStatusUpdate(order.id, 'delivered')}
              className="flex-1 bg-green-600 text-white hover:bg-green-700 rounded-xl h-10"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t('Entregado', 'Delivered')}
            </Button>
            <Button
              variant="outline"
              onClick={() => onStatusUpdate(order.id, 'failed')}
              className={cn(
                "rounded-xl h-10 border-red-300 text-red-500 hover:bg-red-50",
                darkMode && "border-red-500/30 text-red-400 hover:bg-red-900/20"
              )}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        );
      case 'delivered':
        return (
          <div className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-xl h-10 text-sm font-medium",
            darkMode ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-700"
          )}>
            <CheckCircle2 className="h-4 w-4" />
            {t('Completado', 'Completed')}
          </div>
        );
      case 'failed':
        return (
          <Button
            variant="outline"
            onClick={() => onStatusUpdate(order.id, 'pending')}
            className={cn(
              "flex-1 rounded-xl h-10",
              darkMode ? "border-slate-600 text-slate-300 hover:bg-slate-700" : ""
            )}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('Reintentar', 'Retry')}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-5 shadow-sm border flex flex-col gap-4 transition-all",
        darkMode
          ? "bg-[#1f2937] border-slate-700/50 hover:shadow-lg hover:shadow-slate-900/20"
          : "bg-white border-gray-100 hover:shadow-md",
        deliveryStatus === 'failed' && "border-l-4 border-l-red-500"
      )}
    >
      {/* Header: Customer + Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
              darkMode ? "bg-slate-700 text-white" : "bg-gray-100 text-gray-700"
            )}
          >
            {(order.customer_name || '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p
              className={cn(
                "font-semibold text-sm truncate",
                darkMode ? "text-white" : "text-gray-900"
              )}
            >
              {order.customer_name || t('Sin nombre', 'No name')}
            </p>
            <p
              className={cn(
                "text-xs",
                darkMode ? "text-slate-400" : "text-gray-500"
              )}
            >
              #{order.order_number}
            </p>
          </div>
        </div>
        <Badge
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold border-none flex-shrink-0",
            getDeliveryStatusColor(deliveryStatus)
          )}
        >
          {getStatusLabel(deliveryStatus)}
        </Badge>
      </div>

      {/* Address */}
      <div
        className={cn(
          "flex items-start gap-2 text-sm",
          darkMode ? "text-slate-300" : "text-gray-700"
        )}
      >
        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-400" />
        <div className="min-w-0">
          <p className="truncate">{order.delivery_address || t('Sin dirección', 'No address')}</p>
          {order.delivery_apartment && (
            <p className={cn("text-xs", darkMode ? "text-slate-400" : "text-gray-500")}>
              {order.delivery_apartment}
            </p>
          )}
          {order.delivery_zone && (
            <Badge
              variant="outline"
              className={cn(
                "mt-1 text-[10px] px-2 py-0 rounded-full",
                darkMode ? "border-slate-600 text-slate-400" : "border-gray-200 text-gray-500"
              )}
            >
              {order.delivery_zone}
            </Badge>
          )}
        </div>
      </div>

      {/* Time Info */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {order.date_needed && (
          <div className={cn("flex items-center gap-1.5 text-xs", darkMode ? "text-slate-400" : "text-gray-500")}>
            <Calendar className="h-3.5 w-3.5" />
            {order.date_needed}
          </div>
        )}
        {order.time_needed && (
          <div className={cn("flex items-center gap-1.5 text-xs", darkMode ? "text-slate-400" : "text-gray-500")}>
            <Clock className="h-3.5 w-3.5" />
            {order.time_needed}
          </div>
        )}
        {order.estimated_delivery_time && (
          <div className={cn("flex items-center gap-1.5 text-xs font-medium", darkMode ? "text-purple-400" : "text-purple-600")}>
            <Truck className="h-3.5 w-3.5" />
            ETA: {order.estimated_delivery_time}
          </div>
        )}
      </div>

      {/* Driver Assignment */}
      <div>
        <div className={cn("flex items-center gap-1.5 text-xs font-medium mb-2", darkMode ? "text-slate-400" : "text-gray-500")}>
          <User className="h-3.5 w-3.5" />
          {t('Conductor', 'Driver')}
        </div>
        {deliveryStatus !== 'delivered' ? (
          <Select
            onValueChange={(value) => onAssignDriver(order.id, value)}
            disabled={isLoading}
          >
            <SelectTrigger
              className={cn(
                "w-full rounded-xl text-sm h-9",
                darkMode
                  ? "bg-slate-800 border-slate-600 text-white"
                  : "bg-white border-gray-200"
              )}
            >
              <SelectValue placeholder={t('Seleccionar conductor', 'Select driver')} />
            </SelectTrigger>
            <SelectContent>
              {staffMembers.length === 0 ? (
                <SelectItem value="_none" disabled>
                  {t('No hay personal disponible', 'No staff available')}
                </SelectItem>
              ) : (
                staffMembers.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.full_name}{' '}
                    ({staff.role === 'owner' ? 'Owner' : 'Front Desk'})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        ) : (
          <p className={cn("text-sm", darkMode ? "text-slate-300" : "text-gray-700")}>
            {t('Entrega completada', 'Delivery completed')}
          </p>
        )}
      </div>

      {/* Driver Notes (Collapsible) */}
      <div>
        <button
          onClick={() => setShowNotes(!showNotes)}
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium transition-colors",
            darkMode ? "text-slate-400 hover:text-slate-300" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {t('Notas del conductor', 'Driver Notes')}
          {showNotes ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {order.driver_notes && !showNotes && (
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          )}
        </button>
        {showNotes && (
          <Textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            onBlur={() => {
              if (notesValue !== (order.driver_notes || '')) {
                onStatusUpdate(order.id, deliveryStatus, notesValue);
              }
            }}
            placeholder={t('Agregar notas...', 'Add notes...')}
            className={cn(
              "mt-2 text-sm rounded-xl resize-none h-20",
              darkMode ? "bg-slate-800 border-slate-600 text-white placeholder:text-slate-500" : ""
            )}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-1">
        <Button
          variant="outline"
          onClick={() => onShowDetails(order)}
          className={cn(
            "rounded-xl h-10",
            deliveryStatus === 'pending' ? "flex-1" : "",
            darkMode ? "border-slate-600 text-slate-300 hover:bg-slate-700" : ""
          )}
        >
          <Eye className="h-4 w-4 mr-2" />
          {t('Ver Orden', 'View Order')}
        </Button>
        {renderActionButton()}
      </div>
    </div>
  );
}
