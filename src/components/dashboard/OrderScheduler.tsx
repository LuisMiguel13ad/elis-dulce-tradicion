import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay, parse, addHours, startOfDay, isWithinInterval, set, getHours, getMinutes } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Order } from '@/types/order';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderSchedulerProps {
    orders: Order[];
    onOrderClick?: (order: Order) => void;
}

type ViewMode = 'Month' | 'Week' | 'Day';

export function OrderScheduler({ orders, onOrderClick }: OrderSchedulerProps) {
    const { t, language } = useLanguage();
    const locale = language === 'es' ? es : enUS;

    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('Week');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Constants
    const startHour = 6; // 6 AM
    const endHour = 22;  // 10 PM
    const timeSlots = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

    // Helper to get week days
    const weekDays = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }, [currentDate]);

    // Filter orders for the current week
    const weeklyOrders = useMemo(() => {
        return orders.filter(order => {
            if (!order.date_needed) return false;
            const orderDate = new Date(order.date_needed + 'T00:00:00'); // Normalize
            const start = weekDays[0];
            const end = addDays(weekDays[6], 1); // Until end of last day

            // Simple range check (ignoring time for this high level filter)
            return orderDate >= start && orderDate < end;
        });
    }, [orders, weekDays]);

    // Group orders by day and calculate position
    // Returns: { [dateKey]: Array<{ order: Order, top: number, height: number }> }
    const processedOrders = useMemo(() => {
        const map = new Map<string, Array<{ order: Order, top: number, height: number }>>();

        weeklyOrders.forEach(order => {
            if (!order.date_needed || !order.time_needed) return;

            const dateKey = order.date_needed; // YYYY-MM-DD

            // Parse time (e.g., "14:30")
            const [hours, minutes] = order.time_needed.split(':').map(Number);

            // Calculate relative position from startHour
            // Each hour = 64px (h-16), 1 min = 64/60 px
            const hourHeight = 80;
            const minutesOffset = (hours - startHour) * hourHeight + (minutes / 60) * hourHeight;
            const durationHeight = hourHeight; // Default 1 hour duration block

            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)?.push({ order, top: minutesOffset, height: durationHeight });
        });
        return map;
    }, [weeklyOrders]);

    const navigate = (direction: 'prev' | 'next') => {
        if (viewMode === 'Week') {
            setCurrentDate(prev => addDays(prev, direction === 'next' ? 7 : -7));
        } else if (viewMode === 'Day') {
            setCurrentDate(prev => addDays(prev, direction === 'next' ? 1 : -1));
        }
    };

    const getDayOrders = (date: Date) => {
        const key = format(date, 'yyyy-MM-dd');
        return processedOrders.get(key) || [];
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-sans">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-20">
                <div className="flex items-center gap-6">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight first-letter:capitalize">
                        {format(currentDate, 'MMMM, yyyy', { locale })}
                    </h2>

                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {(['Month', 'Week', 'Day'] as ViewMode[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                    viewMode === mode
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900"
                                )}
                            >
                                {t(mode === 'Month' ? 'Mes' : mode === 'Week' ? 'Semana' : 'Día', mode)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                        <Button variant="ghost" size="icon" onClick={() => navigate('prev')} className="hover:bg-white rounded-l-lg text-gray-600">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" onClick={() => setCurrentDate(new Date())} className="px-4 font-medium text-gray-700 hover:bg-white border-x border-gray-200 rounded-none h-9">
                            {t('Hoy', 'Today')}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate('next')} className="hover:bg-white rounded-r-lg text-gray-600">
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 rounded-lg">
                        <Plus className="h-4 w-4" />
                        {t('Nueva Reserva', 'New Order')}
                    </Button>
                </div>
            </div>

            {/* Grid Container */}
            <div className="flex-1 overflow-auto bg-[#FAFAFA]">
                <div className="flex min-w-[800px]">
                    {/* Time Axis (Left) */}
                    <div className="w-16 flex-shrink-0 bg-white border-r border-gray-100 sticky left-0 z-10">
                        <div className="h-20 border-b border-gray-100" /> {/* Header spacer */}
                        {timeSlots.map(hour => (
                            <div key={hour} className="h-20 border-b border-transparent relative flex justify-center">
                                <span className="text-xs font-medium text-gray-400 absolute -top-2 bg-[#FAFAFA] px-1">
                                    {format(set(new Date(), { hours: hour }), 'h aa')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Columns (Days) */}
                    <div className="flex-1 grid grid-cols-7 divide-x divide-gray-100">
                        {weekDays.map(day => {
                            const isToday = isSameDay(day, new Date());
                            const dayOrders = getDayOrders(day);

                            return (
                                <div key={day.toISOString()} className="flex flex-col min-w-[120px] bg-white group">
                                    {/* Column Header */}
                                    <div className={cn(
                                        "h-20 p-3 flex flex-col items-center justify-center border-b border-gray-100 sticky top-0 bg-white z-10",
                                        isToday && "bg-green-50/50"
                                    )}>
                                        <span className={cn(
                                            "text-xs font-medium mb-1",
                                            isToday ? "text-green-600" : "text-gray-500"
                                        )}>
                                            {format(day, 'EEEE', { locale })}
                                        </span>
                                        <div className={cn(
                                            "h-10 w-10 flex items-center justify-center rounded-full text-xl font-bold transition-all",
                                            isToday
                                                ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                                                : "text-gray-900 group-hover:bg-gray-50"
                                        )}>
                                            {format(day, 'd')}
                                        </div>
                                    </div>

                                    {/* Order Blocks Grid */}
                                    <div className="flex-1 relative bg-white">
                                        {/* Grid Lines */}
                                        {timeSlots.map(hour => (
                                            <div key={hour} className="h-20 border-b border-gray-50" />
                                        ))}

                                        {/* Events */}
                                        {dayOrders.map(({ order, top, height }) => (
                                            <motion.div
                                                key={order.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={cn(
                                                    "absolute left-1 right-1 rounded-lg p-3 text-xs border cursor-pointer hover:brightness-95 transition-all shadow-sm flex flex-col gap-1 overflow-hidden",
                                                    // Assign colors based on status/theme roughly matching reference variety
                                                    order.status === 'confirmed' ? "bg-purple-100 border-purple-200 text-purple-900" :
                                                        order.status === 'ready' ? "bg-green-100 border-green-200 text-green-900" :
                                                            "bg-blue-100 border-blue-200 text-blue-900"
                                                )}
                                                style={{ top: top, height: height - 4 }} // -4 for gap
                                                onClick={() => onOrderClick?.(order)}
                                            >
                                                <div className="font-bold truncate">{order.customer_name || 'Customer'}</div>
                                                <div className="flex items-center gap-1 opacity-80">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{order.time_needed}</span>
                                                </div>
                                                <div className="truncate opacity-75">{order.cake_size}</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
