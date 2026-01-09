import { ReactNode } from "react";
import { KitchenSidebar } from "./KitchenSidebar";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Bell, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KitchenLayoutProps {
    children: ReactNode;
    activeView: 'queue' | 'upcoming' | 'calendar';
    onChangeView: (view: 'queue' | 'upcoming' | 'calendar') => void;
    onLogout: () => void;
    soundEnabled: boolean;
    onToggleSound: () => void;
}

export default function KitchenLayout({
    children,
    activeView,
    onChangeView,
    onLogout,
    soundEnabled,
    onToggleSound
}: KitchenLayoutProps) {
    const currentDate = new Date();

    return (
        <div className="flex h-screen bg-[#13141f] overflow-hidden font-sans">
            <KitchenSidebar
                activeView={activeView}
                onChangeView={onChangeView}
                onLogout={onLogout}
            />

            <main className="flex-1 flex flex-col min-w-0">
                {/* Top Header Bar */}
                <header className="h-20 border-b border-slate-800 bg-[#1a1b26]/50 backdrop-blur flex items-center justify-between px-8">
                    <div>
                        <p className="text-slate-400 text-sm font-medium">
                            {format(currentDate, 'd MMM yyyy')}
                        </p>
                        <h2 className="text-2xl font-bold text-white tracking-wide">
                            {format(currentDate, 'h:mm:ss a')}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Sound Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleSound}
                            className={`rounded-full h-10 w-10 border transition-all ${soundEnabled
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                    : "bg-slate-800 text-slate-400 border-transparent hover:text-white"
                                }`}
                        >
                            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                        </Button>

                        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-full border border-slate-700">
                            {/* Theme Toggle Placeholder - purely visual for now since we are forcing dark mode in this layout */}
                            <div className="p-2 rounded-full bg-slate-700 text-yellow-400">
                                <Sun className="h-4 w-4" />
                            </div>
                            <div className="p-2 rounded-full text-slate-400">
                                <Moon className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
