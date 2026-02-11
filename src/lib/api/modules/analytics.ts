import { BaseApiClient } from '../base';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class AnalyticsApi extends BaseApiClient {
    async getDashboardMetrics(dateRange: 'today' | 'week' | 'month') {
        const sb = this.ensureSupabase();
        if (!sb) return this.getFallbackMetrics();

        try {
            const { data: { session } } = await sb.auth.getSession();
            if (session?.access_token) {
                const response = await fetch(
                    `${API_BASE_URL}/api/analytics/dashboard?dateRange=${dateRange}`,
                    { headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' } }
                );
                if (response.ok) {
                    const metrics = await response.json();
                    return { ...metrics, capacityUtilization: (metrics.capacityUtilization || 0) / 100 };
                }
            }
        } catch (e) {
            console.warn('Backend metrics failed, using RPC fallback');
        }

        const today = new Date().toLocaleDateString('en-CA');
        const { data: summary, error } = await sb.rpc('get_dashboard_summary', { p_start_date: today });

        if (error) {
            console.error('Dashboard RPC error:', error);
            return this.getFallbackMetrics();
        }

        return {
            ...summary,
            capacityUtilization: 0,
            averageOrderValue: summary.todayRevenue / (summary.todayOrders || 1),
            totalCustomers: 0,
            lowStockItems: 0
        };
    }

    private getFallbackMetrics() {
        return {
            todayOrders: 0,
            todayRevenue: 0,
            pendingOrders: 0,
            capacityUtilization: 0,
            averageOrderValue: 0,
            totalCustomers: 0,
            lowStockItems: 0,
            todayDeliveries: 0
        };
    }

    async getRevenueByPeriod(startDate: string, endDate: string) {
        const sb = this.ensureSupabase();
        let dbOrders: any[] = [];
        if (sb) {
            const { data } = await sb.from('orders')
                .select('created_at, total_amount')
                .gte('created_at', startDate)
                .lte('created_at', `${endDate}T23:59:59`);
            dbOrders = data || [];
        }

        const grouped = dbOrders.reduce((acc: any, order) => {
            const date = order.created_at.split('T')[0];
            if (!acc[date]) {
                acc[date] = { revenue: 0, count: 0 };
            }
            acc[date].revenue += Number(order.total_amount) || 0;
            acc[date].count += 1;
            return acc;
        }, {});

        return Object.entries(grouped).map(([date, stats]: [string, any]) => ({
            date,
            revenue: stats.revenue,
            orderCount: stats.count,
            avgOrderValue: stats.count > 0 ? stats.revenue / stats.count : 0
        })).sort((a, b) => a.date.localeCompare(b.date));
    }

    async getPopularItems() {
        const sb = this.ensureSupabase();
        if (!sb) return [];

        try {
            const { data, error } = await sb
                .from('order_items')
                .select('name, quantity, price')
                .limit(100);

            if (error) throw error;
            if (!data || data.length === 0) return [];

            const itemStats: Record<string, { count: number, revenue: number }> = {};

            data.forEach((item: any) => {
                const name = item.name || 'Unknown Item';
                if (!itemStats[name]) itemStats[name] = { count: 0, revenue: 0 };
                itemStats[name].count += (item.quantity || 1);
                itemStats[name].revenue += ((item.price || 0) * (item.quantity || 1));
            });

            return Object.entries(itemStats)
                .map(([name, stats]) => ({
                    name,
                    count: stats.count,
                    revenue: stats.revenue
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

        } catch (err) {
            console.warn('Could not fetch popular items:', err);
            return [];
        }
    }

    async getOrdersByStatus() {
        const sb = this.ensureSupabase();
        let dbOrders: any[] = [];

        if (sb) {
            const { data } = await sb.from('orders').select('status, total_amount');
            dbOrders = data || [];
        }

        const totalCount = dbOrders.length;
        if (totalCount === 0) return [];

        const stats: Record<string, { count: number, revenue: number }> = {};

        dbOrders.forEach((o: any) => {
            const s = o.status || 'unknown';
            if (!stats[s]) stats[s] = { count: 0, revenue: 0 };
            stats[s].count++;
            stats[s].revenue += Number(o.total_amount) || 0;
        });

        return Object.entries(stats).map(([status, data]) => ({
            status,
            count: data.count,
            totalRevenue: data.revenue,
            percentage: (data.count / totalCount) * 100
        })).sort((a, b) => b.count - a.count);
    }

    async trackEvent(name: string, properties?: Record<string, any>) {
        if (import.meta.env.DEV) {
            console.log(`[Analytics] ${name}`, properties);
        }

        const sb = this.ensureSupabase();
        if (!sb) return { success: true };

        try {
            await sb.rpc('track_analytics_event', {
                p_event_name: name,
                p_properties: {
                    ...properties,
                    timestamp: new Date().toISOString(),
                    url: typeof window !== 'undefined' ? window.location.href : undefined,
                }
            });
            return { success: true };
        } catch (error) {
            console.warn('Analytics tracking failed:', error);
            return { success: true };
        }
    }
}
