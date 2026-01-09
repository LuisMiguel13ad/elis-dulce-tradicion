/**
 * UrgentOrdersBanner - Displays urgent orders that need attention
 * Shows orders due within the next few hours
 */
import { useState, useEffect, useMemo } from 'react';
import { Order } from '@/types/order';
import { AlertTriangle, Clock, ChevronRight, Bell, X } from 'lucide-react';
import { differenceInMinutes, format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface UrgentOrdersBannerProps {
    orders: Order[];
    urgentThresholdHours?: number; // Orders due within this many hours
    onOrderClick?: (order: Order) => void;
    variant?: 'light' | 'dark';
}

interface UrgentOrder extends Order {
    minutesUntilDue: number;
}

export function UrgentOrdersBanner({
    orders,
    urgentThresholdHours = 4,
    onOrderClick,
    variant = 'light'
}: UrgentOrdersBannerProps) {
    const { t } = useLanguage();
    const [dismissed, setDismissed] = useState<Set<number>>(new Set());
    const [expanded, setExpanded] = useState(true);

    // Find urgent orders (due within threshold, not completed)
    const urgentOrders = useMemo(() => {
        const now = new Date();
        const thresholdMinutes = urgentThresholdHours * 60;

        return orders
            .filter(order => {
                // Skip completed orders
                if (['ready', 'delivered', 'completed', 'cancelled'].includes(order.status)) {
                    return false;
                }

                // Skip dismissed orders
                if (dismissed.has(order.id)) {
                    return false;
                }

                if (!order.date_needed || !order.time_needed) return false;

                try {
                    const dueDateTime = parseISO(`${order.date_needed}T${order.time_needed}`);
                    const minutesUntilDue = differenceInMinutes(dueDateTime, now);

                    // Due within threshold and not overdue by more than 1 hour
                    return minutesUntilDue <= thresholdMinutes && minutesUntilDue > -60;
                } catch {
                    return false;
                }
            })
            .map(order => {
                const dueDateTime = parseISO(`${order.date_needed}T${order.time_needed}`);
                const minutesUntilDue = differenceInMinutes(dueDateTime, new Date());
                return { ...order, minutesUntilDue } as UrgentOrder;
            })
            .sort((a, b) => a.minutesUntilDue - b.minutesUntilDue); // Most urgent first
    }, [orders, urgentThresholdHours, dismissed]);

    // Play sound for new urgent orders
    useEffect(() => {
        if (urgentOrders.length > 0) {
            // Could play notification sound here
        }
    }, [urgentOrders.length]);

    if (urgentOrders.length === 0) return null;

    const getUrgencyLevel = (minutes: number) => {
        if (minutes <= 0) return 'overdue';
        if (minutes <= 60) return 'critical'; // Less than 1 hour
        if (minutes <= 120) return 'urgent'; // Less than 2 hours
        return 'warning'; // Less than threshold
    };

    const formatTimeRemaining = (minutes: number) => {
        if (minutes <= 0) return t('¡ATRASADO!', 'OVERDUE!');
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const isDark = variant === 'dark';

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-xl overflow-hidden mb-6",
                isDark
                    ? "bg-gradient-to-r from-red-900/40 to-amber-900/40 border border-red-500/30"
                    : "bg-gradient-to-r from-red-50 to-amber-50 border border-red-200"
            )}
        >
            {/* Header */}
            <div
                className={cn(
                    "flex items-center justify-between px-4 py-3 cursor-pointer",
                    isDark ? "bg-red-500/20" : "bg-red-100/50"
                )}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-full animate-pulse",
                        isDark ? "bg-red-500/30" : "bg-red-200"
                    )}>
                        <AlertTriangle className={cn(
                            "h-5 w-5",
                            isDark ? "text-red-400" : "text-red-600"
                        )} />
                    </div>
                    <div>
                        <h3 className={cn(
                            "font-bold",
                            isDark ? "text-red-300" : "text-red-800"
                        )}>
                            {t('¡Órdenes Urgentes!', 'Urgent Orders!')}
                        </h3>
                        <p className={cn(
                            "text-sm",
                            isDark ? "text-red-400/70" : "text-red-600/70"
                        )}>
                            {urgentOrders.length} {t('orden(es) necesita(n) atención', 'order(s) need attention')}
                        </p>
                    </div>
                </div>

                <ChevronRight className={cn(
                    "h-5 w-5 transition-transform",
                    expanded && "rotate-90",
                    isDark ? "text-red-400" : "text-red-600"
                )} />
            </div>

            {/* Orders List */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 space-y-3">
                            {urgentOrders.map((order) => {
                                const urgency = getUrgencyLevel(order.minutesUntilDue);

                                return (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
                                            isDark
                                                ? "bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50"
                                                : "bg-white hover:shadow-md border border-gray-100"
                                        )}
                                        onClick={() => onOrderClick?.(order)}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {/* Urgency Indicator */}
                                            <div className={cn(
                                                "w-2 h-12 rounded-full",
                                                urgency === 'overdue' && "bg-red-600 animate-pulse",
                                                urgency === 'critical' && "bg-red-500",
                                                urgency === 'urgent' && "bg-amber-500",
                                                urgency === 'warning' && "bg-yellow-500"
                                            )} />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "font-mono text-xs",
                                                        isDark ? "text-slate-400" : "text-gray-500"
                                                    )}>
                                                        #{order.order_number}
                                                    </span>
                                                    <span className={cn(
                                                        "font-bold truncate",
                                                        isDark ? "text-white" : "text-gray-900"
                                                    )}>
                                                        {order.customer_name}
                                                    </span>
                                                </div>
                                                <p className={cn(
                                                    "text-sm truncate",
                                                    isDark ? "text-slate-400" : "text-gray-600"
                                                )}>
                                                    {order.cake_size} • {order.theme}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Time Badge */}
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-sm",
                                                urgency === 'overdue' && "bg-red-600 text-white animate-pulse",
                                                urgency === 'critical' && "bg-red-500 text-white",
                                                urgency === 'urgent' && "bg-amber-500 text-white",
                                                urgency === 'warning' && (isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-700")
                                            )}>
                                                <Clock className="h-3.5 w-3.5" />
                                                {formatTimeRemaining(order.minutesUntilDue)}
                                            </div>

                                            {/* Dismiss button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDismissed(prev => new Set([...prev, order.id]));
                                                }}
                                                className={cn(
                                                    "p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity",
                                                    isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"
                                                )}
                                            >
                                                <X className={cn(
                                                    "h-4 w-4",
                                                    isDark ? "text-slate-400" : "text-gray-500"
                                                )} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
