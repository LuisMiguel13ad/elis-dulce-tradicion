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
        const tax = 0; // Tax calculation if needed
        
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

        // Initialize card payment
        const cardPayment = await createCardPayment(payments);
        setCard(cardPayment);
        
        // Mount card element
        if (cardContainerRef.current) {
          await cardPayment.attach(cardContainerRef.current);
        }

        // Initialize Google Pay if available
        if (isGooglePayAvailable()) {
          try {
            const googlePayPayment = await createGooglePay(payments);
            setGooglePay(googlePayPayment);
          } catch (err) {
            console.log('Google Pay not available:', err);
          }
        }

        // Initialize Apple Pay if available
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

    // Cleanup
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
      // Tokenize card
      const tokenResult = await card.tokenize();
      
      if (tokenResult.status === 'OK') {
        const token = tokenResult.token;
        
        // Process payment on backend
        const response = await api.createPayment({
          sourceId: token,
          amount: Math.round(pendingPayment.totalAmount * 100), // Convert to cents
          orderData: pendingPayment.orderData,
          idempotencyKey: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        });

        if (response.success) {
          setPaymentId(response.paymentId);
          
          // Verify payment
          const verifyResponse = await api.verifyPayment(response.paymentId);
          
          if (verifyResponse.verified) {
            // Clear session storage
            sessionStorage.removeItem('pendingOrder');
            sessionStorage.removeItem('checkoutId');
            sessionStorage.removeItem('squareOrderId');
            
            // Redirect to confirmation
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { orderData, totalAmount, basePrice, deliveryFee, tax } = pendingPayment;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CreditCard className="h-8 w-8" />
              </div>
              <h1 className="font-display text-4xl font-bold text-gradient-gold">
                {t('Información de Pago', 'Payment Information')}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {t(
                  'Completa tu pago de forma segura',
                  'Complete your payment securely'
                )}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Payment Form */}
              <Card className="space-y-6">
                <CardHeader>
                  <CardTitle>{t('Método de Pago', 'Payment Method')}</CardTitle>
                  <CardDescription>
                    {t(
                      'Selecciona tu método de pago preferido',
                      'Select your preferred payment method'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Digital Wallets */}
                  {(googlePay || applePay) && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">{t('Pagos Rápidos', 'Quick Payments')}</p>
                      <div className="flex gap-3">
                        {googlePay && (
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDigitalWalletPayment(googlePay, 'Google Pay')}
                            disabled={isProcessing}
                          >
                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Google Pay
                          </Button>
                        )}
                        {applePay && (
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDigitalWalletPayment(applePay, 'Apple Pay')}
                            disabled={isProcessing}
                          >
                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                            </svg>
                            Apple Pay
                          </Button>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            {t('O', 'OR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Payment Form */}
                  <div className="space-y-4">
                    <p className="text-sm font-medium">{t('Tarjeta de Crédito', 'Credit Card')}</p>
                    
                    <div 
                      id="card-container" 
                      ref={cardContainerRef}
                      className="min-h-[200px] rounded-lg border bg-background p-4"
                    >
                      {!card && (
                        <div className="flex h-full items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-primary" />
                        {t('Transacción segura con cifrado SSL', 'Secure transaction with SSL encryption')}
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        {t('Procesado por Square - No almacenamos tu información de tarjeta', 'Processed by Square - We do not store your card information')}
                      </div>
                    </div>

                    <Button
                      type="button"
                      className="w-full bg-primary text-secondary"
                      onClick={handleCardPayment}
                      disabled={isProcessing || !card}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t('Procesando...', 'Processing...')}
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-5 w-5" />
                          {t('Pagar', 'Pay')} ${totalAmount.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('Resumen de la Orden', 'Order Summary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-display text-xl font-bold">{orderData.customer_name}</h3>
                    <p className="text-sm text-muted-foreground">{orderData.customer_email}</p>
                    <p className="text-sm text-muted-foreground">{orderData.customer_phone}</p>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('Fecha', 'Date')}:</span>
                      <span className="font-semibold">{orderData.date_needed} {orderData.time_needed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('Tamaño', 'Size')}:</span>
                      <span className="font-semibold">{orderData.cake_size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('Relleno', 'Filling')}:</span>
                      <span className="font-semibold">{orderData.filling}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('Tema', 'Theme')}:</span>
                      <span className="font-semibold">{orderData.theme}</span>
                    </div>
                    {orderData.dedication && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('Dedicatoria', 'Dedication')}:</span>
                        <span className="font-semibold italic">"{orderData.dedication}"</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      {orderData.delivery_option === 'delivery' ? (
                        <Truck className="h-4 w-4 text-primary" />
                      ) : (
                        <Home className="h-4 w-4 text-primary" />
                      )}
                      <span className="text-muted-foreground">{t('Entrega', 'Delivery')}:</span>
                      <span className="font-semibold">
                        {orderData.delivery_option === 'delivery'
                          ? t('Entrega a Domicilio', 'Home Delivery')
                          : t('Recoger en Tienda', 'Store Pickup')}
                      </span>
                    </div>
                    {orderData.delivery_address && (
                      <div className="rounded-lg bg-muted/50 p-3 text-sm">
                        <p className="font-medium">{t('Dirección de Entrega', 'Delivery Address')}:</p>
                        <p className="text-muted-foreground">
                          {orderData.delivery_address}
                          {orderData.delivery_apartment && `, ${orderData.delivery_apartment}`}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('Subtotal', 'Subtotal')}:</span>
                      <span>${basePrice.toFixed(2)}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('Entrega', 'Delivery Fee')}:</span>
                        <span>${deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    {tax > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('Impuestos', 'Tax')}:</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t pt-3">
                      <span className="font-display text-xl font-bold">
                        {t('Total', 'Total')}:
                      </span>
                      <span className="font-display text-3xl font-bold text-primary">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
                    {t(
                      'Al realizar el pago aceptas nuestros términos y condiciones.',
                      'By completing this payment you agree to our terms and conditions.'
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCheckout;
