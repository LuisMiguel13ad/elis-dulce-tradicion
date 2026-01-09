import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Order } from '@/types/order';
import { Printer, FileText, Receipt, ArrowLeft, Clock, Calendar, User, Phone, MapPin } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { InvoiceTemplate } from './InvoiceTemplate';
import { ReceiptTemplate } from './ReceiptTemplate';
import { Badge } from '@/components/ui/badge';

interface PrintPreviewModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PrintPreviewModal({ order, isOpen, onClose }: PrintPreviewModalProps) {
    const invoiceRef = useRef<HTMLDivElement>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

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
                        <Button
                            onClick={handlePrintInvoice}
                            size="sm"
                            className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                        >
                            <FileText className="mr-2 h-4 w-4 text-blue-400" /> Invoice
                        </Button>
                        <Button
                            onClick={handlePrintReceipt}
                            size="sm"
                            className="bg-[#C6A649] hover:bg-[#b0933f] text-black font-bold"
                        >
                            <Receipt className="mr-2 h-4 w-4" /> Ticket
                        </Button>
                    </div>
                </div>

                {/* MAIN CONTENT: KITCHEN TICKET VIEW */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">

                    {/* LEFT: IMAGE & STATUS */}
                    <div className="w-full md:w-1/3 flex flex-col gap-4 shrink-0">
                        <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative group">
                            {order.reference_image_path ? (
                                <img
                                    src={order.reference_image_path.startsWith('http') ? order.reference_image_path : `https://rnszrscxwkdwvvlsihqc.supabase.co/storage/v1/object/public/orders/${order.reference_image_path}`}
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
                            <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">Order Status</div>
                            <Badge className={`
                        text-sm px-3 py-1 uppercase tracking-wide
                        ${order.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : ''}
                        ${order.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                        ${order.status === 'ready' ? 'bg-green-500/10 text-green-400 border-green-500/20' : ''}
                     `}>
                                {order.status}
                            </Badge>
                        </div>
                    </div>

                    {/* RIGHT: TICKET DETAILS (The "Kitchen Ticket" Look) */}
                    <div className="w-full md:w-2/3 bg-[#FAFAFA] text-black rounded-sm shadow-2xl flex flex-col max-w-2xl mx-auto relative shrink-0 mb-10">
                        {/* Vintage Paper Texture Overlay (optional css trick) */}
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
                                {/* DUE DATE SECTION */}
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

                                {/* CAKE SPECS */}
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

                                {/* DESIGN NOTES */}
                                <div>
                                    <div className="text-xs font-bold text-gray-400 uppercase mb-2">Design & Decoration</div>
                                    <div className="text-base font-medium text-gray-800 whitespace-pre-wrap leading-relaxed">
                                        {order.theme}
                                    </div>
                                    {order.dedication && (
                                        <div className="mt-4 p-3 bg-gray-100 italic text-gray-600 rounded">
                                            " {order.dedication} "
                                        </div>
                                    )}
                                </div>

                                {/* CUSTOMER */}
                                <div className="border-t-2 border-dashed border-gray-200 pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                                {order.customer_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{order.customer_name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                                    <Phone className="h-3 w-3" /> {order.customer_phone}
                                                </div>
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

                {/* HIDDEN TEMPLATES FOR PRINTING */}
                <div style={{ display: 'none' }}>
                    <InvoiceTemplate ref={invoiceRef} order={order} />
                    <ReceiptTemplate ref={receiptRef} order={order} />
                </div>

            </DialogContent>
        </Dialog>
    );
}
