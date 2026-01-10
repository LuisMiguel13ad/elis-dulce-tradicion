/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Truck,
  Home
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { initializeSquarePayments, createCardPayment, createGooglePay, createApplePay, isGooglePayAvailable, isApplePayAvailable } from '@/lib/square';

interface PendingPayment {
  orderData: any;
  totalAmount: number;
  basePrice: number;
  deliveryFee: number;
  tax: number;
}

const PaymentCheckout = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const [googlePay, setGooglePay] = useState<any>(null);
  const [applePay, setApplePay] = useState<any>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const cardContainerRef = useRef<HTMLDivElement>(null);
  const paymentsRef = useRef<any>(null);

  // Load pending payment from sessionStorage or URL params
  useEffect(() => {
    const stored = sessionStorage.getItem('pendingOrder');
    const orderNumber = searchParams.get('orderNumber');

    if (!stored && !orderNumber) {
      toast.error(
        t(
          'No se encontró una orden para procesar el pago.',
          'No order found to process payment.'
        )
      );
      navigate('/order');
      return;
    }

    try {
      if (stored) {
        const orderData = JSON.parse(stored);
        const deliveryFee = orderData.delivery_option === 'delivery' ? 15 : 0;
        const basePrice = parseFloat(orderData.total_amount) - deliveryFee;
        const tax = 0;

        setPendingPayment({
          orderData,
          totalAmount: parseFloat(orderData.total_amount),
          basePrice,
          deliveryFee,
          tax,
        });
      }
    } catch (error) {
      console.error('Failed to parse pending payment', error);
      toast.error(
        t(
          'Error al cargar la información de pago.',
          'Failed to load payment information.'
        )
      );
      navigate('/order');
    }
  }, [navigate, t, searchParams]);

  // Initialize Square Payments SDK
  useEffect(() => {
    if (!pendingPayment) return;

    const initSquare = async () => {
      try {
        const payments = initializeSquarePayments();
        paymentsRef.current = payments;

        // Initialize card payment with dark theme styles if possible via Square SDK
        const cardPayment = await createCardPayment(payments);
        setCard(cardPayment);

        if (cardContainerRef.current) {
          await cardPayment.attach(cardContainerRef.current);
        }

        if (isGooglePayAvailable()) {
          try {
            const googlePayPayment = await createGooglePay(payments);
            setGooglePay(googlePayPayment);
          } catch (err) {
            console.log('Google Pay not available:', err);
          }
        }

        if (isApplePayAvailable()) {
          try {
            const applePayPayment = await createApplePay(payments);
            setApplePay(applePayPayment);
          } catch (err) {
            console.log('Apple Pay not available:', err);
          }
        }
      } catch (err) {
        console.error('Error initializing Square Payments:', err);
        setError(
          t(
            'Error al inicializar el sistema de pago. Por favor recarga la página.',
            'Error initializing payment system. Please reload the page.'
          )
        );
      }
    };

    initSquare();

    return () => {
      if (card) {
        card.destroy().catch(console.error);
      }
    };
  }, [pendingPayment, t]);

  const handleCardPayment = async () => {
    if (!card || !pendingPayment) return;

    setIsProcessing(true);
    setError(null);

    try {
      const tokenResult = await card.tokenize();

      if (tokenResult.status === 'OK') {
        const token = tokenResult.token;

        const response = await api.createPayment({
          sourceId: token,
          amount: Math.round(pendingPayment.totalAmount * 100),
          orderData: pendingPayment.orderData,
          idempotencyKey: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        });

        if (response.success) {
          setPaymentId(response.paymentId);
          const verifyResponse = await api.verifyPayment(response.paymentId);

          if (verifyResponse.verified) {
            sessionStorage.removeItem('pendingOrder');
            sessionStorage.removeItem('checkoutId');
            sessionStorage.removeItem('squareOrderId');
            navigate(`/order-confirmation?paymentId=${response.paymentId}&orderNumber=${verifyResponse.orderNumber}`);
          } else {
            throw new Error(verifyResponse.error || 'Payment verification failed');
          }
        } else {
          throw new Error(response.error || 'Payment failed');
        }
      } else {
        const errorMessage = tokenResult.errors?.[0]?.detail || 'Card tokenization failed';
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      const errorMsg = err.message ||
        t(
          'Error al procesar el pago. Por favor intente nuevamente.',
          'Error processing payment. Please try again.'
        );
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDigitalWalletPayment = async (wallet: any, walletName: string) => {
    if (!wallet || !pendingPayment) return;

    setIsProcessing(true);
    setError(null);

    try {
      const tokenResult = await wallet.tokenize();

      if (tokenResult.status === 'OK') {
        const token = tokenResult.token;

        const response = await api.createPayment({
          sourceId: token,
          amount: Math.round(pendingPayment.totalAmount * 100),
          orderData: pendingPayment.orderData,
          idempotencyKey: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        });

        if (response.success) {
          const verifyResponse = await api.verifyPayment(response.paymentId);

          if (verifyResponse.verified) {
            sessionStorage.removeItem('pendingOrder');
            navigate(`/order-confirmation?paymentId=${response.paymentId}&orderNumber=${verifyResponse.orderNumber}`);
          } else {
            throw new Error(verifyResponse.error || 'Payment verification failed');
          }
        } else {
          throw new Error(response.error || 'Payment failed');
        }
      } else {
        throw new Error(tokenResult.errors?.[0]?.detail || `${walletName} payment failed`);
      }
    } catch (err: any) {
      console.error(`${walletName} payment error:`, err);
      const errorMsg = err.message || `Error processing ${walletName} payment`;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!pendingPayment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-[#C6A649]" />
      </div>
    );
  }

  const { orderData, totalAmount, basePrice, deliveryFee, tax } = pendingPayment;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#C6A649]/30">
      <Navbar />

      <main className="pt-40 pb-24 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[#C6A649]/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <span className="inline-block px-4 py-1 rounded-full border border-[#C6A649]/30 bg-[#C6A649]/10 text-[#C6A649] text-xs font-black tracking-[0.2em] uppercase mb-6 shadow-[0_0_20px_rgba(198,166,73,0.1)]">
                {t('Seguridad Garantizada', 'Secured Checkout')}
              </span>
              <h1 className="font-display text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                {t('Finalizar', 'Complete')} <span className="text-[#C6A649]">{t('Pedido', 'Order')}</span>
              </h1>
              <p className="text-gray-400 text-lg font-light italic font-serif">
                {t(
                  'Completa tu pago de forma segura y recibe tu Dulce Tradición',
                  'Securely complete your payment and receive your Sweet Tradition'
                )}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-8 bg-red-500/10 border-red-500/30 text-red-200 rounded-2xl">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <AlertDescription className="font-bold uppercase tracking-wide text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-12 lg:grid-cols-5">
              {/* Payment Section */}
              <div className="lg:col-span-3 space-y-8">
                <Card className="border-white/10 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <CardHeader className="border-b border-white/5 pb-8">
                    <CardTitle className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                      <CreditCard className="text-[#C6A649] h-6 w-6" />
                      {t('Método de Pago', 'Payment Method')}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {t(
                        'Selecciona tu método de pago preferido',
                        'Choose how you want to pay'
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-8 space-y-8 px-8 md:px-12 pb-12">
                    {/* Fast Payments */}
                    {(googlePay || applePay) && (
                      <div className="space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest text-[#C6A649] opacity-80">{t('Express', 'Express Checkout')}</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                          {googlePay && (
                            <Button
                              type="button"
                              className="flex-1 bg-white hover:bg-white/90 text-black h-16 rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
                              onClick={() => handleDigitalWalletPayment(googlePay, 'Google Pay')}
                              disabled={isProcessing}
                            >
                              <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                              </svg>
                              Google Pay
                            </Button>
                          )}
                          {applePay && (
                            <Button
                              type="button"
                              className="flex-1 bg-white hover:bg-white/90 text-black h-16 rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
                              onClick={() => handleDigitalWalletPayment(applePay, 'Apple Pay')}
                              disabled={isProcessing}
                            >
                              <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                              </svg>
                              Apple Pay
                            </Button>
                          )}
                        </div>
                        <div className="relative py-6">
                          <div className="absolute inset-0 flex items-center md:hidden">
                            <span className="w-full border-t border-white/5" />
                          </div>
                          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                            <span className="bg-transparent px-4 text-gray-600">
                              {t('O continua con tarjeta', 'Or continue with card')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card Form */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-[#C6A649] opacity-80">{t('Tarjeta de Crédito', 'Credit/Debit Card')}</Label>
                        <div
                          id="card-container"
                          ref={cardContainerRef}
                          className="min-h-[140px] rounded-2xl border border-white/10 bg-white/5 p-6 focus-within:border-[#C6A649]/50 transition-all"
                        >
                          {!card && (
                            <div className="flex h-full items-center justify-center">
                              <Loader2 className="h-8 w-8 animate-spin text-[#C6A649]" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 border border-white/5">
                          <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="h-5 w-5 text-green-500" />
                          </div>
                          <p className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-gray-400">
                            {t('Cifrado SSL de 256 bits', '256-bit SSL Encryption')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 border border-white/5">
                          <div className="h-10 w-10 rounded-xl bg-[#C6A649]/10 flex items-center justify-center flex-shrink-0">
                            <Lock className="h-5 w-5 text-[#C6A649]" />
                          </div>
                          <p className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-gray-400">
                            {t('Certificado por Square', 'Square Certified Payment')}
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        className="w-full bg-[#C6A649] text-black hover:bg-white h-16 rounded-[1.25rem] text-lg font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(198,166,73,0.3)] hover:shadow-glow transition-all hover:scale-[1.02] mt-4"
                        onClick={handleCardPayment}
                        disabled={isProcessing || !card}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                            {t('Autorizando...', 'Authorizing...')}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-3 h-6 w-6" />
                            {t('Pagar', 'Pay Now')} ${totalAmount.toFixed(2)}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Side */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-white/10 bg-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl sticky top-40">
                  <CardHeader className="border-b border-white/5 pb-6">
                    <CardTitle className="text-xl font-black text-white uppercase tracking-tight">{t('Tu Orden', 'Your Order')}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-8 space-y-8 px-8 pb-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-[#C6A649]/10 flex items-center justify-center text-[#C6A649] font-black">
                          {orderData.customer_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-black uppercase text-sm tracking-tight">{orderData.customer_name}</p>
                          <p className="text-gray-500 text-xs font-bold">{orderData.customer_phone}</p>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 font-black uppercase tracking-widest">{t('Fecha', 'Delivery Date')}</span>
                          <span className="text-white font-bold">{orderData.date_needed} @ {orderData.time_needed}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 font-black uppercase tracking-widest">{t('Tamaño', 'Cake Size')}</span>
                          <span className="text-white font-bold">{orderData.cake_size}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 font-black uppercase tracking-widest">{t('Relleno', 'Filling')}</span>
                          <span className="text-white font-bold">{orderData.filling}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500 font-black uppercase tracking-widest">{t('Método', 'Method')}</span>
                          <span className="text-[#C6A649] font-black uppercase flex items-center gap-2">
                            {orderData.delivery_option === 'delivery' ? <Truck size={14} /> : <Home size={14} />}
                            {orderData.delivery_option === 'delivery' ? t('Envío', 'Delivery') : t('Recogida', 'Pickup')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-white/5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-bold">{t('Subtotal', 'Items Subtotal')}</span>
                        <span className="text-white font-bold">${basePrice.toFixed(2)}</span>
                      </div>
                      {deliveryFee > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 font-bold">{t('Envío', 'Delivery Fee')}</span>
                          <span className="text-white font-bold">${deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
                        <span className="text-xl font-black text-white uppercase tracking-tighter">
                          {t('Total', 'Total Amount')}:
                        </span>
                        <span className="text-4xl font-black text-[#C6A649] drop-shadow-[0_0_15px_rgba(198,166,73,0.3)]">
                          ${totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 text-center font-bold uppercase tracking-widest leading-relaxed">
                      {t(
                        'Al realizar el pago aceptas nuestras políticas de servicio y privacidad.',
                        'By paying, you agree to our terms of service and refund policies.'
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCheckout;
