import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Order } from '@/types/order';
import { Printer, FileText, Receipt, ArrowLeft, Clock, Calendar, User, Phone, MapPin, Mail, AlertTriangle, XCircle, MessageSquare } from 'lucide-react';
import { OrderProgressStepper } from '@/components/order/OrderProgressStepper';
import { useReactToPrint } from 'react-to-print';
import { InvoiceTemplate } from './InvoiceTemplate';
import { ReceiptTemplate } from './ReceiptTemplate';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { OrderNotesSection } from './OrderNotesSection';

interface PrintPreviewModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onCancelOrder?: (order: Order) => void;
}

export function PrintPreviewModal({ order, isOpen, onClose, onCancelOrder }: PrintPreviewModalProps) {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const receiptRef = useRef<HTMLDivElement>(null);
    const [viewMode, setViewMode] = useState<'ticket' | 'invoice'>('ticket');
    const [showIssueForm, setShowIssueForm] = useState(false);
    const [issueCategory, setIssueCategory] = useState<string>('');
    const [issueDescription, setIssueDescription] = useState('');
    const [issueSubmitting, setIssueSubmitting] = useState(false);

    const handlePrintInvoice = useReactToPrint({
        content: () => invoiceRef.current,
        documentTitle: order ? `Invoice-${order.order_number}` : 'Invoice',
    });

    const handlePrintReceipt = useReactToPrint({
        content: () => receiptRef.current,
        documentTitle: order ? `Ticket-${order.order_number}` : 'Ticket',
    });

    if (!order) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[95vh] h-full flex flex-col p-0 bg-[#0f172a] text-white border-slate-800 overflow-hidden">

                {/* HEADER */}
                <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-[#1e293b] shrink-0">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white">
                                <span className="text-[#C6A649]">#{order.order_number}</span>
                                <span className="text-slate-400 font-normal">| Details & Print</span>
                            </DialogTitle>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* STATUS ACTIONS - QUICK DEV */}
                        <div className="mr-8 flex items-center gap-2 border-r border-slate-700 pr-4">
                            {order.status === 'pending' && (
                                <Button size="sm" variant="outline" className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                                    onClick={async () => {
                                        const { api } = await import('@/lib/api');
                                        await api.updateOrderStatus(order.id, 'confirmed');
                                        const { toast } = await import('sonner');
                                        toast.success('Order Confirmed');

                                        toast.info('Sending confirmation email...');
                                        api.sendOrderConfirmation(order).then(({ success, error }) => {
                                            if (success) toast.success('Confirmation email sent');
                                            else console.error('Email error:', error);
                                        });

                                        onClose();
                                    }}>
                                    Confirm
                                </Button>
                            )}
                            {(order.status === 'confirmed' || order.status === 'pending' || order.status === 'paid') && (
                                <Button size="sm" variant="outline" className="text-green-400 border-green-400/30 hover:bg-green-400/10"
                                    onClick={async () => {
                                        const { api } = await import('@/lib/api');
                                        await api.updateOrderStatus(order.id, 'ready');
                                        const { toast } = await import('sonner');

                                        toast.info('Sending ready notification email...');
                                        const { success, error } = await api.sendReadyNotification(order);

                                        if (success) {
                                            toast.success('Order Marked Ready & Email Sent');
                                        } else {
                                            toast.error('Order Ready, but Email Failed');
                                            console.error('Email error:', error);
                                        }

                                        onClose();
                                    }}>
                                    Mark Ready
                                </Button>
                            )}
                            {(order.status === 'ready' && order.delivery_option === 'delivery') && (
                                <Button size="sm" variant="outline" className="text-blue-500 border-blue-500/30 hover:bg-blue-500/10"
                                    onClick={async () => {
                                        const { api } = await import('@/lib/api');
                                        const oldStatus = order.status;
                                        await api.updateOrderStatus(order.id, 'delivered');
                                        const { toast } = await import('sonner');

                                        toast.info('Sending delivery notification email...');
                                        const { success, error } = await api.sendStatusUpdate(order, oldStatus, 'delivered');

                                        if (success) {
                                            toast.success('Order Marked Delivered & Email Sent');
                                        } else {
                                            toast.error('Order Delivered, but Email Failed');
                                            console.error('Email error:', error);
                                        }
                                        onClose();
                                    }}>
                                    Mark Delivered
                                </Button>
                            )}
                            {((order.status === 'ready' && order.delivery_option !== 'delivery') || order.status === 'delivered') && (
                                <Button size="sm" variant="outline" className="text-gray-400 border-gray-400/30 hover:bg-gray-400/10"
                                    onClick={async () => {
                                        const { api } = await import('@/lib/api');
                                        const oldStatus = order.status;
                                        await api.updateOrderStatus(order.id, 'completed');
                                        const { toast } = await import('sonner');

                                        toast.info('Sending completion notification email...');
                                        const { success, error } = await api.sendStatusUpdate(order, oldStatus, 'completed');

                                        if (success) {
                                            toast.success('Order Completed & Email Sent');
                                        } else {
                                            toast.error('Order Completed, but Email Failed');
                                            console.error('Email error:', error);
                                        }
                                        onClose();
                                    }}>
                                    Complete
                                </Button>
                            )}
                            {onCancelOrder && !['completed', 'cancelled', 'delivered'].includes(order.status) && (
                                <Button size="sm" variant="outline"
                                    className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                                    onClick={() => onCancelOrder(order)}>
                                    <XCircle className="mr-1 h-3.5 w-3.5" />
                                    Cancel Order
                                </Button>
                            )}
                            {!['completed', 'cancelled', 'delivered'].includes(order.status) && (
                                <Button size="sm" variant="outline"
                                    className={`text-red-400 border-red-400/30 hover:bg-red-400/10 ${showIssueForm ? 'bg-red-400/10' : ''}`}
                                    onClick={() => setShowIssueForm(!showIssueForm)}>
                                    <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                                    Report Issue
                                </Button>
                            )}
                        </div>


                        {/* View Toggle */}
                        <div className="flex rounded-lg overflow-hidden border border-slate-600">
                            <button
                                onClick={() => setViewMode('ticket')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                                    viewMode === 'ticket'
                                        ? 'bg-[#C6A649] text-black'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                <Receipt className="h-3.5 w-3.5" /> Ticket
                            </button>
                            <button
                                onClick={() => setViewMode('invoice')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                                    viewMode === 'invoice'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            >
                                <FileText className="h-3.5 w-3.5" /> Invoice
                            </button>
                        </div>
                        <Button
                            onClick={viewMode === 'invoice' ? handlePrintInvoice : handlePrintReceipt}
                            size="sm"
                            className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                        >
                            <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                    </div>
                </div>

                {/* Keyboard Shortcuts Hints */}
                <div className="px-3 py-1.5 border-b border-slate-800 bg-[#1e293b]/80 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mr-1">Shortcuts</span>
                    <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 text-[10px] font-mono">← Prev</kbd>
                    <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 text-[10px] font-mono">→ Next</kbd>
                    {order.status === 'pending' && (
                        <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400 text-[10px] font-mono">A Accept</kbd>
                    )}
                    {['confirmed', 'in_progress'].includes(order.status) && (
                        <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-900/40 text-green-400 text-[10px] font-mono">R Ready</kbd>
                    )}
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  {/* Report Issue Form */}
                  {showIssueForm && (
                    <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/30">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Report Issue for #{order.order_number}</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="issue-category" className="text-sm text-slate-300 mb-1.5 block">Category</Label>
                          <Select value={issueCategory} onValueChange={setIssueCategory}>
                            <SelectTrigger id="issue-category" className="bg-slate-800 border-slate-600 text-white">
                              <SelectValue placeholder="Select issue type..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Wrong order">Wrong order</SelectItem>
                              <SelectItem value="Quality issue">Quality issue</SelectItem>
                              <SelectItem value="Late delivery">Late delivery</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="issue-description" className="text-sm text-slate-300 mb-1.5 block">Description</Label>
                          <Textarea
                            id="issue-description"
                            value={issueDescription}
                            onChange={(e) => setIssueDescription(e.target.value)}
                            placeholder="Describe the issue..."
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px]"
                          />
                        </div>
                        <div className="flex gap-3 justify-end">
                          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white"
                            onClick={() => {
                              setShowIssueForm(false);
                              setIssueCategory('');
                              setIssueDescription('');
                            }}>
                            Cancel
                          </Button>
                          <Button size="sm" disabled={!issueCategory || !issueDescription.trim() || issueSubmitting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={async () => {
                              setIssueSubmitting(true);
                              try {
                                const { submitOrderIssue } = await import('@/lib/support');
                                const { api } = await import('@/lib/api');
                                const { toast } = await import('sonner');

                                const issue = await submitOrderIssue({
                                  order_id: order.id,
                                  order_number: order.order_number,
                                  customer_name: order.customer_name || 'Unknown',
                                  customer_email: order.customer_email || '',
                                  customer_phone: order.customer_phone,
                                  issue_category: issueCategory as any,
                                  issue_description: issueDescription.trim(),
                                });

                                if (issue) {
                                  toast.info('Sending issue notifications...');
                                  const { success } = await api.sendOrderIssueNotification(issue);
                                  if (success) {
                                    toast.success('Issue reported & notifications sent');
                                  } else {
                                    toast.success('Issue reported, but notification email failed');
                                  }
                                } else {
                                  toast.error('Failed to create issue record');
                                }

                                setShowIssueForm(false);
                                setIssueCategory('');
                                setIssueDescription('');
                              } catch (err) {
                                console.error('Error reporting issue:', err);
                                const { toast } = await import('sonner');
                                toast.error('Failed to report issue');
                              } finally {
                                setIssueSubmitting(false);
                              }
                            }}>
                            {issueSubmitting ? 'Submitting...' : 'Submit Issue'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewMode === 'ticket' ? (
                    /* ========== KITCHEN TICKET VIEW ========== */
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* LEFT: IMAGE & STATUS */}
                        <div className="w-full md:w-1/3 flex flex-col gap-4 shrink-0">
                            <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative group">
                                {order.reference_image_path ? (
                                    <img
                                        src={order.reference_image_path.startsWith('http') ? order.reference_image_path : `https://rnszrscxwkdwvvlsihqc.supabase.co/storage/v1/object/public/reference-images/${order.reference_image_path}`}
                                        alt="Cake Design"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                                        No Reference Photo
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-3 text-center">
                                    <p className="text-xs font-medium text-white/80">Reference Photo</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                <OrderProgressStepper order={order} darkMode={true} />
                            </div>
                        </div>

                        {/* RIGHT: TICKET DETAILS */}
                        <div className="w-full md:w-2/3 bg-[#FAFAFA] text-black rounded-sm shadow-2xl flex flex-col max-w-2xl mx-auto relative shrink-0 mb-10">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-blue-500 to-red-500 opacity-80"></div>

                            <div className="p-6 md:p-8 flex-1 font-mono text-sm leading-relaxed">
                                <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-6">
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">KITCHEN TICKET</h2>
                                    <div className="flex justify-between items-center text-xs text-gray-500 mt-2 px-2">
                                        <span>#{order.order_number}</span>
                                        <span>{order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                                        <div>
                                            <div className="text-xs font-bold text-gray-400 uppercase">Due Date</div>
                                            <div className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-red-500" />
                                                {order.date_needed}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-gray-400 uppercase">Time</div>
                                            <div className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                                                <Clock className="h-5 w-5 text-red-500" />
                                                {order.time_needed}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-orange-50 p-4 border-l-4 border-orange-400">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs font-bold text-orange-800 uppercase mb-1">Cake Size</div>
                                                <div className="text-lg font-bold text-gray-900">{order.cake_size}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-orange-800 uppercase mb-1">Flavor / Filling</div>
                                                <div className="text-lg font-bold text-gray-900">{order.filling}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase mb-2">Design & Decoration</div>
                                        <div className="text-base font-medium text-gray-800 whitespace-pre-wrap leading-relaxed">
                                            {order.theme}
                                        </div>
                                        {order.dedication && (
                                            <div className="mt-4 p-3 bg-gray-100 italic text-gray-600 rounded">
                                                &ldquo; {order.dedication} &rdquo;
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t-2 border-dashed border-gray-200 pt-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                                    {order.customer_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{order.customer_name}</div>
                                                    {order.customer_phone && (
                                                        <div className="text-xs text-gray-500 flex items-center gap-1.5">
                                                            <Phone className="h-3 w-3" />
                                                            <a href={`tel:${order.customer_phone}`} className="hover:text-gray-900 hover:underline">{order.customer_phone}</a>
                                                            <a href={`sms:${order.customer_phone}`} className="ml-1 text-gray-400 hover:text-blue-600" title="Send SMS">
                                                                <MessageSquare className="h-3 w-3" />
                                                            </a>
                                                        </div>
                                                    )}
                                                    {order.customer_email && (
                                                        <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                                            <Mail className="h-3 w-3" />
                                                            <a href={`mailto:${order.customer_email}`} className="hover:text-gray-900 hover:underline">{order.customer_email}</a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline" className={`uppercase ${order.delivery_option === 'delivery' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700'}`}>
                                                    {order.delivery_option}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  ) : (
                    /* ========== INVOICE VIEW ========== */
                    <div className="max-w-3xl mx-auto">
                      <div className="bg-white text-slate-800 rounded-lg shadow-2xl relative overflow-hidden">
                        {/* Gold accent bar */}
                        <div className="h-2 bg-gradient-to-r from-[#C6A649] via-[#E8D48B] to-[#C6A649]"></div>

                        <div className="p-6 md:p-8">
                          {/* Invoice Header */}
                          <div className="flex justify-between items-start mb-8 pb-6 border-b border-amber-500/20">
                            <div>
                              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">ELI'S</h2>
                              <p className="text-amber-600 font-medium uppercase tracking-widest text-xs">Dulce Tradici&oacute;n</p>
                            </div>
                            <div className="text-right">
                              <div className="inline-block bg-amber-50 rounded-lg px-4 py-2 border border-amber-100">
                                <div className="text-xs text-amber-800 font-bold uppercase tracking-wider mb-1">Invoice</div>
                                <div className="text-xl font-black text-amber-600">#{order.order_number}</div>
                              </div>
                              <div className="mt-2 text-sm text-slate-500">
                                {format(new Date(), 'MMMM dd, yyyy')}
                              </div>
                            </div>
                          </div>

                          {/* Customer & Event Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To</h3>
                              <div className="text-lg font-bold text-slate-900 mb-1">{order.customer_name}</div>
                              {order.customer_phone && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                                  <Phone className="h-3 w-3" />
                                  <a href={`tel:${order.customer_phone}`} className="hover:text-slate-900 hover:underline">{order.customer_phone}</a>
                                  <a href={`sms:${order.customer_phone}`} className="text-slate-400 hover:text-blue-600" title="Send SMS">
                                    <MessageSquare className="h-3 w-3" />
                                  </a>
                                </div>
                              )}
                              {order.customer_email && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                                  <Mail className="h-3 w-3" />
                                  <a href={`mailto:${order.customer_email}`} className="hover:text-slate-900 hover:underline">{order.customer_email}</a>
                                </div>
                              )}
                              {order.delivery_address && (
                                <div className="flex items-start gap-2 text-sm text-slate-600 mt-2 p-3 bg-slate-50 rounded-lg">
                                  <MapPin className="h-3 w-3 mt-1 shrink-0" />
                                  <div>
                                    <span className="font-bold text-slate-900">Delivery Address:</span><br />
                                    {order.delivery_address}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Event Details</h3>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="text-xs text-slate-500">Date Needed</div>
                                  <div className="font-bold text-slate-900">{order.date_needed}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500">Time</div>
                                  <div className="font-bold text-slate-900">{order.time_needed}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500">Service Type</div>
                                  <div className="font-bold text-amber-600 uppercase">{order.delivery_option}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500">Status</div>
                                  <div className="font-bold text-slate-900 capitalize">{order.status}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Line Items Table */}
                          <div className="mb-8">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b-2 border-slate-100">
                                  <th className="text-left py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/2">Item Description</th>
                                  <th className="text-left py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Details</th>
                                  <th className="text-right py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-slate-50">
                                  <td className="py-4">
                                    <div className="font-bold text-slate-900">Custom Cake Order</div>
                                    <div className="text-sm text-slate-500 mt-1">{order.theme} Theme</div>
                                  </td>
                                  <td className="py-4">
                                    <div className="space-y-1 text-sm text-slate-600">
                                      <div><span className="font-medium text-slate-900">Size:</span> {order.cake_size}</div>
                                      <div><span className="font-medium text-slate-900">Flavor:</span> {order.filling}</div>
                                    </div>
                                  </td>
                                  <td className="py-4 text-right font-bold text-slate-900">
                                    ${parseFloat(order.total_amount?.toString() || '0').toFixed(2)}
                                  </td>
                                </tr>
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan={2} className="pt-4 text-right text-sm font-medium text-slate-500">Subtotal</td>
                                  <td className="pt-4 text-right font-bold text-slate-900">
                                    ${(order.subtotal ?? parseFloat(order.total_amount?.toString() || '0')).toFixed(2)}
                                  </td>
                                </tr>
                                {(order.delivery_fee != null && order.delivery_fee > 0) && (
                                  <tr>
                                    <td colSpan={2} className="pt-2 text-right text-sm font-medium text-slate-500">Delivery Fee</td>
                                    <td className="pt-2 text-right font-bold text-slate-900">${order.delivery_fee.toFixed(2)}</td>
                                  </tr>
                                )}
                                <tr>
                                  <td colSpan={2} className="pt-2 text-right text-sm font-medium text-slate-500">Tax</td>
                                  <td className="pt-2 text-right font-bold text-slate-900">${(order.tax_amount ?? 0).toFixed(2)}</td>
                                </tr>
                                {(order.discount_amount != null && order.discount_amount > 0) && (
                                  <tr>
                                    <td colSpan={2} className="pt-2 text-right text-sm font-medium text-green-600">Discount</td>
                                    <td className="pt-2 text-right font-bold text-green-600">-${order.discount_amount.toFixed(2)}</td>
                                  </tr>
                                )}
                                <tr>
                                  <td colSpan={2} className="pt-4 text-right">
                                    <span className="text-lg font-bold text-amber-600">Total Due</span>
                                  </td>
                                  <td className="pt-4 text-right">
                                    <span className="text-2xl font-black text-amber-600">
                                      ${parseFloat(order.total_amount?.toString() || '0').toFixed(2)}
                                    </span>
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>

                          {/* Notes */}
                          {(order.special_instructions || order.dedication) && (
                            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 mb-6">
                              <h3 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-2">Special Instructions & Dedication</h3>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                {order.dedication && <span className="block font-medium italic mb-2">&ldquo;{order.dedication}&rdquo;</span>}
                                {order.special_instructions}
                              </p>
                            </div>
                          )}

                          {/* Payment Info */}
                          {order.payment_status && (
                            <div className="flex items-center gap-2 text-sm text-slate-500 pt-4 border-t border-slate-100">
                              <span className="font-medium">Payment:</span>
                              <Badge variant="outline" className={`capitalize ${
                                order.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600'
                              }`}>
                                {order.payment_status}
                              </Badge>
                              {order.payment_method && (
                                <span className="text-slate-400">via {order.payment_method}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* INTERNAL NOTES */}
                  <OrderNotesSection
                    orderId={order.id}
                    orderNumber={order.order_number}
                  />
                </div>

                {/* HIDDEN TEMPLATES FOR PRINTING */}
                <div style={{ display: 'none' }}>
                    <InvoiceTemplate ref={invoiceRef} order={order} />
                    <ReceiptTemplate ref={receiptRef} order={order} />
                </div>

            </DialogContent>
        </Dialog>
    );
}
