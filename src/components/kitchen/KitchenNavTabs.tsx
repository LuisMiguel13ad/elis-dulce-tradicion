import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type KitchenTab = 'all' | 'active' | 'new' | 'preparing' | 'pickup' | 'delivery' | 'done';

interface KitchenNavTabsProps {
    activeTab: KitchenTab;
    onTabChange: (tab: KitchenTab) => void;
    counts?: Record<KitchenTab, number>;
}

export function KitchenNavTabs({ activeTab, onTabChange, counts }: KitchenNavTabsProps) {
    const tabs: { id: KitchenTab; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'new', label: 'New' },
        { id: 'preparing', label: 'Preparing' },
        { id: 'pickup', label: 'Pickup' },
        { id: 'delivery', label: 'Delivery' },
        { id: 'done', label: 'Done' },
    ];

    return (
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full backdrop-blur-sm border border-white/10 w-fit">
            {tabs.map((tab) => (
                <Button
                    key={tab.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "rounded-full px-4 text-sm font-medium transition-all duration-200",
                        activeTab === tab.id
                            ? "bg-white text-black shadow-lg"
                            : "text-slate-400 hover:text-white hover:bg-white/10"
                    )}
                >
                    {tab.label}
                    {counts && counts[tab.id] > 0 && (
                        <span className={cn(
                            "ml-2 text-xs py-0.5 px-1.5 rounded-full",
                            activeTab === tab.id ? "bg-black/10 text-black" : "bg-white/10 text-white"
                        )}>
                            {counts[tab.id]}
                        </span>
                    )}
                </Button>
            ))}
        </div>
    );
}
