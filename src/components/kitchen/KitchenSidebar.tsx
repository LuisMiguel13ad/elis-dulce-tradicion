import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutGrid, ClipboardList, MessageSquare, LogOut, Search, CalendarDays } from "lucide-react";
import TransparentLogo from '@/assets/TransparentLogo.png';

interface KitchenSidebarProps {
    activeView: 'queue' | 'upcoming' | 'calendar';
    onChangeView: (view: 'queue' | 'upcoming' | 'calendar') => void;
    onLogout: () => void;
    compact?: boolean;
}

export function KitchenSidebar({ activeView, onChangeView, onLogout, compact = false }: KitchenSidebarProps) {
    // Reference image items: Menu (Grid), Orders (Clipboard), Chat, Analytics (Hidden per request), Search
    // We map 'queue' -> Orders, 'upcoming' -> Menu/Dashboard
    const menuItems = [
        {
            id: 'queue', // Main Orders view - Top priority
            label: 'Orders',
            icon: ClipboardList,
            view: 'queue' as const
        },
        {
            id: 'upcoming', // Calendar view
            label: 'Calendar',
            icon: CalendarDays,
            view: 'upcoming' as const
        },
        {
            id: 'chat',
            label: 'Messages', // Renamed from Chat
            icon: MessageSquare,
            view: 'chat' as any // Placeholder
        },
        {
            id: 'search',
            label: 'Search',
            icon: Search,
            view: 'search' as any // Placeholder
        }
    ];

    return (
        <div className={cn(
            "flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300",
            compact ? "w-20 items-center py-6" : "w-64"
        )}>
            {/* Logo Area */}
            <div className={cn("mb-8 flex justify-center", compact ? "px-0" : "px-6")}>
                <img
                    src={TransparentLogo}
                    alt="Eli's Logo"
                    className={cn("object-contain drop-shadow-md", compact ? "h-14 w-14" : "h-24 w-auto")}
                />
            </div>

            {/* Navigation */}
            <div className={cn("space-y-4 flex-1", compact ? "w-full px-3" : "px-4")}>
                {menuItems.map((item) => (
                    <Button
                        key={item.id}
                        variant="ghost"
                        className={cn(
                            "w-full transition-all duration-200 relative group",
                            compact ? "h-12 w-12 p-0 justify-center rounded-xl" : "justify-start gap-3 h-12 text-md font-medium",
                            activeView === item.view
                                ? "bg-green-50 text-green-600"
                                : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                        )}
                        onClick={() => item.view !== 'chat' && item.view !== 'search' && onChangeView(item.view)}
                    >
                        <item.icon className={cn("transition-colors", compact ? "h-6 w-6" : "h-5 w-5")} />
                        {!compact && item.label}

                        {/* Active Indicator Strip */}
                        {activeView === item.view && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-600 rounded-r-full" />
                        )}
                    </Button>
                ))}
            </div>

            {/* Footer Actions */}
            <div className={cn("mt-auto space-y-2", compact ? "w-full px-3 pb-6" : "p-6 border-t border-gray-100")}>
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full text-red-400 hover:text-red-500 hover:bg-red-50",
                        compact ? "h-12 w-12 p-0 justify-center rounded-xl" : "justify-start gap-3"
                    )}
                    onClick={onLogout}
                >
                    <LogOut className={cn(compact ? "h-5 w-5" : "h-5 w-5")} />
                    {!compact && "Log Out"}
                </Button>

                {/* User Avatar if compact */}
                {compact && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                            <img src="/placeholder-avatar.jpg" alt="User" className="h-full w-full object-cover opacity-0" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
