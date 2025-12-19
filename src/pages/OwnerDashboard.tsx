/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  AlertTriangle,
  Truck,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  Clock,
  XCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { formatPrice } from '@/lib/pricing';
import { 
  getDashboardMetrics, 
  getRevenueByPeriod, 
  getPopularItems, 
  getOrdersByStatus,
  getPeakOrderingTimes,
  getCapacityUtilization,
  getTodayDeliveries,
  getLowStockItems,
  generateDailySalesReport,
  generateInventoryReport,
  generateCustomerActivityReport,
  type DashboardMetrics,
  type RevenueDataPoint,
  type PopularItem,
  type OrderStatusBreakdown,
  type PeakOrderingTime,
  type CapacityUtilization
} from '@/lib/analytics';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
import CancelOrderModal from '@/components/order/CancelOrderModal';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { useOrdersFeed } from '@/hooks/useOrdersFeed';
import { Wifi, WifiOff } from 'lucide-react';
import { OrderListWithSearch } from '@/components/order/OrderListWithSearch';
import { BusinessSettingsManager } from '@/components/admin/BusinessSettingsManager';
import { BusinessHoursManager } from '@/components/admin/BusinessHoursManager';
import { FAQManager } from '@/components/admin/FAQManager';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { AnnouncementManager } from '@/components/admin/AnnouncementManager';
import ContactSubmissionsManager from '@/components/admin/ContactSubmissionsManager';
import OrderIssuesManager from '@/components/admin/OrderIssuesManager';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const OwnerDashboard = () => {
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<OrderStatusBreakdown[]>([]);
  const [peakTimes, setPeakTimes] = useState<PeakOrderingTime[]>([]);
  const [capacityData, setCapacityData] = useState<CapacityUtilization[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [todayDeliveries, setTodayDeliveries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [revenuePeriod, setRevenuePeriod] = useState<'day' | 'week' | 'month'>('day');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);

  // Use real-time orders feed
  const { orders: realtimeOrders, stats: orderStats } = useOrdersFeed('owner');

  // Real-time subscription for dashboard updates
  const { isConnected } = useRealtimeOrders({
    filterByUserId: false, // Owner sees all orders
    onOrderInsert: () => {
      loadDashboardData(true);
      setLastUpdate(new Date());
    },
    onOrderUpdate: () => {
      loadDashboardData(true);
      setLastUpdate(new Date());
    },
    onOrderDelete: () => {
      loadDashboardData(true);
      setLastUpdate(new Date());
    },
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || !user.profile || user.profile.role !== 'owner') {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [user, authLoading, navigate, dateRange, revenuePeriod]);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setLastUpdate(new Date());
    try {
      // Load all dashboard data in parallel
      const [
        metricsData,
        revenueDataRes,
        popularItemsRes,
        statusBreakdownRes,
        peakTimesRes,
        capacityDataRes,
        ordersRes,
        lowStockRes,
        deliveriesRes
      ] = await Promise.all([
        getDashboardMetrics(dateRange),
        getRevenueByPeriod(
          format(subDays(new Date(), revenuePeriod === 'day' ? 7 : revenuePeriod === 'week' ? 30 : 90), 'yyyy-MM-dd'),
          format(new Date(), 'yyyy-MM-dd'),
          revenuePeriod
        ),
        getPopularItems('month'),
        getOrdersByStatus(),
        getPeakOrderingTimes(30),
        getCapacityUtilization(30),
        api.getAllOrders(),
        getLowStockItems(),
        getTodayDeliveries()
      ]);

      setMetrics(metricsData);
      setRevenueData(revenueDataRes);
      setPopularItems(popularItemsRes);
      setStatusBreakdown(statusBreakdownRes);
      setPeakTimes(peakTimesRes);
      setCapacityData(capacityDataRes);
      setRecentOrders(ordersRes.slice(0, 10));
      setLowStockItems(lowStockRes);
      setTodayDeliveries(deliveriesRes);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error(t('Error al cargar datos del dashboard', 'Error loading dashboard data'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async (type: 'daily' | 'inventory' | 'customer', date?: string) => {
    try {
      let blob: Blob;
      let filename: string;

      switch (type) {
        case 'daily':
          blob = await generateDailySalesReport(date || format(new Date(), 'yyyy-MM-dd'));
          filename = `daily-sales-${date || format(new Date(), 'yyyy-MM-dd')}.csv`;
          break;
        case 'inventory':
          blob = await generateInventoryReport();
          filename = `inventory-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
          break;
        case 'customer':
          blob = await generateCustomerActivityReport(
            format(subDays(new Date(), 30), 'yyyy-MM-dd'),
            format(new Date(), 'yyyy-MM-dd')
          );
          filename = `customer-activity-${format(subDays(new Date(), 30), 'yyyy-MM-dd')}-to-${format(new Date(), 'yyyy-MM-dd')}.csv`;
          break;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t('Reporte descargado', 'Report downloaded'));
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error(t('Error al exportar reporte', 'Error exporting report'));
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user.profile || user.profile.role !== 'owner') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="font-display text-4xl font-bold text-gradient-gold mb-2">
                  {t('Panel de Administración', 'Admin Dashboard')}
                </h1>
                <div className="flex items-center gap-4">
                  <p className="text-muted-foreground">
                    {t('Última actualización', 'Last updated')}: {format(lastUpdate, 'PPp')}
                  </p>
                  {isConnected ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Wifi className="mr-1 h-3 w-3" />
                      {t('Actualización en tiempo real', 'Live Updates')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <WifiOff className="mr-1 h-3 w-3" />
                      {t('Sin conexión', 'Offline')}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => loadDashboardData()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('Actualizar', 'Refresh')}
                </Button>
                <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">{t('Hoy', 'Today')}</SelectItem>
                    <SelectItem value="week">{t('Semana', 'Week')}</SelectItem>
                    <SelectItem value="month">{t('Mes', 'Month')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('Pedidos de Hoy', 'Today\'s Orders')}
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.todayOrders || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('Ingresos', 'Revenue')}: {formatPrice(metrics?.todayRevenue || 0)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('Pedidos Pendientes', 'Pending Orders')}
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.pendingOrders || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('Requieren atención', 'Need attention')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('Utilización de Capacidad', 'Capacity Utilization')}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.capacityUtilization?.toFixed(1) || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('Próximos 7 días', 'Next 7 days')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('Valor Promedio', 'Avg Order Value')}
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice(metrics?.averageOrderValue || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('Por pedido', 'Per order')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Data */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">{t('Resumen', 'Overview')}</TabsTrigger>
                <TabsTrigger value="revenue">{t('Ingresos', 'Revenue')}</TabsTrigger>
                <TabsTrigger value="orders">{t('Pedidos', 'Orders')}</TabsTrigger>
                <TabsTrigger value="analytics">{t('Analíticas', 'Analytics')}</TabsTrigger>
                <TabsTrigger value="reports">{t('Reportes', 'Reports')}</TabsTrigger>
                <TabsTrigger value="cms">{t('Contenido', 'Content')}</TabsTrigger>
                <TabsTrigger value="support">{t('Soporte', 'Support')}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Revenue Chart */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{t('Tendencias de Ingresos', 'Revenue Trends')}</CardTitle>
                        <CardDescription>
                          {t('Últimos 7 días', 'Last 7 days')}
                        </CardDescription>
                      </div>
                      <Select value={revenuePeriod} onValueChange={(v: any) => setRevenuePeriod(v)}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">{t('Diario', 'Daily')}</SelectItem>
                          <SelectItem value="week">{t('Semanal', 'Weekly')}</SelectItem>
                          <SelectItem value="month">{t('Mensual', 'Monthly')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Order Status Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('Estado de Pedidos', 'Order Status')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsPieChart>
                          <Pie
                            data={statusBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {statusBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Popular Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('Artículos Populares', 'Popular Items')}</CardTitle>
                      <CardDescription>{t('Último mes', 'Last month')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={popularItems.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="itemName" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="orderCount" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Low Stock Alerts */}
                {lowStockItems.length > 0 && (
                  <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        {t('Alertas de Inventario Bajo', 'Low Stock Alerts')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {lowStockItems.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                            <span className="font-medium">{item.name}</span>
                            <Badge variant="destructive">
                              {item.quantity} {item.unit}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Today's Deliveries */}
                {todayDeliveries.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        {t('Entregas de Hoy', 'Today\'s Deliveries')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {todayDeliveries.slice(0, 5).map((delivery: any) => (
                          <div key={delivery.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="font-medium">{delivery.order_number}</p>
                              <p className="text-sm text-muted-foreground">{delivery.delivery_address}</p>
                            </div>
                            <Badge>{delivery.delivery_status}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="revenue" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('Análisis de Ingresos', 'Revenue Analysis')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#8884d8" />
                        <Bar dataKey="orderCount" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <OrderListWithSearch
                  userRole="owner"
                  onOrderClick={(order) => {
                    // Navigate to order details or open modal
                    console.log('Order clicked:', order);
                  }}
                  showExport={true}
                />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('Horas Pico', 'Peak Ordering Times')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={peakTimes}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="orderCount" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t('Utilización de Capacidad', 'Capacity Utilization')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={capacityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="utilizationPercentage" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('Generar Reportes', 'Generate Reports')}</CardTitle>
                    <CardDescription>
                      {t('Descarga reportes en formato CSV', 'Download reports in CSV format')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Button
                        variant="outline"
                        className="flex flex-col items-center gap-2 h-auto py-4"
                        onClick={() => handleExportReport('daily')}
                      >
                        <Download className="h-6 w-6" />
                        <div className="text-center">
                          <p className="font-semibold">{t('Reporte Diario', 'Daily Sales')}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('Ventas del día', 'Today\'s sales')}
                          </p>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="flex flex-col items-center gap-2 h-auto py-4"
                        onClick={() => handleExportReport('inventory')}
                      >
                        <Download className="h-6 w-6" />
                        <div className="text-center">
                          <p className="font-semibold">{t('Reporte de Inventario', 'Inventory Report')}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('Estado de ingredientes', 'Ingredient status')}
                          </p>
                        </div>
                      </Button>

                      <Button
                        variant="outline"
                        className="flex flex-col items-center gap-2 h-auto py-4"
                        onClick={() => handleExportReport('customer')}
                      >
                        <Download className="h-6 w-6" />
                        <div className="text-center">
                          <p className="font-semibold">{t('Actividad de Clientes', 'Customer Activity')}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('Últimos 30 días', 'Last 30 days')}
                          </p>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cms" className="space-y-4">
                <Tabs defaultValue="settings" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="settings">{t('Configuración', 'Settings')}</TabsTrigger>
                    <TabsTrigger value="hours">{t('Horarios', 'Hours')}</TabsTrigger>
                    <TabsTrigger value="faqs">{t('FAQs', 'FAQs')}</TabsTrigger>
                    <TabsTrigger value="gallery">{t('Galería', 'Gallery')}</TabsTrigger>
                    <TabsTrigger value="announcements">{t('Anuncios', 'Announcements')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="settings" className="mt-4">
                    <BusinessSettingsManager />
                  </TabsContent>

                  <TabsContent value="hours" className="mt-4">
                    <BusinessHoursManager />
                  </TabsContent>

                  <TabsContent value="faqs" className="mt-4">
                    <FAQManager />
                  </TabsContent>

                  <TabsContent value="gallery" className="mt-4">
                    <GalleryManager />
                  </TabsContent>

                  <TabsContent value="announcements" className="mt-4">
                    <AnnouncementManager />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="support" className="space-y-4">
                <Tabs defaultValue="contact" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="contact">{t('Mensajes de Contacto', 'Contact Messages')}</TabsTrigger>
                    <TabsTrigger value="issues">{t('Problemas con Pedidos', 'Order Issues')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="contact" className="mt-4">
                    <ContactSubmissionsManager />
                  </TabsContent>

                  <TabsContent value="issues" className="mt-4">
                    <OrderIssuesManager />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Cancel Order Modal */}
        {cancelOrderId && (
          <CancelOrderModal
            order={recentOrders.find((o: any) => o.id === cancelOrderId)}
            open={!!cancelOrderId}
            onClose={() => setCancelOrderId(null)}
            onSuccess={() => {
              loadDashboardData(true);
              setCancelOrderId(null);
            }}
            isAdmin={true}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OwnerDashboard;
