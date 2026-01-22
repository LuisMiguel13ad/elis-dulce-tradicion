import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Bell, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

import { generateTestOrders } from '@/utils/generateTestData';
import { useState } from 'react';
import { Loader2, Database } from 'lucide-react';

export const DashboardHeader = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [generating, setGenerating] = useState(false);

    const handleGenerateData = async () => {
        if (confirm('Create 10 test orders?')) {
            setGenerating(true);
            await generateTestOrders(10);
            setGenerating(false);
            window.location.reload(); // Simple way to refresh all dashboards
        }
    };

    return (
        <div className="flex h-20 items-center justify-between px-8 ">
            {/* Title & Search */}
            <div className="flex flex-1 items-center gap-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {t('Bienvenido', 'Welcome back')}, <span className="text-[#C6A649]">{user?.profile?.full_name?.split(' ')[0] || 'Admin'}</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">{t('Aquí está lo que sucede hoy', "Here's what's happening today")}</p>
                </div>

                <div className="hidden max-w-md flex-1 md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder={t('Buscar menú, ordenes...', 'Search menu, orders...')}
                            className="h-11 rounded-2xl border-none bg-gray-100 pl-10 text-gray-600 transition-all focus:bg-white focus:ring-2 focus:ring-[#C6A649]/20"
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                {/* Test Data Button - Dev Only or for Demo */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateData}
                    disabled={generating}
                    className="hidden lg:flex border-[#C6A649]/30 hover:bg-[#C6A649]/10 text-[#C6A649]"
                >
                    {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                    {generating ? 'Generating...' : 'Generate Test Data'}
                </Button>

                <Button size="icon" variant="ghost" className="relative rounded-full hover:bg-gray-100">
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </Button>

                <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-100">
                    <Settings className="h-5 w-5 text-gray-600" />
                </Button>

                <div className="flex items-center gap-3 pl-2">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.profile?.full_name || 'Admin'}&background=C6A649&color=fff`} />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </div>
    );
};
