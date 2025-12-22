/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, MapPin, Phone, Mail, Calendar, Package, UserPlus, Share2, CalendarPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useShare } from '@/hooks/useShare';
import { useAddToCalendar } from '@/hooks/useAddToCalendar';
import { useIsMobile } from '@/hooks/use-mobile';

const OrderConfirmation = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { shareOrder } = useShare();
  const { addOrderToCalendar } = useAddToCalendar();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const paymentId = searchParams.get('paymentId');
  const orderNumberParam = searchParams.get('orderNumber');
  const checkoutId = searchParams.get('checkoutId') || sessionStorage.getItem('checkoutId');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        // If we have a payment ID, verify payment and get order
        if (paymentId) {
          try {
            const verifyResponse = await api.verifyPayment(paymentId);
            
            if (verifyResponse.verified && verifyResponse.order) {
              setOrder(verifyResponse.order);
              // Clear session storage
              sessionStorage.removeItem('pendingOrder');
              sessionStorage.removeItem('checkoutId');
              sessionStorage.removeItem('squareOrderId');
              return;
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
          }
        }

        // If we have an order number, fetch by order number
        if (orderNumberParam) {
          try {
            const order = await api.getOrderByNumber(orderNumberParam);
            setOrder(order);
            return;
          } catch (error) {
            console.error('Error fetching order by number:', error);
          }
        }

        // Fallback: Try to get order from sessionStorage
        const pendingOrderData = sessionStorage.getItem('pendingOrder');
        
        if (pendingOrderData) {
          const orderData = JSON.parse(pendingOrderData);
          setOrder({
            ...orderData,
            order_number: orderNumberParam || `ORD-${Date.now()}`,
            payment_status: paymentId ? 'paid' : 'pending',
            status: paymentId ? 'confirmed' : 'pending'
          });
        } else {
          toast.error(
            t(
              'No se encontró información de la orden.',
              'Order information not found.'
            )
          );
          navigate('/order');
        }
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error(
          t(
            'Error al cargar la información de la orden.',
            'Error loading order information.'
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [paymentId, orderNumberParam, navigate, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-muted-foreground">
                {t('Cargando confirmación...', 'Loading confirmation...')}
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-destructive mb-4">
                {t('No se encontró la orden.', 'Order not found.')}
              </p>
              <Button onClick={() => navigate('/order')}>
                {t('Volver al Formulario', 'Back to Form')}
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            {/* Success Header */}
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h1 className="mb-2 font-display text-4xl font-bold text-gradient-gold">
                {t('¡Orden Confirmada!', 'Order Confirmed!')}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t(
                  'Gracias por tu pedido. Te hemos enviado un email de confirmación.',
                  "Thank you for your order. We've sent you a confirmation email."
                )}
              </p>
            </div>

            {/* Order Details Card */}
            <div className="mb-6 rounded-2xl border bg-card p-6 shadow-lg">
              <div className="mb-6 border-b pb-4">
                <h2 className="mb-2 font-display text-2xl font-bold">
                  {t('Detalles de la Orden', 'Order Details')}
                </h2>
                <p className="font-mono text-sm text-muted-foreground">
                  {t('Número de Orden', 'Order Number')}: {order.order_number || 'Pending...'}
                </p>
              </div>

              <div className="space-y-4">
                {/* Customer Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Package className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">{t('Cliente', 'Customer')}</p>
                      <p className="text-muted-foreground">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">{t('Teléfono', 'Phone')}</p>
                      <p className="text-muted-foreground">{order.customer_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">{t('Email', 'Email')}</p>
                      <p className="text-muted-foreground">{order.customer_email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">{t('Fecha y Hora', 'Date & Time')}</p>
                      <p className="text-muted-foreground">
                        {order.date_needed} {order.time_needed}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cake Details */}
                <div className="mt-6 border-t pt-4">
                  <h3 className="mb-4 font-display text-xl font-bold">
                    {t('Detalles del Pastel', 'Cake Details')}
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-semibold">{t('Tamaño', 'Size')}</p>
                      <p className="text-muted-foreground">{order.cake_size}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t('Relleno', 'Filling')}</p>
                      <p className="text-muted-foreground">{order.filling}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t('Tema', 'Theme')}</p>
                      <p className="text-muted-foreground">{order.theme}</p>
                    </div>
                    {order.dedication && (
                      <div>
                        <p className="text-sm font-semibold">{t('Dedicatoria', 'Dedication')}</p>
                        <p className="text-muted-foreground">{order.dedication}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mt-6 border-t pt-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {t('Método de Entrega', 'Delivery Method')}
                      </p>
                      <p className="text-muted-foreground">
                        {order.delivery_option === 'delivery' 
                          ? t('Entrega a Domicilio', 'Delivery')
                          : t('Recoger en Tienda', 'Pickup')}
                      </p>
                      {order.delivery_option === 'delivery' && order.delivery_address && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {order.delivery_address}
                          {order.delivery_apartment && `, ${order.delivery_apartment}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mt-6 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{t('Total Pagado', 'Total Paid')}</p>
                    <p className="font-display text-2xl font-bold text-primary">
                      ${order.total_amount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{t('Pago Confirmado', 'Payment Confirmed')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="mb-6 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">
                    {t('Estado de la Orden', 'Order Status')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t(
                      'Tu orden ha sido recibida y está siendo procesada. Recibirás una notificación cuando esté lista.',
                      'Your order has been received and is being processed. You will receive a notification when it\'s ready.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1 min-h-[44px]"
              >
                {t('Volver al Inicio', 'Back to Home')}
              </Button>
              <Button
                onClick={() => navigate('/order')}
                className="flex-1 min-h-[44px]"
              >
                {t('Hacer Otro Pedido', 'Place Another Order')}
              </Button>
            </div>

            {/* Mobile Actions: Share & Calendar */}
            {isMobile && order && (
              <div className="mt-4 flex gap-3">
                <Button
                  onClick={async () => {
                    const trackingUrl = `${window.location.origin}/order-tracking?orderNumber=${order.order_number}`;
                    const result = await shareOrder(order.order_number, trackingUrl);
                    if (result.success) {
                      toast.success(t('Orden compartida', 'Order shared'));
                    }
                  }}
                  variant="outline"
                  className="flex-1 min-h-[44px]"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  {t('Compartir', 'Share')}
                </Button>
                <Button
                  onClick={() => {
                    if (order.date_needed && order.time_needed) {
                      addOrderToCalendar(
                        order.order_number,
                        new Date(order.date_needed),
                        order.time_needed,
                        order.delivery_option === 'pickup' 
                          ? "324 W Marshall St, Norristown, PA 19401"
                          : order.delivery_address
                      );
                      toast.success(t('Añadido al calendario', 'Added to calendar'));
                    }
                  }}
                  variant="outline"
                  className="flex-1 min-h-[44px]"
                >
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  {t('Calendario', 'Calendar')}
                </Button>
              </div>
            )}

            {/* Guest Checkout - Offer Account Creation */}
            {!user && order && (
              <Card className="mt-6 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    {t('Crea una Cuenta', 'Create an Account')}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      'Crea una cuenta para ver tu historial de pedidos, guardar direcciones y más',
                      'Create an account to view your order history, save addresses, and more'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {t('Email de la orden', 'Order email')}: {order.customer_email}
                    </p>
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link to={`/signup?email=${encodeURIComponent(order.customer_email)}`}>
                          {t('Crear Cuenta', 'Create Account')}
                        </Link>
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/')}>
                        {t('Más Tarde', 'Later')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;

