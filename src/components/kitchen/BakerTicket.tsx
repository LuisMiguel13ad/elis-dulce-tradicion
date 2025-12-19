/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Printer, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BakerTicketProps {
  order: any;
  items: any[];
  onPrint?: () => void;
}

const BakerTicket = ({ order, items, onPrint }: BakerTicketProps) => {
  const { t } = useLanguage();

  const handlePrint = () => {
    if (onPrint) onPrint();
    else window.print();
  };

  // Fallback if no configured items yet
  const displayItems = items?.length > 0 ? items : [{
    description: `${order.cake_size} - ${order.filling} - ${order.theme}`,
    notes: order.dedication
  }];

  return (
    <Card className="w-full max-w-md bg-white print:shadow-none print:border-none mx-auto overflow-hidden border-2 border-gray-200">
      {/* Ticket Header - High Contrast */}
      <div className="bg-black text-white p-4 text-center print:bg-black print:text-white">
        <h2 className="text-3xl font-black uppercase tracking-wider">Baker Ticket</h2>
        <div className="flex justify-between items-center mt-2">
          <div className="text-left">
            <p className="text-xs text-gray-400 uppercase">Order #</p>
            <p className="text-xl font-mono font-bold">
              {String(order.order_number || '').split('-')[2] || order.order_number}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase">Due Time</p>
            <p className="text-xl font-mono font-bold">{order.time_needed}</p>
          </div>
        </div>
      </div>

      {/* Critical Info Banner */}
      <div className="bg-yellow-100 p-3 flex justify-between items-center border-b border-yellow-200 print:bg-gray-100 print:border-gray-300">
        <span className="font-bold text-lg uppercase">{order.date_needed}</span>
        {order.delivery_option === 'delivery' ? (
          <Badge variant="destructive" className="text-md uppercase">DELIVERY</Badge>
        ) : (
          <Badge variant="outline" className="text-md uppercase bg-white">PICKUP</Badge>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Main Items */}
        <div className="space-y-6">
          {displayItems.map((item, idx) => (
            <div key={idx} className="space-y-2">
              {/* Configured Item Details */}
              <div className="border-l-4 border-black pl-4 py-1">
                <h3 className="text-2xl font-black leading-tight">
                  {item.description || `${order.cake_size} ${order.filling}`}
                </h3>
                {order.theme && (
                  <p className="text-lg font-bold text-gray-600 mt-1">Theme: {order.theme}</p>
                )}
              </div>

              {/* Options / Layers Grid */}
              {item.configuration_json && (
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  {Object.entries(JSON.parse(item.configuration_json)).map(([key, value]) => (
                    <div key={key} className="bg-gray-100 p-2 rounded">
                      <span className="block text-xs text-gray-500 uppercase">{key}</span>
                      <span className="font-bold">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator className="my-4 border-dashed" />

        {/* Dedication / Writing */}
        {order.dedication && (
          <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg print:border-gray-400 print:bg-white">
            <div className="flex items-center gap-2 mb-2 text-blue-800 print:text-black">
              <span className="text-xs font-bold uppercase tracking-widest">Inscription</span>
            </div>
            <p className="text-2xl font-handwriting text-center text-blue-900 py-2 print:text-black">
              "{order.dedication}"
            </p>
          </div>
        )}

        {/* Special Instructions / Allergens */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase text-gray-400">Notes</p>
          <div className="border rounded p-3 text-sm min-h-[60px]">
            {order.notes || 'No special notes.'}
          </div>
        </div>

        {/* Footer / Checks */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t mt-4">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 rounded mx-auto mb-1"></div>
            <span className="text-[10px] uppercase font-bold">Baked</span>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 rounded mx-auto mb-1"></div>
            <span className="text-[10px] uppercase font-bold">Decorated</span>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gray-300 rounded mx-auto mb-1"></div>
            <span className="text-[10px] uppercase font-bold">Checked</span>
          </div>
        </div>
      </div>

      {/* Print Button (Hidden when printing) */}
      <div className="p-4 bg-gray-50 border-t print:hidden text-center">
        <Button onClick={handlePrint} className="w-full gap-2" size="lg">
          <Printer className="h-4 w-4" /> Print Ticket
        </Button>
      </div>
    </Card>
  );
};

export default BakerTicket;

