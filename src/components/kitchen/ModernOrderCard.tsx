import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/order";
import { Clock, MapPin, Calendar } from "lucide-react";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";

interface ModernOrderCardProps {
    order: Order;
    onAction: (orderId: number, action: 'confirm' | 'start' | 'ready' | 'delivery' | 'complete') => void;
    onShowDetails?: (order: Order) => void;
    isReadOnly?: boolean;
    isFrontDesk?: boolean;
    variant?: 'default' | 'dark';
}

export function ModernOrderCard({
    order,
    onAction,
    onShowDetails,
    isReadOnly,
    isFrontDesk,
    variant = 'default'
}: ModernOrderCardProps) {

    // Calculate urgency / elapsed time
    const getUrgency = () => {
        try {
            const dueDateTime = parseISO(`${order.date_needed}T${order.time_needed}`);
            const now = new Date();
            const minutesUntilDue = differenceInMinutes(dueDateTime, now);
            return minutesUntilDue;
        } catch {
            return 0;
        }
    };

    // Status color mapping
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-black text-white hover:bg-gray-800'; // "New"
            case 'confirmed': return 'bg-yellow-500 text-white hover:bg-yellow-600'; // "Preparing" equivalent
            case 'in_progress': return 'bg-yellow-600 text-white hover:bg-yellow-700'; // "Preparing"
            case 'ready':
                return order.delivery_option === 'delivery'
                    ? 'bg-green-600 text-white hover:bg-green-700' // "Delivery"
                    : 'bg-green-500 text-white hover:bg-green-600'; // "Pickup"
            case 'out_for_delivery': return 'bg-blue-600 text-white hover:bg-blue-700';
            case 'delivered': return 'bg-gray-500 text-white';
            default: return 'bg-gray-200 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'New';
            case 'confirmed': return 'Confirmed';
            case 'in_progress': return 'Preparing';
            case 'ready': return order.delivery_option === 'delivery' ? 'Delivery' : 'Pickup';
            case 'out_for_delivery': return 'On Way';
            case 'delivered': return 'Done';
            default: return status;
        }
    };

    const statusColor = getStatusColor(order.status);
    const statusLabel = getStatusLabel(order.status);

    const renderActions = () => {
        if (order.status === 'pending') {
            return (
                <Button onClick={() => onAction(order.id, 'confirm')} className="w-full bg-black text-white hover:bg-gray-800 rounded-xl h-10">
                    Accept Order
                </Button>
            );
        }
        if (order.status === 'confirmed') {
            return (
                <Button onClick={() => onAction(order.id, 'start')} className="w-full bg-yellow-500 text-white hover:bg-yellow-600 rounded-xl h-10">
                    Start Baking
                </Button>
            );
        }
        if (order.status === 'in_progress') {
            return (
                <Button onClick={() => onAction(order.id, 'ready')} className="w-full bg-green-600 text-white hover:bg-green-700 rounded-xl h-10">
                    Mark Ready
                </Button>
            );
        }
        if (order.status === 'ready') {
            return (
                <Button onClick={() => onAction(order.id, order.delivery_option === 'delivery' ? 'delivery' : 'complete')} className="w-full bg-orange-500 text-white hover:bg-orange-600 rounded-xl h-10">
                    {order.delivery_option === 'delivery' ? 'Dispatch Driver' : 'Complete Pickup'}
                </Button>
            );
        }
        return null;
    };


    return (
        <div className={cn(
            "rounded-2xl p-5 shadow-sm border flex flex-col gap-4 font-sans hover:shadow-md transition-shadow",
            variant === 'dark'
                ? "bg-[#1f2937] border-slate-700/50 text-white"
                : "bg-white border-gray-100 text-gray-900"
        )}>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className={cn(
                        "h-10 w-10 rounded-full overflow-hidden border relative",
                        variant === 'dark' ? "bg-slate-700 border-slate-600" : "bg-gray-100 border-gray-200"
                    )}>
                        {order.reference_image_path ? (
                            <img
                                src={`https://vrjamzkgpmyfqjqtozya.supabase.co/storage/v1/object/public/orders/${order.reference_image_path}`}
                                alt="Ref"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.customer_name}`}
                                alt="Avatar"
                                className="h-full w-full object-cover"
                            />
                        )}
                    </div>
                    <div>
                        <h3 className={cn("font-bold leading-tight", variant === 'dark' ? "text-white" : "text-gray-900")}>
                            {order.customer_name}
                        </h3>
                        <p className={cn("text-xs", variant === 'dark' ? "text-slate-400" : "text-gray-500")}>
                            #{order.order_number}
                        </p>
                    </div>
                </div>

                <Badge className={cn("px-3 py-1 rounded-full text-xs font-bold border-none", statusColor)}>
                    {statusLabel}
                </Badge>
            </div>

            {/* Info Grid */}
            <div className={cn(
                "grid grid-cols-2 gap-y-2 gap-x-4 text-xs border-b pb-4",
                variant === 'dark' ? "text-slate-400 border-slate-700/50" : "text-gray-500 border-gray-100"
            )}>
                <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(parseISO(order.date_needed), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{format(parseISO(`2000-01-01T${order.time_needed}`), 'h:mm a')}</span>
                </div>
                {getUrgency() > 0 && (
                    <div className={cn("col-span-2 flex items-center gap-2 font-medium mt-1", variant === 'dark' ? "text-amber-400" : "text-amber-600")}>
                        <Clock className="h-3.5 w-3.5" />
                        <span>Due in {getUrgency()} mins</span>
                    </div>
                )}
            </div>

            {/* Items List */}
            <div className="flex-1 space-y-3">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                        <span className={cn(
                            "font-bold min-w-[20px]",
                            variant === 'dark' ? "text-green-400" : "text-green-600"
                        )}>
                            {item.quantity}x
                        </span>
                        <div className="flex-1">
                            <p className={cn("font-medium", variant === 'dark' ? "text-slate-200" : "text-gray-800")}>
                                {item.name}
                            </p>
                            {item.selected_modifiers && item.selected_modifiers.length > 0 && (
                                <p className={cn("text-xs mt-0.5", variant === 'dark' ? "text-slate-500" : "text-gray-500")}>
                                    {item.selected_modifiers.map(m => m.name).join(', ')}
                                </p>
                            )}
                            {item.special_instructions && (
                                <p className="text-xs text-amber-500 italic mt-0.5">
                                    "{item.special_instructions}"
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className={cn("pt-4 border-t flex gap-2", variant === 'dark' ? "border-slate-700/50" : "border-gray-100")}>
                {!isReadOnly && renderActions()}
            </div>
        </div>
    );
}
