import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useOrdersFeed } from '@/hooks/useOrdersFeed';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Order } from '@/types/order';
import { printOrderTicket } from '@/utils/printTicket';

// Components
import FrontDeskLayout from '@/components/dashboard/FrontDeskLayout'; // Recycled Dark Layout
import { ModernOrderCard } from '@/components/kitchen/ModernOrderCard';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BakerStation = () => {
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
  const [activeView, setActiveView] = useState<'ready' | 'active' | 'history'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

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
      case 'confirm':
        status = 'confirmed';
        successMsg = t('Orden aceptada', 'Order accepted');
        break;
      case 'start':
        status = 'in_progress';
        successMsg = t('Preparación iniciada', 'Baking started');
        break;
      case 'ready':
        status = 'ready';
        successMsg = t('Orden lista', 'Order ready');
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
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        order.customer_name?.toLowerCase().includes(query) ||
        order.order_number?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const activeOrders = filteredOrders.filter(o => ['pending', 'confirmed', 'in_progress'].includes(o.status));
  const readyOrders = filteredOrders.filter(o => o.status === 'ready'); // Or history? 
  // Baker mostly cares about active. Let's map 'ready' view to Completed/History for checking
  const historyOrders = filteredOrders.filter(o => ['delivered', 'completed', 'ready'].includes(o.status));

  const renderContent = () => {
    let currentOrders: Order[] = [];
    let emptyTitle = "";
    let emptyMessage = "";
    let EmptyIcon = Package;

    switch (activeView) {
      case 'active':
        currentOrders = activeOrders;
        emptyTitle = t("Todo listo por ahora", "All caught up!");
        emptyMessage = t("No hay tickets de cocina pendientes.", "No pending kitchen tickets.");
        EmptyIcon = Package; // Or a Check icon
        break;
      case 'ready':
        currentOrders = readyOrders;
        emptyTitle = t("Zona de recogida vacía", "Pickup zone clear");
        emptyMessage = t("No hay órdenes listas para recoger.", "No orders currently waiting for pickup.");
        EmptyIcon = Bell;
        break;
      case 'history':
        currentOrders = historyOrders;
        emptyTitle = t("Sin historial reciente", "No recent history");
        emptyMessage = t("No se encontraron órdenes pasadas.", "No past orders found.");
        EmptyIcon = Search;
        break;
    }

    return (
      <div className="space-y-6">
        {/* Search Bar - Dark Themed - Only show if we have orders or searching */}
        {(orders.length > 0 || searchQuery) && (
          <div className="flex items-center gap-4 bg-[#1f2937] p-4 rounded-xl border border-slate-700/50">
            <Search className="text-slate-400 h-5 w-5" />
            <Input
              className="bg-transparent border-none text-white placeholder:text-slate-500 focus-visible:ring-0"
              placeholder={t('Buscar órdenes...', 'Search orders...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentOrders.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-500">
              <div className="bg-slate-800/50 p-6 rounded-full mb-4 ring-1 ring-slate-700">
                <EmptyIcon className="h-10 w-10 opacity-50 text-slate-400" /> {/* Dynamic Icon */}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{emptyTitle}</h3>
              <p className="text-slate-400 text-center max-w-sm">{emptyMessage}</p>
            </div>
          ) : (
            currentOrders.map((order) => (
              <ModernOrderCard
                key={order.id}
                order={order}
                onAction={handleOrderAction}
                variant="dark"
              />
            ))
          )}
        </div>
      </div>
    );
  };

  if (authLoading || (feedLoading && orders.length === 0)) {
    return (
      <div className="min-h-screen bg-[#13141f] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <FrontDeskLayout
      activeView={activeView}
      onChangeView={setActiveView}
      onLogout={handleLogout}
      soundEnabled={soundEnabled}
      onToggleSound={() => setSoundEnabled(!soundEnabled)}
      title="Baker Station"
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
            <div className="bg-green-100 p-2 rounded-full">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">New Order Received!</h4>
              <p className="text-sm text-gray-600">
                #{latestOrder.order_number} • {latestOrder.customer_name}
              </p>
            </div>
            <button
              onClick={dismissAlert}
              className="ml-auto text-sm font-medium text-green-600 hover:text-green-700"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </FrontDeskLayout>
  );
};

export default BakerStation;

