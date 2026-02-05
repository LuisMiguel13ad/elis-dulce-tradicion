import { useState, useEffect } from 'react';
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
import { OrderScheduler } from '@/components/dashboard/OrderScheduler';
import { PrintPreviewModal } from '@/components/print/PrintPreviewModal';
import { FullScreenOrderAlert } from '@/components/kitchen/FullScreenOrderAlert';
import { Package } from 'lucide-react';

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
  const [isDarkMode, setIsDarkMode] = useState(true); // Theme State

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

    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;
    const oldStatus = targetOrder.status;

    try {
      await api.updateOrderStatus(orderId, status);
      toast.success(successMsg);

      // Send Email Notifications
      if (action === 'ready') {
        toast.info(t('Enviando correo...', 'Sending email...'));
        api.sendReadyNotification(targetOrder).then(({ success, error }) => {
          if (success) toast.success(t('Correo enviado', 'Email sent'));
          else console.error("Email failed", error);
        });
      } else if (action === 'delivery' || action === 'complete') {
        const finalStatus = action === 'delivery' ? 'delivered' : 'completed';
        toast.info(t('Enviando correo...', 'Sending email...'));
        api.sendStatusUpdate(targetOrder, oldStatus, finalStatus).then(({ success, error }) => {
          if (success) toast.success(t('Correo enviado', 'Email sent'));
          else console.error("Email failed", error);
        });
      }

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
  }).sort((a, b) => {
    // Sort by Due Date/Time (Ascending - Earliest due first)
    const dateA = new Date(`${a.date_needed}T${a.time_needed}`);
    const dateB = new Date(`${b.date_needed}T${b.time_needed}`);
    return dateA.getTime() - dateB.getTime();
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
        {/* FullScreen Alert */}
        <FullScreenOrderAlert
          isOpen={newOrderAlert}
          order={latestOrder}
          onClose={() => {
            dismissAlert();
          }}
          onViewOrder={(order) => {
            setSelectedOrder(order);
            dismissAlert();
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
