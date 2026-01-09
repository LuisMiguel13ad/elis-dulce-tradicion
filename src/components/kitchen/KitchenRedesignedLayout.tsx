import { KitchenSidebar } from "./KitchenSidebar";
import { cn } from "@/lib/utils";
import { Search, Bell, Clock, Sun, Moon } from "lucide-react";
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
    darkMode?: boolean;
    onToggleTheme?: () => void;
}

export function KitchenRedesignedLayout({
    children,
    activeView,
    onChangeView,
    onLogout,
    title = "Orders",
    darkMode = false,
    onToggleTheme
}: KitchenRedesignedLayoutProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const isDarkMode = darkMode;

    return (
        <div className={cn(
            "flex h-screen overflow-hidden font-sans transition-colors duration-300",
            isDarkMode ? "bg-[#13141f]" : "bg-[#F3F4F6]"
        )}>
            {/* Sidebar */}
            <KitchenSidebar
                activeView={activeView}
                onChangeView={onChangeView}
                onLogout={onLogout}
                compact={true}
                darkMode={isDarkMode}
            />

            <main className={cn(
                "flex-1 flex flex-col min-w-0 p-6 lg:p-8 transition-colors duration-300",
                isDarkMode ? "bg-[#13141f]" : "bg-[#F3F4F6]"
            )}>
                {/* Header Area */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className={cn(
                            "text-3xl font-bold tracking-tight transition-colors",
                            isDarkMode ? "text-white" : "text-gray-900"
                        )}>{title}</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search Bar */}
                        <div className="relative hidden md:block group">
                            <Search className={cn(
                                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                                isDarkMode ? "text-slate-500 group-hover:text-slate-300" : "text-gray-400 group-hover:text-gray-600"
                            )} />
                            <input
                                type="text"
                                placeholder="Search"
                                className={cn(
                                    "pl-10 pr-4 py-2 rounded-full border-none focus:ring-2 focus:ring-green-500 shadow-sm text-sm w-64 transition-all",
                                    isDarkMode ? "bg-slate-800 text-white placeholder:text-slate-500" : "bg-white text-gray-900"
                                )}
                            />
                        </div>

                        {/* Theme Toggle Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleTheme}
                            className={cn(
                                "rounded-full shadow-sm transition-colors",
                                isDarkMode ? "bg-slate-800 text-yellow-400 hover:bg-slate-700" : "bg-white text-slate-400 hover:bg-gray-50"
                            )}
                        >
                            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </Button>

                        {/* Time Display */}
                        <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full shadow-sm transition-colors",
                            isDarkMode ? "bg-slate-800 text-slate-300" : "bg-white text-gray-500"
                        )}>
                            <Clock className="h-4 w-4" />
                            <span className="font-medium text-sm">
                                {format(currentTime, 'EEE, d MMM • h:mm a')}
                            </span>
                        </div>

                        {/* User Profile */}
                        <Button variant="ghost" size="icon" className={cn(
                            "rounded-full shadow-sm",
                            isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-white text-gray-600 hover:bg-gray-50"
                        )}>
                            <Bell className="h-5 w-5" />
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
