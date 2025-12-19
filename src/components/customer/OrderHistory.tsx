/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  RefreshCw, 
  Package, 
  CheckCircle2, 
  Clock,
  Truck,
  XCircle,
  Download,
  RotateCcw,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/pricing';
import { format } from 'date-fns';

interface OrderHistoryProps {
  userId: string;
}

const OrderHistory = ({ userId }: OrderHistoryProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    loadOrders();
  }, [userId]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFrom, dateTo]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCustomerOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error(t('Error al cargar pedidos', 'Error loading orders'));
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search by order number
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(order => order.date_needed >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(order => order.date_needed <= dateTo);
    }

    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      pending: { label: t('Pendiente', 'Pending'), variant: 'outline', icon: Clock },
      confirmed: { label: t('Confirmada', 'Confirmed'), variant: 'default', icon: CheckCircle2 },
      in_oven: { label: t('En Horno', 'In Oven'), variant: 'default', icon: Package },
      decorating: { label: t('Decorando', 'Decorating'), variant: 'default', icon: Package },
      ready: { label: t('Lista', 'Ready'), variant: 'default', icon: CheckCircle2 },
      completed: { label: t('Completada', 'Completed'), variant: 'default', icon: CheckCircle2 },
      cancelled: { label: t('Cancelada', 'Cancelled'), variant: 'destructive', icon: XCircle },
      in_transit: { label: t('En Camino', 'In Transit'), variant: 'default', icon: Truck },
      delivered: { label: t('Entregada', 'Delivered'), variant: 'default', icon: CheckCircle2 },
    };

    const config = statusConfig[status] || { label: status, variant: 'outline' as const, icon: Package };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleReorder = async (order: any) => {
    try {
      const reorderData = await api.reorderOrder(order.id);
      toast.success(t('Pedido agregado al carrito', 'Order added to cart'));
      // Navigate to order page with pre-filled data
      sessionStorage.setItem('orderPrefill', JSON.stringify({
        size: order.cake_size,
        filling: order.filling,
        theme: order.theme,
        dedication: order.dedication,
      }));
      navigate('/order');
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error(t('Error al reordenar', 'Error reordering'));
    }
  };

  const handleDownloadInvoice = async (order: any) => {
    try {
      // Generate invoice PDF (would use a PDF library)
      toast.info(t('Generando factura...', 'Generating invoice...'));
      // TODO: Implement PDF generation
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error(t('Error al descargar factura', 'Error downloading invoice'));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('Historial de Pedidos', 'Order History')}</CardTitle>
          <CardDescription>
            {t('Ver y gestionar tus pedidos anteriores', 'View and manage your previous orders')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder={t('Buscar por número de orden...', 'Search by order number...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('Estado', 'Status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('Todos', 'All')}</SelectItem>
                <SelectItem value="pending">{t('Pendiente', 'Pending')}</SelectItem>
                <SelectItem value="confirmed">{t('Confirmada', 'Confirmed')}</SelectItem>
                <SelectItem value="ready">{t('Lista', 'Ready')}</SelectItem>
                <SelectItem value="completed">{t('Completada', 'Completed')}</SelectItem>
                <SelectItem value="cancelled">{t('Cancelada', 'Cancelled')}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder={t('Desde', 'From')}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[150px]"
            />
            <Input
              type="date"
              placeholder={t('Hasta', 'To')}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[150px]"
            />
            <Button variant="outline" onClick={loadOrders}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('Actualizar', 'Refresh')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t('No se encontraron pedidos', 'No orders found')}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-mono">
                      {order.order_number}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {format(new Date(order.created_at), 'PPP')}
                    </CardDescription>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      {t('Fecha Necesaria', 'Date Needed')}:
                    </p>
                    <p>{order.date_needed} {order.time_needed}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      {t('Total', 'Total')}:
                    </p>
                    <p className="font-display text-xl font-bold text-primary">
                      {formatPrice(parseFloat(order.total_amount || 0))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      {t('Tamaño', 'Size')}:
                    </p>
                    <p>{order.cake_size}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      {t('Relleno', 'Filling')}:
                    </p>
                    <p>{order.filling}</p>
                  </div>
                  {order.delivery_option === 'delivery' && order.delivery_address && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-semibold text-muted-foreground mb-1">
                        {t('Dirección de Entrega', 'Delivery Address')}:
                      </p>
                      <p className="text-sm">{order.delivery_address}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {t('Ver Detalles', 'View Details')}
                  </Button>
                  {order.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(order)}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      {t('Reordenar', 'Reorder')}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(order)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t('Factura', 'Invoice')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Order Details Modal/Dialog would go here */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order #{selectedOrder.order_number}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order details would be displayed here */}
              <p>{JSON.stringify(selectedOrder, null, 2)}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
