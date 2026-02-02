import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    FileText,
    Settings,
    MessageSquare,
    LogOut,
    ChefHat,
    Calendar,
    Boxes,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import TransparentLogo from '@/assets/brand/logo.png';

interface OwnerSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    className?: string;
}

export const OwnerSidebar = ({ activeTab, setActiveTab, className }: OwnerSidebarProps) => {
    const { t } = useLanguage();
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        { id: 'overview', label: t('Resumen', 'Overview'), icon: LayoutDashboard },
        { id: 'orders', label: t('Pedidos', 'Orders'), icon: ShoppingBag },
        { id: 'calendar', label: t('Calendario', 'Calendar'), icon: Calendar },
        { id: 'products', label: t('Productos', 'Products'), icon: Package },
        { id: 'inventory', label: t('Inventario', 'Inventory'), icon: Boxes },
        { id: 'reports', label: t('Reportes', 'Reports'), icon: FileText },
    ];

    return (
        <div className={cn("flex h-full w-20 flex-col items-center bg-[#1a1a1a] py-8 transition-all duration-300 md:w-64 md:items-start md:px-6", className)}>
            {/* Brand Logo Area */}
            <div className="mb-10 flex w-full justify-center md:justify-start px-2">
                <img
                    src={TransparentLogo}
                    alt="Eli's Logo"
                    className="h-16 w-auto object-contain drop-shadow-lg"
                />
            </div>

            {/* Navigation Menu */}
            <nav className="flex w-full flex-1 flex-col gap-2">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "group flex w-full items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-300",
                                isActive
                                    ? "bg-[#C6A649] text-white shadow-lg shadow-[#C6A649]/20"
                                    : "text-white/60 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            <Icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", isActive && "animate-pulse-subtle")} />
                            <span className={cn("hidden font-medium md:block", isActive ? "font-bold" : "")}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="mt-auto w-full pt-6">
                <button
                    onClick={async () => {
                        await signOut();
                        navigate('/login');
                    }}
                    className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-red-400/80 transition-all hover:bg-red-500/10 hover:text-red-400"
                >
                    <LogOut className="h-6 w-6" />
                    <span className="hidden font-medium md:block">{t('Salir', 'Logout')}</span>
                </button>
            </div>
        </div>
    );
};
