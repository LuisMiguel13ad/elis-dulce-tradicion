import { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types/order';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';

interface OrderCalendarViewProps {
    orders: Order[];
    onOrderClick?: (order: Order) => void;
}

export function OrderCalendarView({ orders, onOrderClick }: OrderCalendarViewProps) {
    const { t, language } = useLanguage();
    const [date, setDate] = useState<Date | undefined>(new Date());

    // Function to determine if a date has orders
    const ordersByDate = useMemo(() => {
        const map = new Map<string, Order[]>();
        orders.forEach(order => {
            // Assuming order.date_needed is YYYY-MM-DD string
            const dateKey = order.date_needed;
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)?.push(order);
        });
        return map;
    }, [orders]);

    const selectedDateOrders = useMemo(() => {
        if (!date) return [];
        const dateKey = format(date, 'yyyy-MM-dd');
        return ordersByDate.get(dateKey) || [];
    }, [date, ordersByDate]);

    // Modifiers for the calendar to show dots/indicators
    const modifiers = {
        hasOrders: (d: Date) => ordersByDate.has(format(d, 'yyyy-MM-dd')),
    };

    const modifiersStyles = {
        hasOrders: {
            fontWeight: 'bold',
            textDecoration: 'underline',
            color: 'var(--primary)',
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6">
            <Card className="h-fit">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        {t('Calendario', 'Calendar')}
                    </CardTitle>
                    <CardDescription>
                        {t('Selecciona una fecha para ver los pedidos', 'Select a date to view orders')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex justify-center pb-4">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border shadow-sm"
                        modifiers={modifiers}
                        modifiersStyles={modifiersStyles}
                        locale={language === 'es' ? es : undefined}
                    />
                </CardContent>
                <div className="px-6 pb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>{t('Días con pedidos', 'Days with orders')}</span>
                    </div>
                </div>
            </Card>

            <Card className="h-full min-h-[500px]">
                <CardHeader>
                    <CardTitle>
                        {date ? format(date, 'PPPP', { locale: language === 'es' ? es : undefined }) : t('Seleccionar fecha', 'Select date')}
                    </CardTitle>
                    <CardDescription>
                        {selectedDateOrders.length} {t('pedidos programados', 'orders scheduled')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {selectedDateOrders.length > 0 ? (
                        <div className="space-y-4">
                            {selectedDateOrders.map(order => (
                                <div
                                    key={order.id}
                                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                                    onClick={() => onOrderClick?.(order)}
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-lg">#{order.order_number}</span>
                                            <Badge variant="outline" className={
                                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                    order.status === 'ready' ? 'bg-green-100 text-green-800 border-green-200' :
                                                        'bg-gray-100 text-gray-800 border-gray-200'
                                            }
                                            >
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <h4 className="font-medium">{order.cake_size} - {order.filling}</h4>
                                        <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                                        {order.theme && <p className="text-sm text-primary mt-1">"{order.theme}"</p>}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {order.time_needed}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                            <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                            <p>{t('No hay pedidos para esta fecha', 'No orders for this date')}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
