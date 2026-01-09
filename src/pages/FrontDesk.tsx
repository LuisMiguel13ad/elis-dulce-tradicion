import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useOrdersFeed } from '@/hooks/useOrdersFeed';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Order } from '@/types/order';
import { printOrderTicket } from '@/utils/printTicket';

// Components
import { KitchenRedesignedLayout } from '@/components/kitchen/KitchenRedesignedLayout';
import { KitchenNavTabs, KitchenTab } from '@/components/kitchen/KitchenNavTabs';
import { ModernOrderCard } from '@/components/kitchen/ModernOrderCard';
import { OrderCalendarView } from '@/components/dashboard/OrderCalendarView';
import { OrderScheduler } from '@/components/dashboard/OrderScheduler';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Package, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const FrontDesk = () => {
  const { t } = useLanguage();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // Data Hooks
  const {
    orders,
    isLoading: feedLoading,
    refreshOrders,
    newOrderAlert,
    latestOrder,
    dismissAlert
  } = useOrdersFeed();

  // State
  const [activeTab, setActiveTab] = useState<KitchenTab>('active'); // Default to Active for Front Desk
  const [activeView, setActiveView] = useState<'queue' | 'upcoming' | 'calendar'>('queue');
  const [searchQuery, setSearchQuery] = useState('');

  // Auth Guard
  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.profile || (user.profile.role !== 'baker' && user.profile.role !== 'owner')) {
      toast.error('Unauthorized access');
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleOrderAction = async (orderId: number, action: 'confirm' | 'start' | 'ready' | 'delivery' | 'complete') => {
    let status = '';
    let successMsg = '';

    switch (action) {
      case 'delivery':
        status = 'out_for_delivery';
        successMsg = t('Enviada a domicilio', 'Dispatched for delivery');
        break;
      case 'complete':
        status = 'delivered';
        successMsg = t('Orden completada', 'Order completed');
        break;
      case 'confirm':
        status = 'confirmed';
        successMsg = t('Orden confirmada', 'Order confirmed');
        break;
    }

    if (!status) return;

    try {
      await api.updateOrderStatus(orderId, status);
      toast.success(successMsg);
      refreshOrders();
    } catch (error) {
      console.error(error);
      toast.error(t('Error al actualizar', 'Error updating status'));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  // Filter Logic
  const filteredOrders = orders.filter((order: Order) => {
    // 1. Tab Filter
    if (activeTab === 'active' && !['pending', 'confirmed', 'in_progress', 'ready'].includes(order.status)) return false;
    if (activeTab === 'ready' && order.status !== 'ready') return false;
    if (activeTab === 'pickup' && (order.status !== 'ready' || order.delivery_option !== 'pickup')) return false;
    if (activeTab === 'delivery' && (order.status !== 'ready' || order.delivery_option !== 'delivery')) return false;
    if (activeTab === 'done' && !['delivered', 'completed', 'cancelled'].includes(order.status)) return false;
    if (activeTab === 'new' && order.status !== 'pending') return false;
    // 'all' passes everything (or logically active ones? User said "All" in tabs)

    // 2. Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        order.customer_name?.toLowerCase().includes(query) ||
        order.order_number?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Calculate counts for tabs
  const getCount = (statusCheck: (o: Order) => boolean) => orders.filter(statusCheck).length;
  const counts = {
    all: orders.length,
    active: getCount(o => ['pending', 'confirmed', 'in_progress', 'ready'].includes(o.status)),
    new: getCount(o => o.status === 'pending'),
    preparing: getCount(o => ['confirmed', 'in_progress'].includes(o.status)),
    ready: getCount(o => o.status === 'ready'),
    pickup: getCount(o => o.status === 'ready' && o.delivery_option === 'pickup'),
    delivery: getCount(o => o.status === 'ready' && o.delivery_option === 'delivery'),
    done: getCount(o => ['delivered', 'completed'].includes(o.status)),
  };

  const renderContent = () => {
    // Logic for Calendar or Grid view could go here
    // For now, focusing on Grid view as per "Club Grub" style
    if (activeView === 'upcoming') {
      return (
        <div className="flex flex-col h-full overflow-hidden">
          <OrderScheduler
            orders={orders}
            onOrderClick={(order) => printOrderTicket(order)}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Tabs & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <KitchenNavTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-20">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <Package className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No orders in this view</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <ModernOrderCard
                key={order.id}
                order={order}
                onAction={handleOrderAction}
                onShowDetails={(o) => printOrderTicket(o)}
                isFrontDesk={true}
                variant="default" // Explicitly Light
              />
            ))
          )}
        </div>
      </div>
    );
  };

  if (authLoading || (feedLoading && orders.length === 0)) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <KitchenRedesignedLayout
      activeView={activeView}
      onChangeView={setActiveView}
      onLogout={handleLogout}
      title="Front Desk"
    >
      {/* New Order Alert Overlay */}
      <AnimatePresence>
        {newOrderAlert && latestOrder && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-24 right-8 z-50 w-96 p-4"
          >
            <Card className="bg-green-600 border-none shadow-2xl text-white">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <Bell className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg">New Order #{latestOrder.order_number}</h4>
                  <p className="text-green-100 text-sm">{latestOrder.cake_size}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={dismissAlert}>
                  View
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {renderContent()}

    </KitchenRedesignedLayout>
  );
};

export default FrontDesk;
