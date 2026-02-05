/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Download,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  RefreshCw,
  Calendar,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays, startOfWeek, startOfMonth, isWithinInterval, parseISO } from 'date-fns';

// --- CSV Helper ---
function generateCSV(headers: string[], rows: (string | number)[][]): string {
  const escape = (val: string | number) => {
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [headers.map(escape).join(',')];
  rows.forEach(row => lines.push(row.map(escape).join(',')));
  return lines.join('\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Date range presets ---
type DatePreset = 'today' | 'this_week' | 'this_month' | 'last_30' | 'last_90' | 'all_time';

function getDateRange(preset: DatePreset): { start: Date; end: Date; label: string } {
  const now = new Date();
  const end = now;
  switch (preset) {
    case 'today':
      return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()), end, label: 'Today' };
    case 'this_week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end, label: 'This Week' };
    case 'this_month':
      return { start: startOfMonth(now), end, label: 'This Month' };
    case 'last_30':
      return { start: subDays(now, 30), end, label: 'Last 30 Days' };
    case 'last_90':
      return { start: subDays(now, 90), end, label: 'Last 90 Days' };
    case 'all_time':
      return { start: new Date(2020, 0, 1), end, label: 'All Time' };
  }
}

const ReportsManager = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [datePreset, setDatePreset] = useState<DatePreset>('last_30');
  const [activeReport, setActiveReport] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [orderData, inventoryData] = await Promise.all([
        api.getAllOrders(),
        api.getInventory(),
      ]);
      setOrders(Array.isArray(orderData) ? orderData : []);
      setIngredients(Array.isArray(inventoryData) ? inventoryData : []);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error(t('Error al cargar datos', 'Error loading report data'));
    } finally {
      setIsLoading(false);
    }
  };

  const { start, end } = getDateRange(datePreset);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (!o.created_at) return false;
      try {
        const d = parseISO(o.created_at);
        return isWithinInterval(d, { start, end });
      } catch {
        return false;
      }
    });
  }, [orders, start, end]);

  // ========================
  // REVENUE SUMMARY
  // ========================
  const revenueSummary = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const orderCount = filteredOrders.length;
    const avgOrder = orderCount > 0 ? totalRevenue / orderCount : 0;

    // By day
    const byDay: Record<string, { revenue: number; count: number }> = {};
    filteredOrders.forEach(o => {
      const day = o.created_at?.split('T')[0] || 'unknown';
      if (!byDay[day]) byDay[day] = { revenue: 0, count: 0 };
      byDay[day].revenue += Number(o.total_amount) || 0;
      byDay[day].count += 1;
    });

    // By cake size (product proxy)
    const byProduct: Record<string, { revenue: number; count: number }> = {};
    filteredOrders.forEach(o => {
      const product = o.cake_size || 'Unknown';
      if (!byProduct[product]) byProduct[product] = { revenue: 0, count: 0 };
      byProduct[product].revenue += Number(o.total_amount) || 0;
      byProduct[product].count += 1;
    });

    const dailyData = Object.entries(byDay)
      .map(([date, d]) => ({ date, ...d }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const productData = Object.entries(byProduct)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.revenue - a.revenue);

    return { totalRevenue, orderCount, avgOrder, dailyData, productData };
  }, [filteredOrders]);

  // ========================
  // ORDER VOLUME
  // ========================
  const orderVolume = useMemo(() => {
    // By status
    const byStatus: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const s = o.status || 'unknown';
      byStatus[s] = (byStatus[s] || 0) + 1;
    });

    // By day of week
    const byDayOfWeek: Record<string, number> = {
      Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0,
      Thursday: 0, Friday: 0, Saturday: 0
    };
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    filteredOrders.forEach(o => {
      if (!o.created_at) return;
      try {
        const d = parseISO(o.created_at);
        byDayOfWeek[dayNames[d.getDay()]] += 1;
      } catch { /* skip */ }
    });

    // Peak day
    const peakDay = Object.entries(byDayOfWeek).sort((a, b) => b[1] - a[1])[0];

    // By delivery option
    const deliveryCount = filteredOrders.filter(o => o.delivery_option === 'delivery').length;
    const pickupCount = filteredOrders.filter(o => o.delivery_option === 'pickup').length;

    return {
      total: filteredOrders.length,
      byStatus,
      byDayOfWeek,
      peakDay: peakDay ? { day: peakDay[0], count: peakDay[1] } : null,
      deliveryCount,
      pickupCount,
    };
  }, [filteredOrders]);

  // ========================
  // CUSTOMER REPORT
  // ========================
  const customerReport = useMemo(() => {
    const customers: Record<string, { name: string; email: string; orders: number; totalSpent: number; lastOrder: string }> = {};
    filteredOrders.forEach(o => {
      const key = o.customer_email || o.customer_name || 'Unknown';
      if (!customers[key]) {
        customers[key] = {
          name: o.customer_name || 'Unknown',
          email: o.customer_email || '',
          orders: 0,
          totalSpent: 0,
          lastOrder: o.created_at || '',
        };
      }
      customers[key].orders += 1;
      customers[key].totalSpent += Number(o.total_amount) || 0;
      if (o.created_at > customers[key].lastOrder) {
        customers[key].lastOrder = o.created_at;
      }
    });

    const list = Object.values(customers).sort((a, b) => b.totalSpent - a.totalSpent);
    const totalCustomers = list.length;
    const repeatCustomers = list.filter(c => c.orders > 1).length;
    const avgOrdersPerCustomer = totalCustomers > 0 ? filteredOrders.length / totalCustomers : 0;

    return { list, totalCustomers, repeatCustomers, avgOrdersPerCustomer };
  }, [filteredOrders]);

  // ========================
  // INVENTORY REPORT
  // ========================
  const inventoryReport = useMemo(() => {
    const lowStock = ingredients.filter(i => i.quantity <= i.low_stock_threshold);
    const totalItems = ingredients.length;
    const totalValue = ingredients.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

    const byCategory: Record<string, { count: number; totalQty: number }> = {};
    ingredients.forEach(i => {
      const cat = i.category || 'uncategorized';
      if (!byCategory[cat]) byCategory[cat] = { count: 0, totalQty: 0 };
      byCategory[cat].count += 1;
      byCategory[cat].totalQty += Number(i.quantity) || 0;
    });

    return { ingredients, lowStock, totalItems, totalValue, byCategory };
  }, [ingredients]);

  // ========================
  // CSV EXPORTS
  // ========================
  const exportRevenueSummary = () => {
    const headers = ['Date', 'Orders', 'Revenue ($)', 'Avg Order ($)'];
    const rows = revenueSummary.dailyData.map(d => [
      d.date,
      d.count,
      d.revenue.toFixed(2),
      d.count > 0 ? (d.revenue / d.count).toFixed(2) : '0.00',
    ]);
    // Add product breakdown after a separator
    rows.push(['', '', '', '']);
    rows.push(['Product/Size', 'Orders', 'Revenue ($)', 'Avg ($)']);
    revenueSummary.productData.forEach(p => {
      rows.push([p.name, p.count, p.revenue.toFixed(2), p.count > 0 ? (p.revenue / p.count).toFixed(2) : '0.00']);
    });
    rows.push(['', '', '', '']);
    rows.push(['TOTAL', revenueSummary.orderCount, revenueSummary.totalRevenue.toFixed(2), revenueSummary.avgOrder.toFixed(2)]);

    const csv = generateCSV(headers, rows);
    downloadCSV(csv, `revenue_summary_${format(start, 'yyyy-MM-dd')}_to_${format(end, 'yyyy-MM-dd')}.csv`);
    toast.success(t('Reporte descargado', 'Report downloaded'));
  };

  const exportOrderVolume = () => {
    const headers = ['Metric', 'Value'];
    const rows: (string | number)[][] = [
      ['Total Orders', orderVolume.total],
      ['Delivery Orders', orderVolume.deliveryCount],
      ['Pickup Orders', orderVolume.pickupCount],
      ['Peak Day', orderVolume.peakDay ? `${orderVolume.peakDay.day} (${orderVolume.peakDay.count} orders)` : 'N/A'],
      ['', ''],
      ['Status', 'Count'],
    ];
    Object.entries(orderVolume.byStatus).forEach(([status, count]) => {
      rows.push([status, count]);
    });
    rows.push(['', '']);
    rows.push(['Day of Week', 'Orders']);
    Object.entries(orderVolume.byDayOfWeek).forEach(([day, count]) => {
      rows.push([day, count]);
    });

    const csv = generateCSV(headers, rows);
    downloadCSV(csv, `order_volume_${format(start, 'yyyy-MM-dd')}_to_${format(end, 'yyyy-MM-dd')}.csv`);
    toast.success(t('Reporte descargado', 'Report downloaded'));
  };

  const exportCustomerReport = () => {
    const headers = ['Customer', 'Email', 'Orders', 'Total Spent ($)', 'Avg Order ($)', 'Last Order'];
    const rows = customerReport.list.map(c => [
      c.name,
      c.email,
      c.orders,
      c.totalSpent.toFixed(2),
      c.orders > 0 ? (c.totalSpent / c.orders).toFixed(2) : '0.00',
      c.lastOrder ? c.lastOrder.split('T')[0] : '',
    ]);

    const csv = generateCSV(headers, rows);
    downloadCSV(csv, `customer_report_${format(start, 'yyyy-MM-dd')}_to_${format(end, 'yyyy-MM-dd')}.csv`);
    toast.success(t('Reporte descargado', 'Report downloaded'));
  };

  const exportInventoryReport = () => {
    const headers = ['Ingredient', 'Category', 'Quantity', 'Unit', 'Low Threshold', 'Supplier', 'Status', 'Last Updated'];
    const rows = inventoryReport.ingredients.map(i => [
      i.name,
      i.category || '',
      i.quantity,
      i.unit,
      i.low_stock_threshold,
      i.supplier || '',
      i.quantity <= i.low_stock_threshold ? 'LOW STOCK' : 'OK',
      i.last_updated ? i.last_updated.split('T')[0] : '',
    ]);

    const csv = generateCSV(headers, rows);
    downloadCSV(csv, `inventory_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    toast.success(t('Reporte descargado', 'Report downloaded'));
  };

  // ========================
  // RENDER
  // ========================
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold">{t('Centro de Reportes', 'Reports Center')}</h2>
          <p className="text-muted-foreground mt-1">
            {t('Genera y descarga reportes de tu negocio', 'Generate and download business reports')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DatePreset)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t('Hoy', 'Today')}</SelectItem>
              <SelectItem value="this_week">{t('Esta Semana', 'This Week')}</SelectItem>
              <SelectItem value="this_month">{t('Este Mes', 'This Month')}</SelectItem>
              <SelectItem value="last_30">{t('Últimos 30 Días', 'Last 30 Days')}</SelectItem>
              <SelectItem value="last_90">{t('Últimos 90 Días', 'Last 90 Days')}</SelectItem>
              <SelectItem value="all_time">{t('Todo el Tiempo', 'All Time')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('Actualizar', 'Refresh')}
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveReport(activeReport === 'revenue' ? null : 'revenue')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>{t('Ingresos', 'Revenue')}</CardDescription>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueSummary.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {revenueSummary.orderCount} {t('pedidos', 'orders')} · ${revenueSummary.avgOrder.toFixed(2)} {t('promedio', 'avg')}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveReport(activeReport === 'orders' ? null : 'orders')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>{t('Volumen de Pedidos', 'Order Volume')}</CardDescription>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderVolume.total}</div>
            <p className="text-xs text-muted-foreground">
              {orderVolume.deliveryCount} {t('entregas', 'deliveries')} · {orderVolume.pickupCount} {t('recolecciones', 'pickups')}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveReport(activeReport === 'customers' ? null : 'customers')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>{t('Clientes', 'Customers')}</CardDescription>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerReport.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {customerReport.repeatCustomers} {t('recurrentes', 'repeat')} · {customerReport.avgOrdersPerCustomer.toFixed(1)} {t('pedidos/cliente', 'orders/customer')}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveReport(activeReport === 'inventory' ? null : 'inventory')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>{t('Inventario', 'Inventory')}</CardDescription>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryReport.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {inventoryReport.lowStock.length} {t('stock bajo', 'low stock')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Report Detail */}
      {activeReport === 'revenue' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                {t('Resumen de Ingresos', 'Revenue Summary')}
              </CardTitle>
              <CardDescription>
                {t('Desglose por día y producto', 'Breakdown by day and product')}
              </CardDescription>
            </div>
            <Button onClick={exportRevenueSummary} size="sm">
              <Download className="mr-2 h-4 w-4" />
              {t('Exportar CSV', 'Export CSV')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Daily breakdown */}
            <div>
              <h4 className="text-sm font-semibold mb-3">{t('Por Día', 'By Day')}</h4>
              <div className="rounded-md border max-h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Fecha', 'Date')}</TableHead>
                      <TableHead className="text-right">{t('Pedidos', 'Orders')}</TableHead>
                      <TableHead className="text-right">{t('Ingresos', 'Revenue')}</TableHead>
                      <TableHead className="text-right">{t('Promedio', 'Average')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueSummary.dailyData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          {t('Sin datos para este período', 'No data for this period')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      revenueSummary.dailyData.map(d => (
                        <TableRow key={d.date}>
                          <TableCell className="font-medium">{d.date}</TableCell>
                          <TableCell className="text-right">{d.count}</TableCell>
                          <TableCell className="text-right">${d.revenue.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${d.count > 0 ? (d.revenue / d.count).toFixed(2) : '0.00'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Product breakdown */}
            <div>
              <h4 className="text-sm font-semibold mb-3">{t('Por Producto/Tamaño', 'By Product/Size')}</h4>
              <div className="rounded-md border max-h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Producto', 'Product')}</TableHead>
                      <TableHead className="text-right">{t('Pedidos', 'Orders')}</TableHead>
                      <TableHead className="text-right">{t('Ingresos', 'Revenue')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueSummary.productData.map(p => (
                      <TableRow key={p.name}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-right">{p.count}</TableCell>
                        <TableCell className="text-right">${p.revenue.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeReport === 'orders' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                {t('Volumen de Pedidos', 'Order Volume')}
              </CardTitle>
              <CardDescription>
                {t('Análisis de pedidos por estado, día y tipo', 'Order analysis by status, day, and type')}
              </CardDescription>
            </div>
            <Button onClick={exportOrderVolume} size="sm">
              <Download className="mr-2 h-4 w-4" />
              {t('Exportar CSV', 'Export CSV')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status breakdown */}
            <div>
              <h4 className="text-sm font-semibold mb-3">{t('Por Estado', 'By Status')}</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(orderVolume.byStatus).map(([status, count]) => (
                  <Badge key={status} variant="outline" className="text-sm py-1 px-3">
                    {status}: {count}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Day of week */}
            <div>
              <h4 className="text-sm font-semibold mb-3">{t('Por Día de la Semana', 'By Day of Week')}</h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Día', 'Day')}</TableHead>
                      <TableHead className="text-right">{t('Pedidos', 'Orders')}</TableHead>
                      <TableHead>{t('Distribución', 'Distribution')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(orderVolume.byDayOfWeek).map(([day, count]) => {
                      const max = Math.max(...Object.values(orderVolume.byDayOfWeek), 1);
                      const pct = (count / max) * 100;
                      return (
                        <TableRow key={day}>
                          <TableCell className="font-medium">{day}</TableCell>
                          <TableCell className="text-right">{count}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Delivery vs Pickup */}
            <div>
              <h4 className="text-sm font-semibold mb-3">{t('Tipo de Entrega', 'Delivery Type')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold">{orderVolume.deliveryCount}</div>
                  <p className="text-sm text-muted-foreground">{t('Entregas', 'Deliveries')}</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold">{orderVolume.pickupCount}</div>
                  <p className="text-sm text-muted-foreground">{t('Recolecciones', 'Pickups')}</p>
                </div>
              </div>
            </div>

            {orderVolume.peakDay && (
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-800">
                  {t('Día con más pedidos', 'Peak day')}: <strong>{orderVolume.peakDay.day}</strong> ({orderVolume.peakDay.count} {t('pedidos', 'orders')})
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeReport === 'customers' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                {t('Reporte de Clientes', 'Customer Report')}
              </CardTitle>
              <CardDescription>
                {t('Clientes recurrentes y frecuencia de pedidos', 'Repeat customers and order frequency')}
              </CardDescription>
            </div>
            <Button onClick={exportCustomerReport} size="sm">
              <Download className="mr-2 h-4 w-4" />
              {t('Exportar CSV', 'Export CSV')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">{customerReport.totalCustomers}</div>
                <p className="text-sm text-muted-foreground">{t('Total Clientes', 'Total Customers')}</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">{customerReport.repeatCustomers}</div>
                <p className="text-sm text-muted-foreground">{t('Recurrentes', 'Repeat')}</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">{customerReport.avgOrdersPerCustomer.toFixed(1)}</div>
                <p className="text-sm text-muted-foreground">{t('Pedidos/Cliente', 'Orders/Customer')}</p>
              </div>
            </div>

            {/* Customer table */}
            <div className="rounded-md border max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Cliente', 'Customer')}</TableHead>
                    <TableHead>{t('Email', 'Email')}</TableHead>
                    <TableHead className="text-right">{t('Pedidos', 'Orders')}</TableHead>
                    <TableHead className="text-right">{t('Total Gastado', 'Total Spent')}</TableHead>
                    <TableHead className="text-right">{t('Promedio', 'Average')}</TableHead>
                    <TableHead>{t('Último Pedido', 'Last Order')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerReport.list.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {t('Sin datos para este período', 'No data for this period')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    customerReport.list.slice(0, 50).map((c, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-muted-foreground">{c.email}</TableCell>
                        <TableCell className="text-right">
                          {c.orders}
                          {c.orders > 1 && <Badge variant="secondary" className="ml-2 text-xs">{t('Recurrente', 'Repeat')}</Badge>}
                        </TableCell>
                        <TableCell className="text-right">${c.totalSpent.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${c.orders > 0 ? (c.totalSpent / c.orders).toFixed(2) : '0.00'}</TableCell>
                        <TableCell>{c.lastOrder ? c.lastOrder.split('T')[0] : ''}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeReport === 'inventory' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-500" />
                {t('Reporte de Inventario', 'Inventory Report')}
              </CardTitle>
              <CardDescription>
                {t('Estado actual del inventario y alertas de stock', 'Current inventory status and stock alerts')}
              </CardDescription>
            </div>
            <Button onClick={exportInventoryReport} size="sm">
              <Download className="mr-2 h-4 w-4" />
              {t('Exportar CSV', 'Export CSV')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category summary */}
            <div>
              <h4 className="text-sm font-semibold mb-3">{t('Por Categoría', 'By Category')}</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(inventoryReport.byCategory).map(([cat, data]) => (
                  <Badge key={cat} variant="outline" className="text-sm py-1 px-3">
                    {cat}: {data.count} {t('items', 'items')} ({data.totalQty.toFixed(1)} {t('unidades', 'units')})
                  </Badge>
                ))}
              </div>
            </div>

            {/* Low stock alerts */}
            {inventoryReport.lowStock.length > 0 && (
              <div className="rounded-lg bg-red-50 p-4">
                <h4 className="text-sm font-semibold text-red-800 mb-2">
                  {t('Alertas de Stock Bajo', 'Low Stock Alerts')} ({inventoryReport.lowStock.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {inventoryReport.lowStock.map(i => (
                    <Badge key={i.id} variant="destructive">
                      {i.name}: {i.quantity} {i.unit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Full inventory table */}
            <div className="rounded-md border max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Ingrediente', 'Ingredient')}</TableHead>
                    <TableHead>{t('Categoría', 'Category')}</TableHead>
                    <TableHead className="text-right">{t('Cantidad', 'Quantity')}</TableHead>
                    <TableHead>{t('Unidad', 'Unit')}</TableHead>
                    <TableHead className="text-right">{t('Umbral', 'Threshold')}</TableHead>
                    <TableHead>{t('Estado', 'Status')}</TableHead>
                    <TableHead>{t('Proveedor', 'Supplier')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryReport.ingredients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        {t('Sin ingredientes en inventario', 'No ingredients in inventory')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    inventoryReport.ingredients.map(i => (
                      <TableRow key={i.id} className={i.quantity <= i.low_stock_threshold ? 'bg-red-50' : ''}>
                        <TableCell className="font-medium">{i.name}</TableCell>
                        <TableCell>{i.category || '-'}</TableCell>
                        <TableCell className="text-right font-semibold">{i.quantity}</TableCell>
                        <TableCell>{i.unit}</TableCell>
                        <TableCell className="text-right">{i.low_stock_threshold}</TableCell>
                        <TableCell>
                          {i.quantity <= i.low_stock_threshold ? (
                            <Badge variant="destructive">{t('Bajo', 'Low')}</Badge>
                          ) : (
                            <Badge variant="secondary">{t('OK', 'OK')}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{i.supplier || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Export Section */}
      {!activeReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              {t('Exportación Rápida', 'Quick Export')}
            </CardTitle>
            <CardDescription>
              {t('Haz clic en una tarjeta arriba para ver detalles, o exporta directamente', 'Click a card above for details, or export directly')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={exportRevenueSummary}>
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="text-xs">{t('Ingresos CSV', 'Revenue CSV')}</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={exportOrderVolume}>
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                <span className="text-xs">{t('Pedidos CSV', 'Orders CSV')}</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={exportCustomerReport}>
                <Users className="h-5 w-5 text-purple-500" />
                <span className="text-xs">{t('Clientes CSV', 'Customers CSV')}</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={exportInventoryReport}>
                <Package className="h-5 w-5 text-orange-500" />
                <span className="text-xs">{t('Inventario CSV', 'Inventory CSV')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsManager;
