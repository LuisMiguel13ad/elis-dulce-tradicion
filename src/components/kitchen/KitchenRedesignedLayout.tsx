import { KitchenSidebar } from "./KitchenSidebar";
import { cn } from "@/lib/utils";
import { Search, Bell, Clock } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface KitchenRedesignedLayoutProps {
    children: React.ReactNode;
    activeView: 'queue' | 'upcoming' | 'calendar';
    onChangeView: (view: 'queue' | 'upcoming' | 'calendar') => void;
    onLogout: () => void;
    title?: string;
}

export function KitchenRedesignedLayout({
    children,
    activeView,
    onChangeView,
    onLogout,
    title = "Orders"
}: KitchenRedesignedLayoutProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex h-screen bg-[#F3F4F6] overflow-hidden font-sans">
            {/* Sidebar - Simplified for "Club Grub" look */}
            <KitchenSidebar
                activeView={activeView}
                onChangeView={onChangeView}
                onLogout={onLogout}
                compact={true} // We will add this prop to KitchenSidebar
            />

            <main className="flex-1 flex flex-col min-w-0 bg-[#F3F4F6] p-6 lg:p-8">
                {/* Header Area */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search Bar - Visual only for layout match */}
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="pl-10 pr-4 py-2 bg-white rounded-full border-none focus:ring-2 focus:ring-green-500 shadow-sm text-sm w-64 transition-all"
                            />
                        </div>

                        {/* Time Display */}
                        <div className="flex items-center gap-2 text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium text-sm">
                                {format(currentTime, 'EEE, d MMM • h:mm a')}
                            </span>
                        </div>

                        {/* User Profile */}
                        <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm hover:bg-gray-50">
                            <Bell className="h-5 w-5 text-gray-600" />
                        </Button>

                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm cursor-pointer">
                            <AvatarImage src="/placeholder-avatar.jpg" />
                            <AvatarFallback className="bg-green-600 text-white font-bold">K</AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {children}
                </div>
            </main>
        </div>
    );
}
