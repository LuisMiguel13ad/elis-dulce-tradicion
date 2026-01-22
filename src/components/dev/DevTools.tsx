/**
 * DevTools Component - Development testing utilities
 * Only shown in development mode
 */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { seedTestOrders, seedPaidTestOrders, clearTestOrders, getAllOrders } from '@/test-orders';
import { Beaker, Trash2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const isDev = import.meta.env.DEV;

export const DevTools = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  // Auto-seed on first load if no orders exist
  useEffect(() => {
    if (!isDev) return;

    const existingOrders = getAllOrders();
    console.log('[DevTools] Checking localStorage orders:', existingOrders.length);

    if (existingOrders.length === 0) {
      console.log('[DevTools] No orders found, auto-seeding test orders...');
      const orders = seedTestOrders();
      console.log('[DevTools] Auto-seeded orders:', orders.map(o => o.order_number));
      toast.success('Auto-seeded 10 test orders for development!');
    }

    setOrderCount(getAllOrders().length);
  }, []);

  if (!isDev) return null;

  const handleSeed = () => {
    const orders = seedTestOrders();
    setOrderCount(getAllOrders().length);
    console.log('[DevTools] Seeded orders:', orders.map(o => o.order_number));
    toast.success(`Created ${orders.length} test orders!`);
    // Trigger update event
    window.dispatchEvent(new Event('mock-order-update'));
  };

  const handleClear = () => {
    clearTestOrders();
    setOrderCount(getAllOrders().length);
    toast.success('Cleared all test orders');
  };

  const handleRefresh = () => {
    window.dispatchEvent(new Event('mock-order-update'));
    setOrderCount(getAllOrders().length);
    toast.info('Refreshed order feed');
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <Card className="bg-purple-900 text-white shadow-xl border-purple-700">
        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            setOrderCount(getAllOrders().length);
          }}
          className="w-full p-3 flex items-center justify-between hover:bg-purple-800 rounded-t-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Beaker className="w-4 h-4" />
            <span className="font-bold text-sm">Dev Tools</span>
          </div>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <div className="p-3 space-y-3 border-t border-purple-700">
            <div className="text-xs text-purple-300">
              Orders in localStorage: <span className="font-bold text-white">{orderCount}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSeed}
                className="bg-green-600 hover:bg-green-700 text-white border-green-500 text-xs"
              >
                <Beaker className="w-3 h-3 mr-1" />
                Seed 10 Orders
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  seedPaidTestOrders();
                  setOrderCount(getAllOrders().length);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white border-amber-500 text-xs"
              >
                <Beaker className="w-3 h-3 mr-1" />
                Seed 5 Paid
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                className="bg-red-600 hover:bg-red-700 text-white border-red-500 text-xs col-span-2"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear All Test Data
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-500 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh Feed
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  toast.loading('Sending test email...');
                  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-confirmation`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                    },
                    body: JSON.stringify({
                      order: {
                        order_number: 'TEST-EMAIL-001',
                        customer_name: 'Test Setup',
                        customer_email: 'delivered@resend.dev', // Default safe test email
                        date_needed: new Date().toISOString(),
                        time_needed: '12:00',
                        cake_size: 'Test Size',
                        filling: 'Test Filling',
                        theme: 'Test Theme',
                        delivery_option: 'pickup',
                        total_amount: 0
                      }
                    })
                  });

                  if (res.ok) {
                    toast.dismiss();
                    toast.success('Test email sent! Check Resend logs.');
                  } else {
                    const err = await res.json();
                    toast.dismiss();
                    toast.error(`Failed: ${err.error || 'Unknown error'}`);
                    console.error(err);
                  }
                } catch (e) {
                  toast.dismiss();
                  toast.error('Network error sending email');
                  console.error(e);
                }
              }}
              className="w-full bg-slate-700 hover:bg-slate-800 text-white border-slate-600 text-xs mt-2"
            >
              <div className="flex items-center justify-center gap-1">
                <span>📧</span> Test Email Config
              </div>
            </Button>

            <div className="text-[10px] text-purple-400 text-center">
              Test orders: ORD-2001 to 2010 (spread across week)
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DevTools;
