import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Clock, CheckCircle2, AlertTriangle, Printer, Truck, MapPin, XCircle, Wifi, WifiOff } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrdersFeed } from '@/hooks/useOrdersFeed';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CancelOrderModal from '@/components/order/CancelOrderModal';
import ReferenceImageViewer from '@/components/order/ReferenceImageViewer';
import { useDashboardShortcuts } from '@/hooks/useDashboardShortcuts';
import { printOrderTicket } from '@/utils/printTicket';
import { Order } from '@/types/order';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { useIsMobile } from '@/hooks/use-mobile';
import { PullToRefresh } from '@/components/mobile/PullToRefresh';
import { MobileOrderCard } from '@/components/mobile/MobileOrderCard';
import { QuickFilterBar } from '@/components/order/QuickFilterBar';
import { OrderStatus } from '@/types/orderState';

// Helper to get sortable date value
const getSortableDate = (order: Order) => {
  if (!order.date_needed) return 9999999999999; // Far future if no date
  const time = order.time_needed || '23:59';
  return new Date(`${order.date_needed}T${time}`).getTime();
};

const KitchenDisplay = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  
  const { orders, refreshOrders, isRefreshing, newOrderAlert, latestOrder, dismissAlert } = useOrdersFeed('baker');
  
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [filteredActiveOrders, setFilteredActiveOrders] = useState<Order[]>([]);
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState<Order | null>(null);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number>(0);

  // Keyboard shortcuts for Kitchen Display
  useDashboardShortcuts({
    onRefresh: refreshOrders,
    onPrint: () => {
      const order = filteredActiveOrders[selectedOrderIndex];
      if (order) printOrderTicket(order);
    },
    onFilterAll: () => setStatusFilter('all'),
    onFilterPending: () => setStatusFilter('pending'),
    onFilterConfirmed: () => setStatusFilter('confirmed'),
    onFilterInProgress: () => setStatusFilter('in_progress'),
    onFilterReady: () => setStatusFilter('ready'),
    onNextOrder: () => setSelectedOrderIndex(prev => Math.min(prev + 1, filteredActiveOrders.length - 1)),
    onPrevOrder: () => setSelectedOrderIndex(prev => Math.max(prev - 1, 0)),
    onEscape: () => {
      setCancelOrderId(null);
      setIsReviewing(false);
    },
  });
  
  // Real-time connection status
  const { isConnected } = useRealtimeOrders({
    filterByUserId: false, // Bakers see all orders
  });

  // Track which confirmed orders have been "seen" locally to prevent infinite popup loop
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());

  // Track which urgent alerts have been dismissed/handled locally
  const [remindedIds, setRemindedIds] = useState<Set<number>>(new Set());

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user || !user.profile || user.profile.role !== 'baker') {
      // Allow owner to view too, but primary use is baker
      if (user?.profile?.role !== 'owner') {
        navigate('/login');
      }
    }
  }, [user, isAuthLoading, navigate]);

  // Filter Active Orders for Kitchen
  useEffect(() => {
      // Filter out delivered/completed orders
     const filtered = orders.filter((o: Order) => 
        ['pending', 'confirmed', 'in_progress', 'ready'].includes(o.status)
      );
      
      // Sort by Date Needed (Soonest first)
      filtered.sort((a: Order, b: Order) => getSortableDate(a) - getSortableDate(b));
      setActiveOrders(filtered);
      
      // Apply status filter
      if (statusFilter === 'all') {
        setFilteredActiveOrders(filtered);
      } else {
        setFilteredActiveOrders(filtered.filter((o: Order) => o.status === statusFilter));
      }

      // Get today's delivery orders
      const today = new Date().toISOString().split('T')[0];
      const deliveries = orders.filter((o: Order) => 
        o.delivery_option === 'delivery' && 
        o.date_needed === today &&
        o.status !== 'cancelled' &&
        o.status !== 'completed'
      );
      setDeliveryOrders(deliveries);

  }, [orders, statusFilter]);



  const updateStatus = async (orderId: number, newStatus: string) => {
    try {
      // If acknowledging/accepting, add to seenIds so popup closes
      setSeenIds(prev => new Set([...prev, orderId]));

      await api.updateOrderStatus(orderId, newStatus);
      
      if (newStatus === 'confirmed') {
        toast.success('Order Accepted');
      } else if (newStatus === 'ready') {
        toast.success('Order Marked Ready');
      }
      
      refreshOrders(); // Sync
    } catch (error) {
      toast.error('Failed to update status');
      refreshOrders(); // Revert
    }
  };

  const updateDeliveryStatus = async (orderId: number, deliveryStatus: string, notes?: string) => {
    try {
      await api.updateDeliveryStatus(orderId, deliveryStatus, notes);
      toast.success(`Delivery status updated to ${deliveryStatus}`);
      refreshOrders();
      setSelectedDeliveryOrder(null);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error('Failed to update delivery status');
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    await updateStatus(orderId, 'confirmed');
    setRemindedIds(prev => new Set([...prev, orderId])); // Prevent immediate Red Alert
  };

  const handleNeedsTime = (orderId: number) => {
    // Mark as reminded so we don't nag again immediately (until refresh)
    setRemindedIds(prev => new Set([...prev, orderId]));
    setSeenIds(prev => new Set([...prev, orderId])); // Prevent Gold Alert from looping
    toast.info('Reminder acknowledged. Please contact client if needed.');
  };

  // Determine if there is an active alert (Full Screen Takeover)
  // Logic: 
  // 1. Any 'pending' order takes over (needs Accept)
  // 2. Any 'confirmed' (paid) order that hasn't been acknowledged locally takes over
  const activeAlert = activeOrders.find((o: Order) => 
    (o.status === 'pending') || 
    (o.status === 'confirmed' && !seenIds.has(o.id))
  );

  // Determine if there is an URGENT alert (Due Soon)
  // Logic:
  // 1. Due TODAY
  // 2. Status is NOT ready/delivered
  // 3. Time needed is within 30 minutes from now
  // 4. Not already reminded locally
  const urgentAlert = activeOrders.find((o: Order) => {
      if (o.status === 'ready' || o.status === 'delivered' || o.status === 'completed') return false;
      if (remindedIds.has(o.id)) return false;
      
      // Simple date check (could use date-fns isToday)
      const todayStr = new Date().toISOString().split('T')[0];
      if (o.date_needed !== todayStr) return false;
      
      if (!o.time_needed) return false;
      const dueTime = new Date(`${o.date_needed}T${o.time_needed}`);
      const now = new Date();
      
      const diffMinutes = differenceInMinutes(dueTime, now);
      
      // Alert if due within 30 mins (and not overdue by more than 2 hours)
      return diffMinutes <= 30 && diffMinutes > -120; 
  });

  // Reset isReviewing when activeAlert is gone
  useEffect(() => {
    if (!activeAlert) {
      setIsReviewing(false);
    }
  }, [activeAlert]);

  // Audio Loop Logic based on alerts
  useEffect(() => {
    if (activeAlert || urgentAlert) {
      // Try to play sound (use shared audio or new one)
      // Note: useOrdersFeed has its own audio, might want to unify or disable hook audio for kitchen specific sounds
    }
  }, [activeAlert, urgentAlert]);


  return (
    <DashboardLayout 
        title="Kitchen Display System" 
        onRefresh={refreshOrders} 
        isRefreshing={isRefreshing}
    >
      <div className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-end gap-2 mb-4">
          {isConnected ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Wifi className="mr-1 h-3 w-3" />
              Live Updates
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <WifiOff className="mr-1 h-3 w-3" />
              Offline
            </Badge>
          )}
          <Badge variant="outline">
            {activeOrders.length} Active Orders
          </Badge>
        </div>
        
        {/* Full Screen Alert Overlay for New/Urgent Orders */}
      <AnimatePresence>
          {activeAlert && !isReviewing && (
          <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
             >
               <Card className="w-full max-w-2xl border-4 border-yellow-400 shadow-2xl animate-pulse-slow">
                 <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
                   <CardTitle className="text-3xl font-bold text-center text-yellow-700 flex items-center justify-center gap-3">
                     <AlertTriangle className="h-10 w-10" />
                     {activeAlert.status === 'pending' ? 'NEW ORDER REQUEST' : 'NEW ORDER CONFIRMED'}
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-4xl font-bold">{activeAlert.cake_size}</h2>
                      <p className="text-2xl text-muted-foreground">{activeAlert.filling}</p>
                      <div className="py-4">
                        <Badge variant="outline" className="text-xl px-4 py-1">
                          Due: {activeAlert.time_needed}
                  </Badge>
                      </div>
                      <p className="text-xl italic">"{activeAlert.theme}"</p>
                      </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="h-20 text-xl border-2"
                        onClick={() => handleNeedsTime(activeAlert.id)}
                      >
                        Needs Review
                      </Button>
                <Button 
                        size="lg" 
                        className="h-20 text-xl bg-green-600 hover:bg-green-700"
                  onClick={() => handleAcceptOrder(activeAlert.id)}
                >
                        {activeAlert.status === 'pending' ? 'ACCEPT ORDER' : 'START PREPPING'}
                </Button>
              </div>
                 </CardContent>
               </Card>
          </motion.div>
        )}
      </AnimatePresence>
        
        {/* Quick Filter Bar */}
        <div className="mb-6">
          <QuickFilterBar
            activeStatus={statusFilter}
            onStatusChange={setStatusFilter}
            orderCounts={{
              all: activeOrders.length,
              pending: activeOrders.filter(o => o.status === 'pending').length,
              confirmed: activeOrders.filter(o => o.status === 'confirmed').length,
              in_progress: activeOrders.filter(o => o.status === 'in_progress').length,
              ready: activeOrders.filter(o => o.status === 'ready').length,
            }}
          />
        </div>

        {/* Orders Board */}
        <PullToRefresh onRefresh={refreshOrders}>
            {isMobile ? (
              // Mobile: Swipeable cards
              <div className="space-y-4">
                {filteredActiveOrders.map((order: Order) => (
                  <MobileOrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={(orderId, status) => updateStatus(orderId, status)}
                    onView={(orderId) => {
                      const order = activeOrders.find(o => o.id === orderId);
                      if (order) printOrderTicket(order);
                    }}
                  />
                ))}
                {filteredActiveOrders.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                    <p className="text-xl font-medium">All caught up! 🎉</p>
                    <p>No active orders in the queue.</p>
                  </div>
                )}
              </div>
            ) : (
              // Desktop: Grid layout
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredActiveOrders.map((order: Order, index: number) => {
                  const isSelected = index === selectedOrderIndex;
                  return (
                  <Card 
                    key={order.id} 
                    className={`border-2 flex flex-col cursor-pointer transition-all ${
                      order.status === 'ready' ? 'border-green-500 bg-green-50/10' : 
                      order.status === 'in_progress' ? 'border-purple-500' : 'border-border'
                    } ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    onClick={() => setSelectedOrderIndex(index)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                      <Badge variant="outline" className="font-mono text-sm">#{order.order_number}</Badge>
                      <div className="flex items-center gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => printOrderTicket(order)}
                            title="Print Ticket"
                        >
                            <Printer className="h-4 w-4" />
                        </Button>
                        <Badge className={`
                            ${order.status === 'confirmed' ? 'bg-blue-500' : 
                              order.status === 'in_progress' ? 'bg-purple-500' : 
                              order.status === 'ready' ? 'bg-green-500' : 'bg-gray-500'}
                        `}>
                            {order.status}
                          </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl mt-2">{order.cake_size}</CardTitle>
                    <CardDescription>{order.filling}</CardDescription>
                    </CardHeader>
                 
                 <CardContent className="flex-1 flex flex-col gap-4">
                    <div className="bg-muted/30 p-3 rounded-lg flex-1">
                       <p className="font-semibold text-sm text-muted-foreground uppercase mb-1">{t('Tema / Diseño', 'Theme / Design')}</p>
                       <p className="text-lg font-medium leading-snug">{order.theme}</p>
                        {order.dedication && (
                         <p className="mt-2 text-sm italic">"{order.dedication}"</p>
                        )}
                        {order.reference_image_path && (
                          <div className="mt-3">
                            <ReferenceImageViewer 
                              imagePath={order.reference_image_path}
                              orderNumber={order.order_number}
                              theme={order.theme}
                            />
                          </div>
                        )}
                      </div>
                      
                    <div className="flex items-center justify-between text-sm font-medium">
                       <div className="flex items-center gap-1">
                         <Clock className="h-4 w-4 text-muted-foreground" />
                         <span>{order.time_needed}</span>
                       </div>
                       <span>{new Date(order.date_needed).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-auto">
                       {order.status === 'confirmed' && (
                          <Button className="col-span-2 w-full bg-purple-600 hover:bg-purple-700" onClick={() => updateStatus(order.id, 'in_progress')}>
                             Start Order
                        </Button>
                      )}
                       
                       {order.status === 'in_progress' && (
                          <Button className="col-span-2 w-full bg-green-600 hover:bg-green-700" onClick={() => updateStatus(order.id, 'ready')}>
                             Mark Ready
                          </Button>
                       )}
                       
                       {order.status === 'ready' && (
                          <div className="col-span-2 bg-green-100 text-green-800 text-center py-2 rounded font-bold flex items-center justify-center gap-2">
                             <CheckCircle2 className="h-5 w-5" />
                             READY
                  </div>
                )}
                       
                       {/* Cancel Order Button */}
                       {order.status !== 'cancelled' && order.status !== 'completed' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="col-span-2 w-full"
                            onClick={() => setCancelOrderId(order.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                       )}
              </div>
                    </CardContent>
                  </Card>
                  );
                })}
             
                {filteredActiveOrders.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                    <p className="text-xl font-medium">All caught up! 🎉</p>
                    <p>No active orders in the queue.</p>
                  </div>
                )}
              </div>
            )}
          </PullToRefresh>

        {/* Delivery Orders Section */}
        {deliveryOrders.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Today's Deliveries ({deliveryOrders.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveryOrders.map((order: Order) => (
                <Card key={order.id} className="border-2 border-blue-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="font-mono">#{order.order_number}</Badge>
                      <Badge variant={
                        order.delivery_status === 'delivered' ? 'default' :
                        order.delivery_status === 'in_transit' ? 'default' :
                        order.delivery_status === 'assigned' ? 'secondary' :
                        'outline'
                      }>
                        {order.delivery_status || 'pending'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{order.customer_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.delivery_address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-muted-foreground">Address:</p>
                          <p className="text-sm">{order.delivery_address}</p>
                          {order.delivery_apartment && (
                            <p className="text-xs text-muted-foreground">Apt: {order.delivery_apartment}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {order.delivery_zone && (
                      <div>
                        <span className="text-xs text-muted-foreground">Zone: </span>
                        <Badge variant="outline" className="text-xs">{order.delivery_zone}</Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{order.time_needed}</span>
                    </div>
                    <div className="flex gap-2">
                      {order.delivery_status === 'assigned' && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => updateDeliveryStatus(order.id, 'in_transit')}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Out for Delivery
                        </Button>
                      )}
                      {order.delivery_status === 'in_transit' && (
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => updateDeliveryStatus(order.id, 'delivered')}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark Delivered
                        </Button>
                      )}
                      {(!order.delivery_status || order.delivery_status === 'pending') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedDeliveryOrder(order)}
                        >
                          Manage Delivery
                        </Button>
                      )}
                      {/* Cancel Order Button */}
                      {order.status !== 'cancelled' && order.status !== 'completed' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => setCancelOrderId(order.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      )}
                    </div>
                    {order.driver_notes && (
                      <div className="rounded bg-muted p-2 text-xs">
                        <span className="font-semibold">Notes: </span>
                        {order.driver_notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}


        {/* Cancel Order Modal */}
        {cancelOrderId && (
          <CancelOrderModal
            order={[...activeOrders, ...deliveryOrders].find((o: Order) => o.id === cancelOrderId)}
            open={!!cancelOrderId}
            onClose={() => setCancelOrderId(null)}
            onSuccess={() => {
              refreshOrders();
              setCancelOrderId(null);
            }}
            isAdmin={true}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default KitchenDisplay;
