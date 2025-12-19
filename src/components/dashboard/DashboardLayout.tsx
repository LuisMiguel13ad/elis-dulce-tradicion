import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw, LayoutDashboard, Calendar, ShoppingBag, Menu as MenuIcon, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  showTabs?: boolean;
}

const DashboardLayout = ({ 
  children, 
  title, 
  onRefresh, 
  isRefreshing = false,
  showTabs = true
}: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getActiveTab = () => {
    if (location.pathname.includes('owner-dashboard')) return 'owner';
    if (location.pathname.includes('bakery-dashboard')) return 'orders';
    if (location.pathname.includes('kitchen-display')) return 'kitchen';
    return 'orders';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Universal Dashboard Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            {/* Logo or Brand */}
            <div className="flex items-center gap-2 font-bold text-xl text-primary">
              <LayoutDashboard className="h-6 w-6" />
              <span className="hidden md:inline-block">Eli's Dashboard</span>
            </div>
            
            <div className="h-6 w-px bg-border mx-2 hidden md:block" />
            
            <h1 className="font-semibold text-lg">{title}</h1>
          </div>

          {/* Navigation Tabs (Optional - mainly for Owner/Manager to switch views) */}
          {showTabs && user?.role === 'owner' && (
            <div className="hidden lg:flex items-center justify-center flex-1 mx-4">
              <div className="flex bg-muted/50 p-1 rounded-lg">
                <Button 
                    variant={location.pathname === '/owner-dashboard' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    onClick={() => navigate('/owner-dashboard')}
                    className="gap-2"
                >
                    <Settings className="h-4 w-4" />
                    Owner
                </Button>
                <Button 
                    variant={location.pathname === '/bakery-dashboard' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    onClick={() => navigate('/bakery-dashboard')}
                    className="gap-2"
                >
                    <ShoppingBag className="h-4 w-4" />
                    Orders
                </Button>
                <Button 
                    variant={location.pathname === '/kitchen-display' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    onClick={() => navigate('/kitchen-display')}
                    className="gap-2"
                >
                    <MenuIcon className="h-4 w-4" />
                    Kitchen
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
             {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{t('Actualizar', 'Refresh')}</span>
              </Button>
            )}
            
            <LanguageToggle />
            
            <div className="h-6 w-px bg-border mx-1" />
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Guest'}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto p-4 md:p-6 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

