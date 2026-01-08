import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Volume2, VolumeX, Package } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrdersFeed } from '@/hooks/useOrdersFeed';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import BakerWorkCard from '@/components/kitchen/BakerWorkCard';
import { api } from '@/lib/api';
import { Order } from '@/types/order';
import { parseISO, differenceInMinutes } from 'date-fns';

const BakeryDashboard = () => {
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Use shared hook for data
  const {
    orders,
    isLoading: feedLoading,
    isRefreshing,
    refreshOrders,
    newOrderAlert,
    latestOrder,
    dismissAlert
  } = useOrdersFeed();

  const [flashScreen, setFlashScreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.7;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Auth Guard
  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.profile || (user.profile.role !== 'baker' && user.profile.role !== 'owner')) {
      toast.error('Unauthorized access');
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Flash effect and sound on new order
  useEffect(() => {
    if (newOrderAlert) {
      setFlashScreen(true);
      setTimeout(() => setFlashScreen(false), 500);

      // Play notification sound
      if (soundEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // Audio play might fail without user interaction
        });
      }
    }
  }, [newOrderAlert, soundEnabled]);

  // Sort orders by urgency (due soonest first)
  const sortedOrders = [...orders]
    .filter((order: Order) => ['pending', 'confirmed', 'in_progress', 'ready'].includes(order.status))
    .sort((a: Order, b: Order) => {
      // Priority: pending first, then by due time
      const statusPriority: Record<string, number> = {
        pending: 0,
        confirmed: 1,
        in_progress: 2,
        ready: 3,
      };

      const aPriority = statusPriority[a.status] ?? 4;
      const bPriority = statusPriority[b.status] ?? 4;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Same status, sort by due time
      try {
        const aDateTime = parseISO(`${a.date_needed}T${a.time_needed}`);
        const bDateTime = parseISO(`${b.date_needed}T${b.time_needed}`);
        return differenceInMinutes(aDateTime, bDateTime);
      } catch {
        return 0;
      }
    });

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);

      const statusMessages: Record<string, { es: string; en: string }> = {
        confirmed: { es: 'Orden aceptada', en: 'Order accepted' },
        in_progress: { es: 'Preparación iniciada', en: 'Prep started' },
        ready: { es: '¡Orden lista!', en: 'Order ready!' },
      };

      const message = statusMessages[status];
      toast.success(t(message?.es || 'Actualizado', message?.en || 'Updated'));
      refreshOrders();
    } catch (error) {
      toast.error(t('Error al actualizar', 'Error updating'));
    }
  };

  const handleAccept = (orderId: number) => updateStatus(orderId, 'confirmed');
  const handleStart = (orderId: number) => updateStatus(orderId, 'in_progress');
  const handleReady = (orderId: number) => updateStatus(orderId, 'ready');

  // Count by status
  const pendingCount = sortedOrders.filter((o: Order) => o.status === 'pending').length;
  const inProgressCount = sortedOrders.filter((o: Order) => o.status === 'in_progress').length;
  const readyCount = sortedOrders.filter((o: Order) => o.status === 'ready').length;

  if (authLoading || (feedLoading && orders.length === 0)) {
    return <div className="min-h-screen flex items-center justify-center">{t('Cargando...', 'Loading...')}</div>;
  }

  return (
    <DashboardLayout
      title={t('Cola del Panadero', 'Baker Queue')}
      onRefresh={refreshOrders}
      isRefreshing={isRefreshing}
    >
      {/* Screen Flash Effect */}
      <AnimatePresence>
        {flashScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-yellow-400 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Full Screen New Order Alert */}
      <AnimatePresence>
        {newOrderAlert && latestOrder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-lg border-4 border-yellow-400 bg-card shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="rounded-full bg-yellow-400 p-4 w-20 h-20 mx-auto mb-6 animate-bounce">
                  <Bell className="h-12 w-12 text-yellow-900" />
                </div>
                <h2 className="text-4xl font-bold text-yellow-600 mb-4">
                  🎂 {t('¡NUEVA ORDEN!', 'NEW ORDER!')}
                </h2>
                <div className="bg-muted rounded-lg p-6 mb-6 text-left">
                  <p className="text-2xl font-bold mb-2">#{latestOrder.order_number}</p>
                  <p className="text-xl font-medium text-primary">{latestOrder.cake_size}</p>
                  <p className="text-lg">{latestOrder.filling}</p>
                  {latestOrder.theme && (
                    <p className="text-muted-foreground mt-2">{latestOrder.theme}</p>
                  )}
                  <p className="mt-4 font-semibold">
                    {t('Para', 'Due')}: {latestOrder.date_needed} @ {latestOrder.time_needed}
                  </p>
                </div>
                <Button
                  onClick={dismissAlert}
                  className="w-full text-xl py-6 bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold"
                >
                  {t('¡ENTENDIDO!', 'GOT IT!')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Quick Stats Bar */}
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{pendingCount}</p>
              <p className="text-xs text-muted-foreground uppercase">{t('Nuevos', 'New')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{inProgressCount}</p>
              <p className="text-xs text-muted-foreground uppercase">{t('En Progreso', 'In Progress')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{readyCount}</p>
              <p className="text-xs text-muted-foreground uppercase">{t('Listos', 'Ready')}</p>
            </div>
          </div>

          {/* Sound Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={soundEnabled ? 'text-green-600' : 'text-muted-foreground'}
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
        </div>

        {/* Orders Grid */}
        {sortedOrders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl">{t('No hay órdenes en cola', 'No orders in queue')}</p>
            <p className="text-sm mt-2">{t('Las nuevas órdenes aparecerán aquí', 'New orders will appear here')}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedOrders.map((order: Order) => (
              <BakerWorkCard
                key={order.id}
                order={order}
                onAccept={handleAccept}
                onStart={handleStart}
                onReady={handleReady}
                isSelected={selectedOrderId === order.id}
                onClick={() => setSelectedOrderId(order.id)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BakeryDashboard;
