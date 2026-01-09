import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useOrdersFeed } from '@/hooks/useOrdersFeed';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Order } from '@/types/order';

// Components
import { KitchenRedesignedLayout } from '@/components/kitchen/KitchenRedesignedLayout';
import { KitchenNavTabs, KitchenTab } from '@/components/kitchen/KitchenNavTabs';
import { ModernOrderCard } from '@/components/kitchen/ModernOrderCard';
import { OrderCalendarView } from '@/components/dashboard/OrderCalendarView';
import { OrderScheduler } from '@/components/dashboard/OrderScheduler';
import { UrgentOrdersBanner } from '@/components/kitchen/UrgentOrdersBanner';
import { PrintPreviewModal } from '@/components/print/PrintPreviewModal'; // New Import
import { FullScreenOrderAlert } from '@/components/kitchen/FullScreenOrderAlert';
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
  const [activeTab, setActiveTab] = useState<KitchenTab>('active');
  const [activeView, setActiveView] = useState<'queue' | 'upcoming' | 'calendar'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Theme State

  // Dummy Order for Testing
  const testOrder: Order = {
    id: 9999,
    order_number: 'ORD-TEST-001',
    customer_name: 'Maria Garcia',
    status: 'pending',
    cake_size: '8" Round',
    filling: 'Tres Leches',
    time_needed: '14:00',
    date_needed: '2026-01-12',
    delivery_option: 'pickup',
    created_at: new Date().toISOString(),
    reference_image_path: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  };

  // Auth Guard - Skip in dev mode for testing
  const isDev = import.meta.env.DEV;
  useEffect(() => {
    if (isDev) {
      console.log('[FrontDesk] Dev mode - skipping auth check');
      return;
    }
    if (authLoading) return;
    if (!user || !user.profile || (user.profile.role !== 'baker' && user.profile.role !== 'owner')) {
      toast.error('Unauthorized access');
      navigate('/login');
    }
  }, [user, authLoading, navigate, isDev]);

  // ... (handleOrderAction logic is correct)

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
        status = 'in_progress';
        successMsg = t('Orden aceptada y en preparación', 'Order accepted & preparing');
        break;
      case 'start':
        status = 'in_progress';
        successMsg = t('Comenzando preparación', 'Started preparing');
        break;
      case 'ready':
        status = 'ready';
        successMsg = t('Orden lista', 'Order marked ready');
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

  // Filter Logic logic...
  const filteredOrders = orders.filter((order: Order) => {
    // 1. Tab Filter
    if (activeTab === 'active' && !['pending', 'confirmed', 'in_progress', 'ready'].includes(order.status)) return false;
    if (activeTab === 'pickup' && (order.status !== 'ready' || order.delivery_option !== 'pickup')) return false;
    if (activeTab === 'delivery' && (order.status !== 'ready' || order.delivery_option !== 'delivery')) return false;
    if (activeTab === 'done' && !['delivered', 'completed', 'cancelled'].includes(order.status)) return false;
    if (activeTab === 'new' && order.status !== 'pending') return false;
    if (activeTab === 'preparing' && !['confirmed', 'in_progress'].includes(order.status)) return false;

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

  const getCount = (statusCheck: (o: Order) => boolean) => orders.filter(statusCheck).length;
  const counts = {
    all: orders.length,
    active: getCount(o => ['pending', 'confirmed', 'in_progress', 'ready'].includes(o.status)),
    new: getCount(o => o.status === 'pending'),
    preparing: getCount(o => ['confirmed', 'in_progress'].includes(o.status)),
    pickup: getCount(o => o.status === 'ready' && o.delivery_option === 'pickup'),
    delivery: getCount(o => o.status === 'ready' && o.delivery_option === 'delivery'),
    done: getCount(o => ['delivered', 'completed'].includes(o.status)),
  };

  const renderContent = () => {
    if (activeView === 'upcoming') {
      return (
        <div className="flex flex-col h-full overflow-hidden">
          <OrderScheduler
            orders={orders}
            onOrderClick={(order) => setSelectedOrder(order)}
            darkMode={isDarkMode}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Helper Buttons for Testing */}
        <div className="fixed bottom-4 left-4 z-40 flex flex-col gap-2">
          <Button
            variant="destructive"
            onClick={() => setIsTestOpen(true)}
            className="shadow-xl border-2 border-white bg-red-600 hover:bg-red-700"
          >
            🚨 Test Full Alert
          </Button>
          <Button
            variant="default"
            onClick={() => toast.success('🔔 New Order Notification', { description: '#ORD-TEST-002 - Simple notification test' })}
            className="shadow-xl border-2 border-white bg-blue-600 hover:bg-blue-700"
          >
            💬 Test Toast
          </Button>
        </div>

        {/* FullScreen Alert */}
        <FullScreenOrderAlert
          isOpen={newOrderAlert || isTestOpen}
          order={isTestOpen ? testOrder : latestOrder}
          onClose={() => {
            dismissAlert();
            setIsTestOpen(false);
          }}
          onViewOrder={(order) => {
            setSelectedOrder(order);
            dismissAlert();
            setIsTestOpen(false);
          }}
        />

        {/* Tabs & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <KitchenNavTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts as any}
            darkMode={isDarkMode}
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
                onShowDetails={(o) => setSelectedOrder(o)}
                isFrontDesk={true}
                variant={isDarkMode ? 'dark' : 'default'}
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
      darkMode={isDarkMode}
      onToggleTheme={() => setIsDarkMode(!isDarkMode)}
    >
      <PrintPreviewModal
        isOpen={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      {renderContent()}

    </KitchenRedesignedLayout>
  );
};

export default FrontDesk;
