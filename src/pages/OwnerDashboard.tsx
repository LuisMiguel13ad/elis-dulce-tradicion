/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { OwnerSidebar } from '@/components/dashboard/OwnerSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Truck,
  Download,
  RefreshCw,
  BarChart3,
  Clock,
  Wifi,
  WifiOff
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
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import CancelOrderModal from '@/components/order/CancelOrderModal';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';

import { OrderListWithSearch } from '@/components/order/OrderListWithSearch';
import { OwnerCalendar } from '@/components/dashboard/OwnerCalendar';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const OwnerDashboard = () => {
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<OrderStatusBreakdown[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [peakTimes, setPeakTimes] = useState<PeakOrderingTime[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [capacityData, setCapacityData] = useState<CapacityUtilization[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [todayDeliveries, setTodayDeliveries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [revenuePeriod, setRevenuePeriod] = useState<'day' | 'week' | 'month'>('day');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

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
      setRecentOrders((ordersRes as any[]).slice(0, 10));
      setAllOrders(ordersRes as any[]);
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
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-[#C6A649]" />
      </div>
    );
  }

  if (!user || !user.profile || user.profile.role !== 'owner') {
    return null;
  }

  // --- Main Render: App Layout ---
  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] overflow-hidden">
      {/* Sidebar */}
      <OwnerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
              {/* 1. TOP STATS ROW (Metrics) */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm transition-all hover:-translate-y-1 hover:shadow-md bg-white relative overflow-hidden group">
                  <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y-[-8px] rounded-full bg-orange-50 opacity-50 transition-transform group-hover:scale-110" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <p className="text-sm font-medium text-gray-500">{t('Ingresos Totales', 'Total Revenue')}</p>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <h3 className="text-2xl font-bold text-gray-900">{formatPrice(metrics?.todayRevenue || 0)}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 px-1.5 py-0 text-[10px] h-5">
                        +12% <TrendingUp className="ml-1 h-3 w-3" />
                      </Badge>
                      <p className="text-xs text-muted-foreground">{t('vs ayer', 'vs yesterday')}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm transition-all hover:-translate-y-1 hover:shadow-md bg-white relative overflow-hidden group">
                  <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y-[-8px] rounded-full bg-blue-50 opacity-50 transition-transform group-hover:scale-110" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <p className="text-sm font-medium text-gray-500">{t('Pedidos Hoy', 'Orders Today')}</p>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Package className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <h3 className="text-2xl font-bold text-gray-900">{metrics?.todayOrders || 0}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 px-1.5 py-0 text-[10px] h-5">
                        -2%
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {metrics?.pendingOrders || 0} {t('en proceso', 'in progress')}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm transition-all hover:-translate-y-1 hover:shadow-md bg-white relative overflow-hidden group">
                  <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y-[-8px] rounded-full bg-indigo-50 opacity-50 transition-transform group-hover:scale-110" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <p className="text-sm font-medium text-gray-500">{t('Ticket Promedio', 'Avg Ticket')}</p>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <h3 className="text-2xl font-bold text-gray-900">{formatPrice(metrics?.averageOrderValue || 0)}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t('por pedido', 'per order')}</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm transition-all hover:-translate-y-1 hover:shadow-md bg-white relative overflow-hidden group">
                  {isConnected ? (
                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y-[-8px] rounded-full bg-green-50 opacity-50 transition-transform group-hover:scale-110" />
                  ) : (
                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y-[-8px] rounded-full bg-red-50 opacity-50 transition-transform group-hover:scale-110" />
                  )}
                  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <p className="text-sm font-medium text-gray-500">{t('Estado Sistema', 'System Status')}</p>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isConnected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      <Wifi className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <h3 className={`text-xl font-bold ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                      {isConnected ? t('En Línea', 'Online') : t('Desconectado', 'Offline')}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isConnected ? t('Recibiendo pedidos', 'Receiving orders') : t('Revisa tu conexión', 'Check connection')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* 2. MAIN CONTENT SPLIT */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-4">

                {/* LEFT COLUMN: CHARTS (Span 2 or 3) */}
                <div className="flex flex-col gap-6 lg:col-span-2 xl:col-span-3">

                  {/* REVENUE CHART */}
                  <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>{t('Tendencias de Ingresos', 'Revenue Trends')}</CardTitle>
                        <p className="text-sm text-gray-500">{t('Desempeño financiero reciente', 'Recent financial performance')}</p>
                      </div>
                      <div className="flex rounded-lg bg-gray-100 p-1">
                        <button onClick={() => setRevenuePeriod('day')} className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${revenuePeriod === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>{t('7D', '7D')}</button>
                        <button onClick={() => setRevenuePeriod('week')} className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${revenuePeriod === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>{t('Mes', 'Month')}</button>
                      </div>
                    </CardHeader>
                    <CardContent className="pl-0">
                      <div className="h-[350px] w-full">
                        {revenueData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#C6A649" stopOpacity={0.2} />
                                  <stop offset="95%" stopColor="#C6A649" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                              <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                dy={10}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                              />
                              <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '12px' }}
                                cursor={{ stroke: '#C6A649', strokeWidth: 1, strokeDasharray: '4 4' }}
                              />
                              <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#C6A649"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#C6A649' }}
                                activeDot={{ r: 6, fill: '#C6A649', strokeWidth: 0 }}
                              />
                              {/* Area fill if we wanted AreaChart, but Line looks cleaner for trends often */}
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                            <BarChart3 className="mb-2 h-10 w-10 opacity-20" />
                            <p>{t('Sin datos suficientes', 'Not enough data')}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* POPULAR ITEMS & CATEGORIES */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Popular Items List */}
                    <Card className="border-none shadow-sm flex flex-col">
                      <CardHeader>
                        <CardTitle>{t('Más Vendidos', 'Top Selling Options')}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        {popularItems.length > 0 ? (
                          <div className="space-y-6">
                            {popularItems.slice(0, 4).map((item, i) => (
                              <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-sm ${i === 0 ? 'bg-[#ffd700]' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-700' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {i + 1}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-800 line-clamp-1">{item.itemName}</p>
                                    <p className="text-xs text-gray-400">{item.orderCount} {t('pedidos', 'orders')} • {formatPrice(item.revenue)}</p>
                                  </div>
                                </div>
                                <div className="h-1.5 w-16 md:w-24 rounded-full bg-gray-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[#C6A649]"
                                    style={{ width: `${Math.min((item.orderCount / (popularItems[0]?.orderCount || 1)) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
                            <p>{t('Sin datos de ventas', 'No sales data yet')}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Status Breakdown (Donut Layout) */}
                    <Card className="border-none shadow-sm flex flex-col">
                      <CardHeader>
                        <CardTitle>{t('Desglose de Pedidos', 'Order Breakdown')}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-1 items-center justify-center">
                        {statusBreakdown.length > 0 ? (
                          <div className="relative h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={statusBreakdown}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="count"
                                >
                                  {statusBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                  ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%] text-center">
                              <span className="block text-3xl font-bold text-gray-800">{metrics?.todayOrders || 0}</span>
                              <span className="text-xs text-gray-400">Total</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            <p>{t('Sin pedidos', 'No orders')}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                </div>

                {/* RIGHT COLUMN: SIDEBAR WIDGETS (Span 1) */}
                <div className="flex flex-col gap-6">

                  {/* 1. RECENT ORDERS (Actionable Info) */}
                  <Card className="border-none shadow-sm flex-1 flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{t('Actividad Reciente', 'Recent Activity')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                      {recentOrders.length > 0 ? (
                        <div className="relative space-y-0">
                          {/* Timeline line */}
                          <div className="absolute left-[19px] top-2 h-[80%] w-[2px] bg-gray-100" />
                          {recentOrders.slice(0, 5).map((order) => (
                            <div key={order.id} className="relative flex gap-4 pb-6 last:pb-0">
                              <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm ${order.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                                order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                }`}>
                                <Clock className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1 pt-1">
                                <div className="flex justify-between">
                                  <p className="truncate text-sm font-semibold text-gray-900">{order.customer_name}</p>
                                  <span className="whitespace-nowrap text-xs text-gray-400">{order.time_needed}</span>
                                </div>
                                <p className="truncate text-xs text-gray-500">{order.cake_size} - {order.filling}</p>
                                <Badge variant="outline" className="mt-1 border-0 bg-gray-50 text-[10px] text-gray-500 px-2">
                                  #{order.order_number}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-40 flex-col items-center justify-center text-center text-muted-foreground">
                          <Clock className="mb-3 h-8 w-8 opacity-20" />
                          <p className="text-sm">{t('No hay actividad reciente', 'No recent activity')}</p>
                        </div>
                      )}
                    </CardContent>
                    <div className="p-4 pt-0">
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab('orders')}>
                        {t('Ver Todos', 'View All')}
                      </Button>
                    </div>
                  </Card>

                  {/* 2. ALERTS */}
                  <Card className={`border-none shadow-sm ${lowStockItems.length > 0 ? 'bg-red-50' : 'bg-white'}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className={`text-base ${lowStockItems.length > 0 ? 'text-red-700' : 'text-gray-900'}`}>{t('Alertas', 'Alerts')}</CardTitle>
                        {lowStockItems.length > 0 ? <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" /> : <Package className="h-5 w-5 text-green-500" />}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {lowStockItems.length > 0 ? (
                        <div>
                          <p className="text-sm font-medium text-red-800 mb-2">{lowStockItems.length} {t('items bajo stock', 'items low stock')}</p>
                          <Button size="sm" variant="destructive" className="w-full text-xs" onClick={() => setActiveTab('inventory')}>
                            {t('Revisar Inventario', 'Check Inventory')}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-2 text-center">
                          <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <Package className="h-4 w-4" />
                          </span>
                          <p className="text-sm font-medium text-gray-600">{t('Inventario Saludable', 'Inventory Healthy')}</p>
                          <p className="text-xs text-gray-400">{t('No hay alertas activas', 'No active alerts')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 3. DELIVERIES (Dark Card) */}
                  <Card className="border-none bg-[#1a1a1a] shadow-lg text-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-white">{t('Entregas', 'Deliveries')}</CardTitle>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                          <Truck className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">{todayDeliveries.length}</span>
                        <span className="ml-2 text-sm text-white/50">{t('para hoy', 'for today')}</span>
                      </div>

                      {todayDeliveries.length > 0 ? (
                        <div className="space-y-3">
                          {todayDeliveries.slice(0, 2).map((delivery: any) => (
                            <div key={delivery.id} className="flex items-center justify-between rounded-lg bg-white/5 p-2 px-3">
                              <p className="text-sm font-medium truncate w-24">{delivery.order_number}</p>
                              <Badge variant="secondary" className="bg-[#C6A649] text-black hover:bg-[#C6A649]/90 border-0 text-[10px]">
                                {delivery.time_needed}
                              </Badge>
                            </div>
                          ))}
                          {todayDeliveries.length > 2 && (
                            <p className="text-xs text-center text-white/40">+{todayDeliveries.length - 2} more</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex -space-x-2 overflow-hidden py-2 opacity-50">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-8 w-8 rounded-full bg-white/20 border-2 border-[#1a1a1a]" />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                </div>
              </div>
            </TabsContent>

            {/* OTHER TABS / VIEWS */}
            <TabsContent value="orders" className="space-y-4">
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <OrderListWithSearch
                  userRole="owner"
                  onOrderClick={(order) => {
                    toast.info(
                      `${t('Orden', 'Order')} #${order.order_number}: ${order.cake_size} - ${order.filling}`,
                      { description: `${order.customer_name} • ${order.date_needed} @ ${order.time_needed}` }
                    );
                  }}
                  showExport={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <div className="animate-in fade-in zoom-in-95 duration-300 h-[calc(100vh-140px)]">
                <OwnerCalendar orders={allOrders} />
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              {/* DIGITAL PERFORMANCE SECTION */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* 1. Website Traffic Chart */}
                <Card className="border-none shadow-sm md:col-span-2">
                  <CardHeader>
                    <CardTitle>{t('Tráfico Web', 'Website Traffic')}</CardTitle>
                    <p className="text-sm text-gray-500">{t('Visitas y conversiones de los últimos 30 días', 'Visits and conversions last 30 days')}</p>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { date: '1', views: 120, orders: 4 }, { date: '5', views: 150, orders: 8 },
                        { date: '10', views: 180, orders: 12 }, { date: '15', views: 220, orders: 15 },
                        { date: '20', views: 200, orders: 10 }, { date: '25', views: 280, orders: 22 },
                        { date: '30', views: 310, orders: 28 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Legend />
                        <Line type="monotone" dataKey="views" name={t('Visitas', 'Views')} stroke="#94a3b8" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="orders" name={t('Pedidos', 'Orders')} stroke="#C6A649" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* REPORT GENERATION SECTION */}
              <Card className="animate-in fade-in zoom-in-95 duration-300 border-none shadow-sm">
                <CardHeader>
                  <CardTitle>{t('Exportar Datos', 'Export Data')}</CardTitle>
                  <p className="text-sm text-gray-500">{t('Descarga reportes detallados en CSV', 'Download detailed CSV reports')}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <Button variant="outline" className="h-auto flex-col gap-3 py-8 hover:bg-gray-50 border-dashed border-2" onClick={() => handleExportReport('daily')}>
                      <div className="rounded-full bg-blue-50 p-4 text-blue-600 ring-4 ring-blue-50/50"><Download className="h-6 w-6" /></div>
                      <div className="text-center">
                        <span className="block font-bold text-gray-900">{t('Ventas del Día', 'Daily Sales')}</span>
                        <span className="text-xs text-gray-500 mt-1">{t('Detalle de transacciones', 'Transaction details')}</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col gap-3 py-8 hover:bg-gray-50 border-dashed border-2" onClick={() => handleExportReport('inventory')}>
                      <div className="rounded-full bg-orange-50 p-4 text-orange-600 ring-4 ring-orange-50/50"><Package className="h-6 w-6" /></div>
                      <div className="text-center">
                        <span className="block font-bold text-gray-900">{t('Inventario', 'Inventory')}</span>
                        <span className="text-xs text-gray-500 mt-1">{t('Niveles de stock actuales', 'Current stock levels')}</span>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col gap-3 py-8 hover:bg-gray-50 border-dashed border-2" onClick={() => handleExportReport('customer')}>
                      <div className="rounded-full bg-green-50 p-4 text-green-600 ring-4 ring-green-50/50"><BarChart3 className="h-6 w-6" /></div>
                      <div className="text-center">
                        <span className="block font-bold text-gray-900">{t('Actividad Clientes', 'Customer Activity')}</span>
                        <span className="text-xs text-gray-500 mt-1">{t('Retención y frecuencia', 'Retention & frequency')}</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </main>
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
    </div>
  );
};

export default OwnerDashboard;
