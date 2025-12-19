/**
 * Export Button Component
 * Exports filtered orders to CSV
 */

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '@/types/order';

interface ExportButtonProps {
  orders: Order[];
  filters?: any;
  sortConfig?: any;
  className?: string;
}

export const ExportButton = ({
  orders,
  filters,
  sortConfig,
  className,
}: ExportButtonProps) => {
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    if (orders.length === 0) {
      return;
    }

    setIsExporting(true);

    try {
      // CSV headers
      const headers = [
        'Order Number',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Date Needed',
        'Time Needed',
        'Status',
        'Payment Status',
        'Total Amount',
        'Delivery Option',
        'Cake Size',
        'Filling',
        'Theme',
        'Created At',
      ];

      // CSV rows
      const rows = orders.map((order) => [
        order.order_number || '',
        order.customer_name || '',
        order.customer_email || '',
        order.customer_phone || '',
        order.date_needed || '',
        order.time_needed || '',
        order.status || '',
        order.payment_status || '',
        typeof order.total_amount === 'number'
          ? order.total_amount.toFixed(2)
          : order.total_amount || '0.00',
        order.delivery_option || '',
        order.cake_size || '',
        order.filling || '',
        order.theme || '',
        order.created_at || '',
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_export_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToCSV}
      disabled={isExporting || orders.length === 0}
      variant="outline"
      size="sm"
      className={className}
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('Exportando...', 'Exporting...')}
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {t('Exportar CSV', 'Export CSV')} ({orders.length})
        </>
      )}
    </Button>
  );
};
