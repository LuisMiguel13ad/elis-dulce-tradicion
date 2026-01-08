import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderCalendarView } from '@/components/dashboard/OrderCalendarView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Bell, CheckCircle2, Clock, Package, Search, Truck, Home, ShoppingBag, XCircle, Printer, Phone, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { buildGoogleMapsUrl } from '@/lib/googleMaps';
import { useOrdersFeed } from '@/hooks/useOrdersFeed';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import TodayScheduleSummary from '@/components/dashboard/TodayScheduleSummary';
import CancelOrderModal from '@/components/order/CancelOrderModal';
import CustomerQuickActions from '@/components/order/CustomerQuickActions';
import ReferenceImageViewer from '@/components/order/ReferenceImageViewer';
import { useDashboardShortcuts } from '@/hooks/useDashboardShortcuts';
import { api } from '@/lib/api';
import { Order } from '@/types/order';
import { printOrderTicket } from '@/utils/printTicket';

const KitchenDisplay = () => {
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Use shared hook for data
  const {
    orders,
    stats,
    isLoading: feedLoading,
    isRefreshing,
    refreshOrders,
    newOrderAlert,
    latestOrder,
    dismissAlert
  } = useOrdersFeed();

  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [flashScreen, setFlashScreen] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number>(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auth Guard - Allow both baker and owner
  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.profile || (user.profile.role !== 'baker' && user.profile.role !== 'owner')) {
      toast.error('Unauthorized access');
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Flash effect on new order
  useEffect(() => {
    if (newOrderAlert) {
      setFlashScreen(true);
      setTimeout(() => setFlashScreen(false), 500);
    }
  }, [newOrderAlert]);

  const acknowledgeOrder = (orderId: number) => {
    setSeenIds(prev => new Set([...prev, orderId]));
  };

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      acknowledgeOrder(orderId);

      const statusMessages: Record<string, { es: string; en: string }> = {
        confirmed: { es: 'Orden confirmada', en: 'Order confirmed' },
        in_progress: { es: 'Orden en progreso', en: 'Order in progress' },
        ready: { es: 'Orden lista - Cliente notificado', en: 'Order ready - Customer notified' },
        out_for_delivery: { es: '🚗 Orden enviada', en: '🚗 Order dispatched' },
        delivered: { es: '✅ Orden entregada', en: '✅ Order delivered' },
      };

      const message = statusMessages[status];
      toast.success(t(message?.es || 'Actualizado', message?.en || 'Updated'));
      refreshOrders();
    } catch (error) {
      toast.error(t('Error al actualizar', 'Error updating status'));
    }
  };

  // Filter Logic
  const statusFilteredOrders = filter === 'all' ? orders : orders.filter((o: Order) => o.status === filter);

  const filteredOrders = searchQuery.trim() === ''
    ? statusFilteredOrders
    : statusFilteredOrders.filter((order: Order) => {
      const query = searchQuery.toLowerCase();
      return (
        order.customer_name?.toLowerCase().includes(query) ||
        order.order_number?.toLowerCase().includes(query) ||
        order.customer_phone?.includes(query) ||
        order.customer_email?.toLowerCase().includes(query)
      );
    });

  // Keyboard shortcuts
  useDashboardShortcuts({
    onRefresh: refreshOrders,
    onPrint: () => {
      const order = filteredOrders[selectedOrderIndex];
      if (order) printOrderTicket(order);
    },
    onSearch: () => searchInputRef.current?.focus(),
    onFilterAll: () => setFilter('all'),
    onFilterPending: () => setFilter('pending'),
    onFilterConfirmed: () => setFilter('confirmed'),
    onFilterInProgress: () => setFilter('in_progress'),
    onFilterReady: () => setFilter('ready'),
    onFilterDelivery: () => setFilter('out_for_delivery'),
    onNextOrder: () => setSelectedOrderIndex(prev => Math.min(prev + 1, filteredOrders.length - 1)),
    onPrevOrder: () => setSelectedOrderIndex(prev => Math.max(prev - 1, 0)),
    onEscape: () => {
      setCancelOrderId(null);
      setSearchQuery('');
    },
  });

  if (authLoading || (feedLoading && orders.length === 0)) {
    return <div className="min-h-screen flex items-center justify-center">{t('Cargando...', 'Loading...')}</div>;
  }

  return (
    <DashboardLayout
      title={t('Panel de Cocina', 'Kitchen Display')}
      onRefresh={refreshOrders}
      isRefreshing={isRefreshing}
    >
      <Tabs defaultValue="list" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list">{t('Lista de Órdenes', 'Orders List')}</TabsTrigger>
            <TabsTrigger value="calendar">{t('Calendario', 'Calendar')}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="space-y-6">
          {/* Screen Flash Effect */}
          <AnimatePresence>
            {flashScreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.3, 0] }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-primary pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* New Order Alert Banner */}
          <AnimatePresence>
            {newOrderAlert && latestOrder && (
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
              >
                <Card className="border-4 border-primary bg-card shadow-2xl">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="rounded-full bg-primary p-3 animate-pulse">
                      <Bell className="h-8 w-8 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-primary mb-2">
                        🎂 {t('¡NUEVA ORDEN!', 'NEW ORDER!')}
                      </h2>
                      <p className="text-lg font-semibold">#{latestOrder.order_number}</p>
                      <p className="font-medium">{latestOrder.customer_name}</p>
                      <p className="text-muted-foreground">{latestOrder.cake_size} - {latestOrder.filling}</p>
                      <Button onClick={dismissAlert} className="mt-4">{t('Entendido', 'Got it')}</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            {/* Stats Cards & Today's Schedule */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                  {[
                    { label: t('Total', 'Total'), count: stats.total, icon: ShoppingBag, color: 'blue' },
                    { label: t('Pendiente', 'Pending'), count: stats.pending, icon: Clock, color: 'yellow' },
                    { label: t('En Progreso', 'In Progress'), count: stats.inProgress, icon: Package, color: 'purple' },
                    { label: t('Listo', 'Ready'), count: stats.ready, icon: CheckCircle2, color: 'green' },
                    { label: t('Entrega', 'Delivery'), count: stats.outForDelivery, icon: Truck, color: 'orange' },
                  ].map((stat) => (
                    <Card key={stat.label} className={`border-l-4 border-l-${stat.color}-500`}>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.count}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-1">
                <TodayScheduleSummary orders={orders} />
              </div>
            </div>

            <Separator />

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder={t('Buscar por nombre, teléfono, orden... (F)', 'Search by name, phone, order... (F)')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: t('Todos', 'All') },
                  { key: 'pending', label: t('Pendiente', 'Pending') },
                  { key: 'confirmed', label: t('Confirmado', 'Confirmed') },
                  { key: 'in_progress', label: t('En Progreso', 'In Progress') },
                  { key: 'ready', label: t('Listo', 'Ready') },
                  { key: 'out_for_delivery', label: t('En Entrega', 'Delivering') },
                  { key: 'delivered', label: t('Entregado', 'Delivered') },
                  { key: 'cancelled', label: t('Cancelado', 'Cancelled') },
                ].map((status) => (
                  <Button
                    key={status.key}
                    variant={filter === status.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(status.key)}
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>{t('No hay órdenes', 'No orders found')}</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrders.map((order: Order, index: number) => {
                  const isNew = !seenIds.has(order.id) && order.status === 'pending';
                  const isSelected = index === selectedOrderIndex;

                  return (
                    <Card
                      key={order.id}
                      className={`h-full transition-all hover:shadow-md ${isNew ? 'border-primary border-2 animate-pulse' : ''} ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      onClick={() => setSelectedOrderIndex(index)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              #{order.order_number}
                              {isNew && <Badge className="animate-pulse bg-red-500">NEW</Badge>}
                            </CardTitle>
                            <CardDescription>{new Date(order.created_at).toLocaleDateString()}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                printOrderTicket(order);
                              }}
                              title={t('Imprimir Ticket', 'Print Ticket')}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Badge variant="outline" className="capitalize">{order.status.replace('_', ' ')}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Customer Info */}
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="font-semibold flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {order.customer_name}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {order.customer_phone}
                              </p>
                              {order.customer_email && (
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Mail className="h-3 w-3" />
                                  {order.customer_email}
                                </p>
                              )}
                            </div>
                            <CustomerQuickActions order={order} variant="dropdown" />
                          </div>
                        </div>

                        <Separator />

                        {/* Cake Details */}
                        <div>
                          <p className="text-lg font-bold text-primary">{order.cake_size}</p>
                          <p className="font-medium">{order.filling}</p>
                          <p className="text-sm text-muted-foreground mt-1">{t('Tema', 'Theme')}: {order.theme || t('Sin tema', 'No theme')}</p>
                          {order.dedication && (
                            <p className="text-sm italic mt-2 bg-primary/10 p-2 rounded">"{order.dedication}"</p>
                          )}
                        </div>

                        {/* Reference Image */}
                        {order.reference_image_path && (
                          <ReferenceImageViewer
                            imagePath={order.reference_image_path}
                            orderNumber={order.order_number}
                            theme={order.theme}
                          />
                        )}

                        {/* Due Date/Time */}
                        <div className="flex items-center gap-2 text-sm bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">{order.date_needed} @ {order.time_needed}</span>
                        </div>

                        {/* Delivery Info */}
                        {order.delivery_option === 'delivery' && order.delivery_address && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm border border-blue-200">
                            <div className="flex items-center gap-2 font-bold mb-1 text-blue-700">
                              <Truck className="h-4 w-4" /> {t('Entrega a Domicilio', 'Delivery')}
                            </div>
                            <a
                              href={buildGoogleMapsUrl(order.delivery_address)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline text-blue-600 block"
                            >
                              {order.delivery_address}
                            </a>
                          </div>
                        )}

                        {order.delivery_option === 'pickup' && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Home className="h-4 w-4" />
                            {t('Recoger en tienda', 'Pickup at store')}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col gap-2">
                          {order.status === 'pending' && (
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(order.id, 'confirmed');
                              }}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {t('Confirmar Orden', 'Confirm Order')}
                            </Button>
                          )}

                          {order.status === 'confirmed' && (
                            <Button
                              className="w-full bg-purple-600 hover:bg-purple-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(order.id, 'in_progress');
                              }}
                            >
                              {t('Empezar Preparación', 'Start Prep')}
                            </Button>
                          )}

                          {order.status === 'in_progress' && (
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(order.id, 'ready');
                              }}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {t('Marcar Listo', 'Mark Ready')}
                            </Button>
                          )}

                          {order.status === 'ready' && order.delivery_option === 'delivery' && (
                            <Button
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(order.id, 'out_for_delivery');
                              }}
                            >
                              <Truck className="mr-2 h-4 w-4" />
                              {t('Enviar a Entrega', 'Dispatch')}
                            </Button>
                          )}

                          {(order.status === 'out_for_delivery' || (order.status === 'ready' && order.delivery_option === 'pickup')) && (
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(order.id, 'delivered');
                              }}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {t('Completar Entrega', 'Complete')}
                            </Button>
                          )}

                          {/* Cancel Order Button */}
                          {!['cancelled', 'delivered', 'completed'].includes(order.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCancelOrderId(order.id);
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              {t('Cancelar Orden', 'Cancel Order')}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cancel Order Modal */}
          {cancelOrderId && (
            <CancelOrderModal
              order={filteredOrders.find((o: Order) => o.id === cancelOrderId)}
              open={!!cancelOrderId}
              onClose={() => setCancelOrderId(null)}
              onSuccess={() => {
                refreshOrders();
                setCancelOrderId(null);
              }}
              isAdmin={true}
            />
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <OrderCalendarView
            orders={orders}
            onOrderClick={(order) => {
              printOrderTicket(order);
            }}
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default KitchenDisplay;
