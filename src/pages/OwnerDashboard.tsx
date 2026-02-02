/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { OwnerSidebar } from '@/components/dashboard/OwnerSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Clock,
  RefreshCw,
  BarChart3,
  Download
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { formatPrice } from '@/lib/pricing';
import {
  DashboardMetrics,
  RevenueDataPoint,
  PopularItem,
  OrderStatusBreakdown
} from '@/lib/analytics';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import CancelOrderModal from '@/components/order/CancelOrderModal';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { OrderListWithSearch } from '@/components/order/OrderListWithSearch';
import { OwnerCalendar } from '@/components/dashboard/OwnerCalendar';
import { PrintPreviewModal } from '@/components/print/PrintPreviewModal';
import MenuManager from '@/components/dashboard/MenuManager';
import InventoryManager from '@/components/dashboard/InventoryManager';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const OwnerDashboard = () => {
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [printOrder, setPrintOrder] = useState<any | null>(null);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);

  // Raw Data (Single Source of Truth)
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  // Computed Metrics
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<OrderStatusBreakdown[]>([]);

  const [revenuePeriod, setRevenuePeriod] = useState<'day' | 'week' | 'month'>('day');

  // Skip auth in dev mode for testing
  const isDev = import.meta.env.DEV;

  // --- 1. DATA LOADING (The "Brain") ---
  const loadDashboardData = async () => {
    try {
      console.log('🔄 OwnerDashboard: Fetching fresh data...');

      // 1. Fetch RAW Orders
      const orders = await api.getAllOrders();
      const orderList = Array.isArray(orders) ? orders : [];
      setAllOrders(orderList); // Primary State for Calendar & Lists

      // 2. Compute Metrics Locally (No "Ghost" API calls)
      computeMetrics(orderList);

      // 3. Fetch auxiliary data (Low Stock) - non-critical
      try {
        const stock = await api.getLowStockItems();
        setLowStockItems(Array.isArray(stock) ? stock : []);
      } catch (e) { console.warn('Low stock fetch fail', e); }

    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      toast.error('Error syncing dashboard data. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  // Compute derived state from the raw order list
  const computeMetrics = (orders: any[]) => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd'); // Local YYYY-MM-DD ideally

    // Filter Today's Orders (Naive startWith check usually works for ISO strings)
    const ordersToday = orders.filter(o => o.created_at?.startsWith(todayStr));

    // Revenue Today
    const revenueToday = ordersToday.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    // Pending Count
    const pendingCount = orders.filter(o => o.status === 'pending').length;

    setMetrics({
      todayOrders: ordersToday.length,
      todayRevenue: revenueToday,
      pendingOrders: pendingCount,
      capacityUtilization: 0.5, // Placeholder
      averageOrderValue: ordersToday.length > 0 ? revenueToday / ordersToday.length : 0,
      totalCustomers: new Set(orders.map(o => o.customer_name)).size,
      lowStockItems: 0, // Updated separately
      todayDeliveries: ordersToday.filter(o => o.delivery_option === 'delivery').length
    });

    // Compute Status Breakdown
    const statusCounts: Record<string, number> = {};
    orders.forEach(o => {
      const s = o.status || 'unknown';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    setStatusBreakdown(Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      totalRevenue: 0,
      percentage: (count / orders.length) * 100
    })));

    // Compute Popular Items (Simplistic extraction from cake_size)
    const itemCounts: Record<string, number> = {};
    orders.forEach(o => {
      const key = o.cake_size || 'Unknown';
      itemCounts[key] = (itemCounts[key] || 0) + 1;
    });
    const topItems = Object.entries(itemCounts)
      .map(([name, count]) => ({
        itemName: name,
        orderCount: count,
        itemType: 'size' as any,
        totalRevenue: 0
      }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);
    setPopularItems(topItems);
  };

  // Re-compute revenue chart when period changes or orders update
  useEffect(() => {
    if (allOrders.length === 0 && !isLoading) {
      // Even if 0 orders, we should show empty chart
    }

    const daysMap = new Map<string, number>();
    const daysToLookBack = revenuePeriod === 'day' ? 7 : revenuePeriod === 'week' ? 30 : 90;

    // Init map with explicit 0s for previous days
    for (let i = daysToLookBack - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      daysMap.set(format(d, 'yyyy-MM-dd'), 0);
    }

    // Sum revenue
    allOrders.forEach(o => {
      if (!o.created_at) return;
      const d = o.created_at.split('T')[0]; // YYYY-MM-DD
      if (daysMap.has(d)) {
        daysMap.set(d, (daysMap.get(d) || 0) + (Number(o.total_amount) || 0));
      }
    });

    const chartData = Array.from(daysMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
      orderCount: 0,
      avgOrderValue: 0
    }));
    setRevenueData(chartData);

  }, [allOrders, revenuePeriod, isLoading]);


  // --- 2. LIFECYCLE & REALTIME ---

  // Initial Load
  useEffect(() => {
    if (!isDev) {
      if (!authLoading && (!user || user.profile?.role !== 'owner')) {
        navigate('/login');
        return;
      }
    }
    loadDashboardData();
  }, [user, authLoading, isDev]);

  // Real-time Listener (Supabase)
  useRealtimeOrders({
    filterByUserId: false,
    onOrderInsert: () => {
      toast.info('New Order Received! 🔔');
      loadDashboardData();
    },
    onOrderUpdate: () => loadDashboardData(),
    onOrderDelete: () => loadDashboardData(),
  });


  // --- 3. EXPORT HELPERS ---
  const handleExportReport = async (type: string) => {
    toast.info(`Generating ${type} report... (Simulated)`);
    setTimeout(() => toast.success('Report downloaded'), 1000);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-[#C6A649]" />
        <span className="ml-3 text-gray-400 font-medium">Loading Dashboard...</span>
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div className="flex h-screen w-full bg-[#F5F6FA] overflow-hidden">
      <PrintPreviewModal
        order={printOrder}
        isOpen={!!printOrder}
        onClose={() => setPrintOrder(null)}
      />

      <OwnerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">

            {/* --- TAB: OVERVIEW --- */}
            <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">

              {/* METRIC CARDS */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Revenue */}
                <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <p className="text-sm font-medium text-gray-500">{t('Ingresos Hoy', 'Revenue Today')}</p>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-2xl font-bold text-gray-900">{formatPrice(metrics?.todayRevenue || 0)}</h3>
                    <p className="text-xs text-muted-foreground mt-1 text-green-600 font-medium">Live Data</p>
                  </CardContent>
                </Card>

                {/* Orders Today */}
                <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <p className="text-sm font-medium text-gray-500">{t('Pedidos Hoy', 'Orders Today')}</p>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Package className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-2xl font-bold text-gray-900">{metrics?.todayOrders || 0}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metrics?.pendingOrders} {t('pendientes', 'pending')}
                    </p>
                  </CardContent>
                </Card>

                {/* Avg Ticket */}
                <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <p className="text-sm font-medium text-gray-500">{t('Ticket Promedio', 'Avg Ticket')}</p>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-2xl font-bold text-gray-900">{formatPrice(metrics?.averageOrderValue || 0)}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t('por pedido', 'per order')}</p>
                  </CardContent>
                </Card>
              </div>

              {/* CHARTS ROW */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Revenue Graph */}
                <div className="lg:col-span-2">
                  <Card className="border-none shadow-sm h-[400px]">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{t('Tendencias', 'Trends')}</CardTitle>
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button onClick={() => setRevenuePeriod('day')} className={`px-3 py-1 text-xs rounded-md ${revenuePeriod === 'day' ? 'bg-white shadow' : ''}`}>7D</button>
                        <button onClick={() => setRevenuePeriod('week')} className={`px-3 py-1 text-xs rounded-md ${revenuePeriod === 'week' ? 'bg-white shadow' : ''}`}>30D</button>
                      </div>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Line type="monotone" dataKey="revenue" stroke="#C6A649" strokeWidth={3} dot={{ fill: '#fff', stroke: '#C6A649', strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Status Pie */}
                <div>
                  <Card className="border-none shadow-sm h-[400px]">
                    <CardHeader>
                      <CardTitle>{t('Estado de Pedidos', 'Order Status')}</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={statusBreakdown}
                            dataKey="count"
                            nameKey="status"
                            cx="50%" cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                          >
                            {statusBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* RECENT ORDERS TABLE (Preview) */}
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t('Pedidos Recientes', 'Recent Orders')}</CardTitle>
                  <Button variant="ghost" onClick={() => setActiveTab('orders')} className="text-sm text-blue-600">Ver Todo</Button>
                </CardHeader>
                <CardContent>
                  {allOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">No recent orders.</div>
                  ) : (
                    <div className="space-y-4">
                      {allOrders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setPrintOrder(order)}>
                          <div className="flex items-center gap-4">
                            <div className={`w-2 h-12 rounded-full ${order.status === 'pending' ? 'bg-orange-400' : order.status === 'ready' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                            <div>
                              <p className="font-bold text-gray-800">{order.customer_name}</p>
                              <p className="text-sm text-gray-500">#{order.order_number} • {order.cake_size}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatPrice(order.total_amount)}</p>
                            <Badge variant="outline" className="text-[10px]">{order.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- TAB: ORDERS (FULL LIST) --- */}
            <TabsContent value="orders">
              <OrderListWithSearch
                userRole="owner"
                onOrderClick={(order) => setPrintOrder(order)}
                showExport={true}
              // We verified OrderListWithSearch uses our robust api.getAllOrders() too.
              />
            </TabsContent>

            {/* --- TAB: CALENDAR --- */}
            <TabsContent value="calendar">
              <div className="h-[calc(100vh-140px)]">
                <OwnerCalendar
                  orders={allOrders} // Passing raw data down
                  onOrderClick={(order) => setPrintOrder(order)}
                />
              </div>
            </TabsContent>

            {/* --- TAB: PRODUCTS --- */}
            <TabsContent value="products" className="animate-in fade-in slide-in-from-bottom-5 duration-500">
              <MenuManager />
            </TabsContent>

            {/* --- TAB: INVENTORY --- */}
            <TabsContent value="inventory" className="animate-in fade-in slide-in-from-bottom-5 duration-500">
              <InventoryManager />
            </TabsContent>

            {/* --- TAB: REPORTS (Simplified) --- */}
            <TabsContent value="reports">
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle>Reports Center</CardTitle></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleExportReport('Daily Sales')}>
                    <Download className="h-6 w-6 text-blue-500" />
                    <span>Daily Sales CSV</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleExportReport('Inventory')}>
                    <Package className="h-6 w-6 text-orange-500" />
                    <span>Inventory CSV</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {cancelOrderId && (
        <CancelOrderModal
          order={allOrders.find(o => o.id === cancelOrderId)}
          open={!!cancelOrderId}
          onClose={() => setCancelOrderId(null)}
          onSuccess={() => { loadDashboardData(); setCancelOrderId(null); }}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default OwnerDashboard;
