/**
 * Baker Station - Kitchen ticket view for bakers
 * Shows only confirmed/in_progress orders (not pending - those need Front Desk approval)
 * Bakers can: Start Baking, Mark Ready
 */
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useOrdersFeed } from '@/hooks/useOrdersFeed';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Order } from '@/types/order';

// Components
import FrontDeskLayout from '@/components/dashboard/FrontDeskLayout';
import { BakerTicketCard } from '@/components/kitchen/BakerTicketCard';
import { UrgentOrdersBanner } from '@/components/kitchen/UrgentOrdersBanner';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Package, Search, ChefHat, Clock, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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

  // Auth Guard - Skip in dev mode for testing
  const isDev = import.meta.env.DEV;
  useEffect(() => {
    if (isDev) {
      console.log('[BakerStation] Dev mode - skipping auth check');
      return;
    }
    if (authLoading) return;
    if (!user || !user.profile || (user.profile.role !== 'baker' && user.profile.role !== 'owner')) {
      toast.error('Unauthorized access');
      navigate('/login');
    }
  }, [user, authLoading, navigate, isDev]);

  // Mark order as ready - simple action
  const handleMarkReady = async (orderId: number) => {
    try {
      await api.updateOrderStatus(orderId, 'ready');
      toast.success(t('¡Orden lista para recoger!', 'Order ready for pickup!'));
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

  // Filter Logic - Bakers only see confirmed and in_progress orders (not pending!)
  const filteredOrders = orders.filter((order: Order) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        order.customer_name?.toLowerCase().includes(query) ||
        order.order_number?.toLowerCase().includes(query) ||
        order.cake_size?.toLowerCase().includes(query) ||
        order.theme?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Active = confirmed + in_progress (work to do)
  const activeOrders = filteredOrders.filter(o => ['confirmed', 'in_progress'].includes(o.status));
  // Ready for pickup
  const readyOrders = filteredOrders.filter(o => o.status === 'ready');
  // History
  const historyOrders = filteredOrders.filter(o => ['delivered', 'completed'].includes(o.status));

  // Sort by due time (most urgent first)
  const sortByUrgency = (orders: Order[]) => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(`${a.date_needed}T${a.time_needed}`);
      const dateB = new Date(`${b.date_needed}T${b.time_needed}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Stats
  const stats = {
    toDo: filteredOrders.filter(o => o.status === 'confirmed').length,
    inProgress: filteredOrders.filter(o => o.status === 'in_progress').length,
    ready: readyOrders.length
  };

  const renderContent = () => {
    let currentOrders: Order[] = [];
    let emptyTitle = "";
    let emptyMessage = "";
    let EmptyIcon = Package;

    switch (activeView) {
      case 'active':
        currentOrders = sortByUrgency(activeOrders);
        emptyTitle = t("¡Todo listo!", "All caught up!");
        emptyMessage = t("No hay órdenes pendientes. El Front Desk te enviará nuevas órdenes cuando lleguen.",
                        "No pending orders. Front Desk will send new orders when they come in.");
        EmptyIcon = ChefHat;
        break;
      case 'ready':
        currentOrders = sortByUrgency(readyOrders);
        emptyTitle = t("Sin órdenes listas", "No orders ready");
        emptyMessage = t("Las órdenes aparecerán aquí cuando estén listas para entregar.",
                        "Orders will appear here when they're ready for pickup.");
        EmptyIcon = Clock;
        break;
      case 'history':
        currentOrders = historyOrders.slice(0, 20); // Last 20
        emptyTitle = t("Sin historial", "No history");
        emptyMessage = t("Las órdenes completadas aparecerán aquí.", "Completed orders will appear here.");
        EmptyIcon = CheckCircle;
        break;
    }

    return (
      <div className="space-y-6">
        {/* Urgent Orders Banner */}
        <UrgentOrdersBanner
          orders={orders}
          urgentThresholdHours={4}
          onOrderClick={(order) => {
            // Could navigate to order or highlight it
          }}
          variant="dark"
        />

        {/* Stats Banner */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl border border-yellow-500/30">
            <ChefHat className="h-5 w-5" />
            <span className="font-bold">{stats.toDo}</span>
            <span className="text-yellow-300/70 text-sm">{t('Por hacer', 'To Do')}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl border border-blue-500/30">
            <Clock className="h-5 w-5" />
            <span className="font-bold">{stats.inProgress}</span>
            <span className="text-blue-300/70 text-sm">{t('En proceso', 'In Progress')}</span>
          </div>
          <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-xl border border-green-500/30">
            <CheckCircle className="h-5 w-5" />
            <span className="font-bold">{stats.ready}</span>
            <span className="text-green-300/70 text-sm">{t('Listos', 'Ready')}</span>
          </div>
        </div>

        {/* Search Bar */}
        {(orders.length > 0 || searchQuery) && (
          <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <Search className="text-slate-400 h-5 w-5" />
            <Input
              className="bg-transparent border-none text-white placeholder:text-slate-500 focus-visible:ring-0"
              placeholder={t('Buscar por orden, tamaño, tema...', 'Search by order, size, theme...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Order Grid - Consistent sizing with auto-rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
          {currentOrders.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-500">
              <div className="bg-slate-800/50 p-6 rounded-full mb-4 ring-1 ring-slate-700">
                <EmptyIcon className="h-12 w-12 opacity-50 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{emptyTitle}</h3>
              <p className="text-slate-400 text-center max-w-md">{emptyMessage}</p>
            </div>
          ) : (
            currentOrders.map((order) => (
              <BakerTicketCard
                key={order.id}
                order={order}
                onMarkReady={handleMarkReady}
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
      title={t("Estación de Panadero", "Baker Station")}
    >
      {/* New Order Alert */}
      <AnimatePresence>
        {newOrderAlert && latestOrder && latestOrder.status === 'confirmed' && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-24 right-8 z-50"
          >
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl p-4 shadow-2xl flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white">New Order Ready!</h4>
                <p className="text-sm text-white/80">
                  #{latestOrder.order_number} • {latestOrder.cake_size}
                </p>
              </div>
              <button
                onClick={dismissAlert}
                className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
              >
                View
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Content */}
      {renderContent()}
    </FrontDeskLayout>
  );
};

export default BakerStation;
